class GVS {
    static escapeHTML = (str) => {
        if (!str) return '';
        return String(str).replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    static setting = (url, method, data) => {
        const meta = document.querySelector('meta[name="csrf-token"]');
        const csrfToken = meta ? meta.getAttribute('content') : null;

        return {
            url: url,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...(csrfToken && { 'CSRF-Token': csrfToken }) // chỉ thêm nếu có token
            },
            data: JSON.stringify(data),
        };
    }

    static getUserId = (cname) => {
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(";");
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == " ") {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length).replace(/"/g, '').replace(/^j:/, '');
            }
        }
        return "";
    }
    static LoginRouter = "/api/login"
    static LogOutRouter = "/api/logout"
    static GETALLDEVICE = "/api/device"
    static GetHistoryByIdDevice = "/api/history/device/"
    static GetDetailDevice = "/api/device/details/"
    static GetStaffToHanover = "/api/staff/getToStaffsHanvover"
    static Hanover = "/api/device/handover"
    static GetAllHandover = "/api/handover/getAll"
    static PrintHandoverPdf = "/api/handover/print-pdf"
    static GetHandoverById = `/api/handover`
    static UpdateDevice = "/api/device/"
    static RevokeDevice = "/api/device/revokeDevice"
    static GetDeviceByTypeAndQuantity = "/api/device/getByTypeAndQuantity"
    static GetAllSupplier = "/api/supplier"
    static GetAllDeciveByType = "/api/device/getAllByType"
    static CreateManyDevice = "/api/device/createMany"
    static CreateSupplier = "/api/supplier"
    static GetAllInventories = "/api/device/getAllInventories"
    static GetDeviceSummary = "/api/device/getSummary"
    static GetStaffSummary = "/api/staff/getSummary"
    static GetAllListUser = "/api/user/getAll"
    static CreateAccount = "/api/user"
    static UpdateAccount = "/api/user/"
    static ResetPassword = "/api/user/resetPassword/"
    static CreateStaff = "/api/staff"
    static GetStaff = "/api/staff"
    static GetHistoryStaff = "/api/history/staff/"
    static GetAllStaff = "/api/staff/getAll"
    static RevokeComponent = "/api/device/revokeComponent"
    static CreateDevice = "/api/device"
    static handoverDeviceAll = "/api/device/handoverAll"
    static revokeDeviceAll = "/api/device/revokeAll"
    static getAllHistory = "/api/history"
    static getSummaryHanoverdocOpen = "/api/handover/getSumary"
    static filterDataHandoverByUserIdandIs0pen = "/api/handover/filter"
    static GETALLJOB = "/api/job"
    static GETALLDEPARTMENT = "/api/department"
    static GETALLPOSITION = "/api/position"
    static IncreaseKeyBoardOrMouse = "/api/device/increase"
    static findByDeviceId = "/api/inventory/findByDeviceId"
    static changePassword = "/api/user/changePassword"
    static requestHandoverDevice = "/api/require-device"
    static getAllRequestDeviceByStaff = "/api/require-device/by-staff"
    static getAllRequestDevice = "/api/require-device/all"
    static ChatbotMessage = "/api/chatbot/message"
    static ChatbotClear = "/api/chatbot/clear"
    static location = [
        {
            address: "461 Vũ Tông Phan",
            company: ['Dấu Cộng', '9Pixel', 'Minh Việt'],
            floor: 8,
            job: ['Ban lãnh đạo', 'HC-KT', 'Developer', '2D artist', '2D editor', '3D modeler', '3D animator', 'UE editor', 'Content', 'Sound Designer', 'Compositor', 'Marketing', 'IT']
        },
        {
            address: "401 Vũ Tông Phan",
            company: ['Dấu Cộng', '9Pixel', 'Minh Việt'],
            floor: 8,
            job: ['Ban lãnh đạo', 'HC-KT', 'Developer', '2D artist', '2D editor', '3D modeler', '3D animator', 'UE editor', 'Content', 'Sound Designer', 'Compositor', 'Marketing', 'IT']
        },
    ]
    static ADDRESS = ["461 Vũ Tông Phan", "1C Định Công Thượng", "401 Vũ Tông Phan"]
    static COMPANY = ["Minh Việt", "Dấu Cộng", "9Pixel", "Plus Cinema"]
    // static JOB = ['IT', 'Content', '3D', '2D', 'Dựng', 'Kế Toán', 'Anim']
    static JOB = ['Ban lãnh đạo', 'HC-KT', 'Developer', '2D artist', '2D editor', '3D modeler', '3D animator', 'UE editor', 'Content', 'Sound Designer', 'Compositor', 'Marketing', 'IT']

    static FLOOR = 8

    static objRole = {
        0: 'admin',
        1: 'Kỹ thuật',
        2: 'Hành chính',
        3: 'Nhân viên'
    }
    static deputy = {
        accountant: 'Đặng Thị Tâm',
        techniqueMV: 'Nguyễn Quang Bắc',
        techniquePlus: 'Bùi Văn Dũng'
    }
    static levelManager = [1, 0]

    static nameLeaderMV = "Bùi Quang Huy"
    static nameLeaderPlus = "Vũ Duy Nam"
}
