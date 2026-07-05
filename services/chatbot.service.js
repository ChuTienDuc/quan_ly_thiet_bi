const { staff, device, history, handover } = require("../models/model");
const Groq = require("groq-sdk");

const DEVICE_TYPE_NAME = {
    case: 'Máy tính (Case PC)', monitor: 'Màn hình', wacom: 'Bảng vẽ Wacom',
    webcam: 'Webcam', headphone: 'Tai nghe', ups: 'Bộ lưu điện UPS',
    keyboard: 'Bàn phím', mouse: 'Chuột', component: 'Phụ kiện',
};

const SYSTEM_PROMPT = `Bạn là trợ lý AI hỗ trợ quản lý thiết bị IT tại công ty Minh Việt.
Nhiệm vụ: Trả lời câu hỏi về thiết bị, nhân viên, bảo hành, quy trình bàn giao bằng tiếng Việt.

Quy tắc:
- Trả lời ngắn gọn, rõ ràng, thân thiện
- Khi cần dữ liệu cụ thể (thiết bị, nhân viên, bảo hành...), hãy gọi tool phù hợp
- Nếu không tìm thấy dữ liệu, thông báo lịch sự
- Với câu hỏi về quy trình/hướng dẫn chung, trả lời trực tiếp từ kiến thức
- Định dạng số tiền theo VNĐ, ngày theo dd/mm/yyyy
- Loại thiết bị: case (máy tính), monitor (màn hình), wacom (bảng vẽ), webcam, headphone (tai nghe), ups (bộ lưu điện), keyboard (bàn phím), mouse (chuột), component (phụ kiện/linh kiện)
- Trạng thái thiết bị: 0 = đang sử dụng, 1 = sẵn sàng (trong kho), -1 = hỏng`;

const TOOLS = [
    {
        type: "function",
        function: {
            name: "lookup_staff_devices",
            description: "Tìm danh sách thiết bị đang được gán cho một nhân viên theo tên. Dùng khi người dùng hỏi về thiết bị của ai đó.",
            parameters: {
                type: "object",
                properties: {
                    staff_name: { type: "string", description: "Tên nhân viên (có thể không dấu)" }
                },
                required: ["staff_name"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "count_devices_in_stock",
            description: "Đếm số lượng thiết bị sẵn có trong kho (chưa gán cho ai) theo loại. Dùng khi hỏi còn bao nhiêu thiết bị.",
            parameters: {
                type: "object",
                properties: {
                    device_type: {
                        type: "string",
                        description: "Loại thiết bị: case, monitor, wacom, webcam, headphone, ups, keyboard, mouse, component. Để trống nếu muốn đếm tất cả.",
                    }
                },
                required: []
            }
        }
    },
    {
        type: "function",
        function: {
            name: "check_warranty_status",
            description: "Kiểm tra thiết bị sắp hết hoặc đã hết bảo hành. Dùng khi hỏi về bảo hành, hạn bảo hành.",
            parameters: {
                type: "object",
                properties: {},
                required: []
            }
        }
    },
    {
        type: "function",
        function: {
            name: "search_device_by_name",
            description: "Tìm thiết bị theo tên, serial number hoặc từ khóa. Dùng khi hỏi về một thiết bị cụ thể.",
            parameters: {
                type: "object",
                properties: {
                    keyword: { type: "string", description: "Tên hoặc serial number thiết bị" }
                },
                required: ["keyword"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_staff_info",
            description: "Tra cứu thông tin chi tiết của nhân viên theo tên. Dùng khi hỏi về thông tin nhân viên.",
            parameters: {
                type: "object",
                properties: {
                    staff_name: { type: "string", description: "Tên nhân viên" }
                },
                required: ["staff_name"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_handover_history",
            description: "Xem lịch sử bàn giao/thu hồi thiết bị của một nhân viên. Dùng khi hỏi về lịch sử bàn giao.",
            parameters: {
                type: "object",
                properties: {
                    staff_name: { type: "string", description: "Tên nhân viên" }
                },
                required: ["staff_name"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_inventory_summary",
            description: "Tổng quan tồn kho: số lượng thiết bị theo loại và trạng thái. Dùng khi hỏi về tình hình kho, thống kê thiết bị.",
            parameters: {
                type: "object",
                properties: {},
                required: []
            }
        }
    }
];

// Strip Vietnamese diacritics for fuzzy matching
function stripDiacritics(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

function buildNameRegex(name) {
    const stripped = stripDiacritics(name);
    return new RegExp(stripped.split(/\s+/).map(w => `(?=.*${w})`).join('') + '.+', 'i');
}

// Tool executor map
const toolExecutors = {
    lookup_staff_devices: async ({ staff_name }) => {
        // Try exact regex first, then stripped diacritics
        let staffList = await staff.find({ name: { $regex: staff_name, $options: 'i' } }).lean();
        if (staffList.length === 0) {
            const regex = buildNameRegex(staff_name);
            staffList = await staff.find({
                $expr: {
                    $regexMatch: {
                        input: { $replaceAll: { input: "$name", find: "đ", replacement: "d" } },
                        regex: regex.source,
                        options: 'i'
                    }
                }
            }).lean();
        }
        if (staffList.length === 0) return { found: false, message: `Không tìm thấy nhân viên "${staff_name}"` };

        const results = [];
        for (const s of staffList.slice(0, 5)) {
            const devices = await device.find({ staff: s._id, status: { $ne: -1 } })
                .select('name type status totalPrice expirationDate location')
                .lean();
            results.push({
                staffName: s.name,
                company: s.company,
                deviceCount: devices.length,
                devices: devices.map(d => ({
                    name: d.name || 'N/A',
                    type: DEVICE_TYPE_NAME[d.type] || d.type,
                    status: d.status === 1 ? 'Sẵn sàng' : d.status === 0 ? 'Đang sử dụng' : 'Hỏng',
                    price: d.totalPrice ? d.totalPrice.toLocaleString('vi-VN') + ' VNĐ' : 'N/A',
                    warranty: d.expirationDate ? new Date(d.expirationDate).toLocaleDateString('vi-VN') : 'Không có',
                }))
            });
        }
        return { found: true, results };
    },

    count_devices_in_stock: async ({ device_type }) => {
        const query = { status: 1 };
        if (device_type) query.type = device_type;
        const count = await device.countDocuments(query);

        if (device_type) {
            return { type: DEVICE_TYPE_NAME[device_type] || device_type, inStock: count };
        }

        // Group by type
        const grouped = await device.aggregate([
            { $match: { status: 1 } },
            { $group: { _id: "$type", count: { $sum: 1 } } }
        ]);
        return {
            total: count,
            byType: grouped.map(g => ({
                type: DEVICE_TYPE_NAME[g._id] || g._id,
                count: g.count
            }))
        };
    },

    check_warranty_status: async () => {
        const now = new Date();
        const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

        const devices = await device.find({
            expirationDate: { $ne: null },
            status: { $ne: -1 },
        })
        .populate({ path: "staff", select: "name" })
        .lean();

        const expired = [];
        const expiringSoon = [];
        const expiringLater = [];

        for (const d of devices) {
            const expDate = new Date(d.expirationDate);
            const daysLeft = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
            const item = {
                name: d.name || '',
                type: DEVICE_TYPE_NAME[d.type] || d.type,
                staffName: d.staff ? d.staff.name : 'Chưa gán',
                daysLeft,
            };

            if (expDate <= now) expired.push(item);
            else if (expDate <= in30Days) expiringSoon.push(item);
            else if (expDate <= in90Days) expiringLater.push(item);
        }

        expired.sort((a, b) => a.daysLeft - b.daysLeft);
        expiringSoon.sort((a, b) => a.daysLeft - b.daysLeft);
        expiringLater.sort((a, b) => a.daysLeft - b.daysLeft);

        return {
            expiredCount: expired.length,
            expiringSoonCount: expiringSoon.length,
            expiringLaterCount: expiringLater.length,
            expired: expired.slice(0, 10),
            expiringSoon: expiringSoon.slice(0, 10),
            expiringLater: expiringLater.slice(0, 5)
        };
    },

    search_device_by_name: async ({ keyword }) => {
        const devices = await device.find({
            name: { $regex: keyword, $options: 'i' }
        })
        .populate({ path: 'staff', select: 'name company' })
        .select('name type status staff totalPrice expirationDate location')
        .limit(15)
        .lean();

        if (devices.length === 0) return { found: false, message: `Không tìm thấy thiết bị "${keyword}"` };

        return {
            found: true,
            count: devices.length,
            devices: devices.map(d => ({
                name: d.name || 'N/A',
                type: DEVICE_TYPE_NAME[d.type] || d.type,
                status: d.status === 1 ? 'Sẵn sàng' : d.status === 0 ? 'Đang sử dụng' : 'Hỏng',
                staffName: d.staff ? d.staff.name : 'Chưa gán',
                price: d.totalPrice ? d.totalPrice.toLocaleString('vi-VN') + ' VNĐ' : 'N/A',
                warranty: d.expirationDate ? new Date(d.expirationDate).toLocaleDateString('vi-VN') : 'Không có',
                location: d.location ? `${d.location.address || ''} ${d.location.floor ? 'T' + d.location.floor : ''}`.trim() : 'N/A',
            }))
        };
    },

    get_staff_info: async ({ staff_name }) => {
        let staffDoc = await staff.findOne({ name: { $regex: staff_name, $options: 'i' } })
            .populate('department', 'name')
            .populate('job', 'name')
            .populate('position', 'name')
            .populate('manager', 'name')
            .lean();

        if (!staffDoc) {
            const regex = buildNameRegex(staff_name);
            staffDoc = await staff.findOne({
                $expr: {
                    $regexMatch: {
                        input: { $replaceAll: { input: "$name", find: "đ", replacement: "d" } },
                        regex: regex.source,
                        options: 'i'
                    }
                }
            })
            .populate('department', 'name')
            .populate('job', 'name')
            .populate('position', 'name')
            .populate('manager', 'name')
            .lean();
        }

        if (!staffDoc) return { found: false, message: `Không tìm thấy nhân viên "${staff_name}"` };

        const deviceCount = await device.countDocuments({ staff: staffDoc._id, status: { $ne: -1 } });

        return {
            found: true,
            name: staffDoc.name,
            company: staffDoc.company || 'N/A',
            phone: staffDoc.phoneNumber || 'N/A',
            department: staffDoc.department ? staffDoc.department.name : 'N/A',
            job: staffDoc.job ? staffDoc.job.name : 'N/A',
            position: staffDoc.position ? staffDoc.position.name : 'N/A',
            manager: staffDoc.manager ? staffDoc.manager.name : 'N/A',
            location: staffDoc.location ? `${staffDoc.location.address || ''} ${staffDoc.location.floor ? 'T' + staffDoc.location.floor : ''}`.trim() : 'N/A',
            deviceCount,
            status: staffDoc.status === 1 ? 'Đang làm việc' : 'Nghỉ việc',
        };
    },

    get_handover_history: async ({ staff_name }) => {
        let staffDoc = await staff.findOne({ name: { $regex: staff_name, $options: 'i' } }).lean();
        if (!staffDoc) {
            const regex = buildNameRegex(staff_name);
            staffDoc = await staff.findOne({
                $expr: {
                    $regexMatch: {
                        input: { $replaceAll: { input: "$name", find: "đ", replacement: "d" } },
                        regex: regex.source,
                        options: 'i'
                    }
                }
            }).lean();
        }
        if (!staffDoc) return { found: false, message: `Không tìm thấy nhân viên "${staff_name}"` };

        const histories = await history.find({ staff: staffDoc._id })
            .populate({ path: 'user', select: 'name' })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        return {
            found: true,
            staffName: staffDoc.name,
            totalRecords: histories.length,
            records: histories.map(h => ({
                type: h.type === 1 ? 'Bàn giao' : 'Thu hồi',
                date: h.createdAt ? new Date(h.createdAt).toLocaleDateString('vi-VN') : 'N/A',
                executor: h.user ? h.user.name : 'N/A',
                note: h.note || '',
                deviceCount: Array.isArray(h.device) ? h.device.length : (h.device ? 1 : 0),
            }))
        };
    },

    get_inventory_summary: async () => {
        const summary = await device.aggregate([
            {
                $group: {
                    _id: { type: "$type", status: "$status" },
                    count: { $sum: 1 }
                }
            }
        ]);

        const result = {};
        for (const item of summary) {
            const typeName = DEVICE_TYPE_NAME[item._id.type] || item._id.type;
            if (!result[typeName]) result[typeName] = { total: 0, inStock: 0, inUse: 0, broken: 0 };
            result[typeName].total += item.count;
            if (item._id.status === 1) result[typeName].inStock += item.count;
            else if (item._id.status === 0) result[typeName].inUse += item.count;
            else if (item._id.status === -1) result[typeName].broken += item.count;
        }

        const totalDevices = Object.values(result).reduce((sum, r) => sum + r.total, 0);
        return { totalDevices, byType: result };
    }
};

function getGroqClient() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return null;
    return new Groq({ apiKey });
}

const MAX_HISTORY = 20;
const MAX_TOOL_ROUNDS = 3;

class ChatbotService {
    static chat = async (session, message) => {
        const groq = getGroqClient();
        if (!groq) {
            return { reply: "Chưa cấu hình GROQ_API_KEY. Vui lòng liên hệ quản trị viên." };
        }

        // Init or trim history
        if (!session.chatHistory) session.chatHistory = [];
        session.chatHistory.push({ role: "user", content: message });
        if (session.chatHistory.length > MAX_HISTORY) {
            session.chatHistory = session.chatHistory.slice(-MAX_HISTORY);
        }

        const messages = [
            { role: "system", content: SYSTEM_PROMPT },
            ...session.chatHistory
        ];

        try {
            let round = 0;
            while (round < MAX_TOOL_ROUNDS) {
                const completion = await groq.chat.completions.create({
                    messages,
                    model: "llama-3.3-70b-versatile",
                    temperature: 0.4,
                    max_tokens: 1024,
                    tools: TOOLS,
                    tool_choice: "auto",
                });

                const choice = completion.choices[0];
                const assistantMsg = choice.message;

                // Add assistant message to conversation
                messages.push(assistantMsg);

                // If no tool calls, we're done
                if (!assistantMsg.tool_calls || assistantMsg.tool_calls.length === 0) {
                    const reply = assistantMsg.content || "Xin lỗi, tôi không thể xử lý yêu cầu này.";
                    session.chatHistory.push({ role: "assistant", content: reply });
                    if (session.chatHistory.length > MAX_HISTORY) {
                        session.chatHistory = session.chatHistory.slice(-MAX_HISTORY);
                    }
                    return { reply };
                }

                // Execute tool calls
                for (const toolCall of assistantMsg.tool_calls) {
                    const toolName = toolCall.function.name;
                    let args = {};
                    try {
                        args = JSON.parse(toolCall.function.arguments || '{}');
                    } catch (e) {
                        args = {};
                    }

                    let toolResult;
                    if (toolExecutors[toolName]) {
                        try {
                            toolResult = await toolExecutors[toolName](args);
                        } catch (err) {
                            console.error(`Chatbot tool error [${toolName}]:`, err.message);
                            toolResult = { error: `Lỗi khi thực thi: ${err.message}` };
                        }
                    } else {
                        toolResult = { error: `Tool "${toolName}" không tồn tại` };
                    }

                    messages.push({
                        role: "tool",
                        tool_call_id: toolCall.id,
                        content: JSON.stringify(toolResult)
                    });
                }

                round++;
            }

            // If we exhausted rounds, get final answer without tools
            const finalCompletion = await groq.chat.completions.create({
                messages,
                model: "llama-3.3-70b-versatile",
                temperature: 0.4,
                max_tokens: 1024,
            });

            const reply = finalCompletion.choices[0].message.content || "Xin lỗi, tôi không thể xử lý yêu cầu này.";
            session.chatHistory.push({ role: "assistant", content: reply });
            if (session.chatHistory.length > MAX_HISTORY) {
                session.chatHistory = session.chatHistory.slice(-MAX_HISTORY);
            }
            return { reply };

        } catch (error) {
            console.error('Chatbot Groq Error:', error.message);
            return { reply: "Xin lỗi, hệ thống AI đang gặp sự cố. Vui lòng thử lại sau." };
        }
    };

    static clearHistory = (session) => {
        session.chatHistory = [];
    };
}

module.exports = ChatbotService;
