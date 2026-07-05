const { Types } = require("mongoose");
const {
    COMPONENT_TYPE,
    COMPONENT_MESSAGE,
} = require("../GVs/component.config");
const { DEVICE, DEVICE_MESSAGE, DEVICE_TYPE } = require("../GVs/device.config");
const { HANDOVER } = require("../GVs/handover.config");
const { HISTORY } = require("../GVs/history.config");
const { INVENTORY } = require("../GVs/inventory.config");
const {
    device,
    casePC,
    wacom,
    monitor,
    component,
    supplier,
    staff,
    inventory,
    headphone,
    webcam,
    ups,
    keyboard,
    mouse,
} = require("../models/model");
const {
    BadRequestError,
    InternalServerError,
} = require("../responseHandle/error.response");
const { removeUndefinedObject, updateNestedObjectParser } = require("../utils");
const HandoverService = require("./handover.service");
const HistoryService = require("./history.service");
const InventoryService = require("./inventory.service");
const StaffService = require("./staff.service");
const _ = require("lodash");
class DeviceService {
    static deviceRegister = {};
    static registerDeviceType(type, classRef) {
        DeviceService.deviceRegister[type] = classRef;
    }

    static create = async (type, payload) => {
        const deviceClass = DeviceService.deviceRegister[type];
        if (!deviceClass) {
            throw new BadRequestError("Loại thiết bị không phù hợp!");
        }
        return new deviceClass(payload).create();
    };
    static createMany = async (payload, type) => {
        // check các trường unique của từng loại
        console.log("Create Many Type:::", type);
        const deviceClass = DeviceService.deviceRegister[type];
        if (!deviceClass) {
            throw new BadRequestError("Loại thiết bị không phù hợp!");
        }
        await deviceClass.checkUnique(payload);
        // Bắt đầu tạo
        var count = 0;
        for (let index = 0; index < payload.length; index++) {
            const element = payload[index];
            const newDevice = await DeviceService.create(element.type, {
                ...element,
            });
            if (!newDevice) {
                throw new InternalServerError("Lỗi tạo nhiều thiết bị!");
            }
            count++;
        }
        return count;
    };
    static getAll = async () => {
        const devices = await device
            .find({ status: 0 })
            .populate({
                path: "staff",
                populate: [
                    { path: "job", model: "job" },
                    { path: "department", model: "department" },
                    { path: "position", model: "position" },
                ],
            })
            .populate("supplier")
            .lean();
        const staffWithDevices = devices.reduce((result, device) => {
            const staffId = device.staff._id.toString();
            const existingStaff = result.find(
                (item) => item.staff._id.toString() === staffId
            );
            if (existingStaff) {
                existingStaff.devices.push(device);
            } else {
                result.push({
                    staff: { ...device.staff },
                    devices: [device],
                });
            }
            return result;
        }, []);
        return staffWithDevices;
    };
    static getByStaff = async (staff) => {
        const devices = await device
            .find({ status: 0, staff: staff })
            .populate({
                path: "staff",
                populate: [
                    { path: "job", model: "job" },
                    { path: "department", model: "department" },
                    { path: "position", model: "position" },
                ],
            })
            .populate("supplier")
            .lean();
        const staffWithDevices = devices.reduce((result, device) => {
            const staffId = device.staff._id.toString();
            const existingStaff = result.find(
                (item) => item.staff._id.toString() === staffId
            );
            if (existingStaff) {
                existingStaff.devices.push(device);
            } else {
                result.push({
                    staff: { ...device.staff },
                    devices: [device],
                });
            }
            return result;
        }, []);
        return staffWithDevices;
    };
    static findById = async (_id) => {
        const foundDevice = await device.findById(_id);
        if (!foundDevice) {
            throw new BadRequestError(DEVICE_MESSAGE.NOT_FOUND);
        }
        return foundDevice;
    };
    static findOneByType = async (typeDevice) => {
        return await device.findOne({ type: typeDevice });
    };
    static getCountDeviceByStaff = async (staffId) => {
        return await device.find({ staff: staffId }).count();
    };
    static handoverAll = async ({ staff, ids, note, user }) => {
        let handoverAll = await HandoverService.findByStaffAndIsOpen({
            staff,
            type: [0, 1],
        });
        if (handoverAll) {
            throw new BadRequestError(
                "Nhân viên đang có phiếu bàn giao hoặc thu hồi chưa in phiếu!"
            );
        }
        var count = 1;
        for (let i = 0; i < ids.length; i++) {
            const deviceId = ids[i];
            const deviceFound = await DeviceService.findById(deviceId);
            console.log(deviceFound);
            if (deviceFound.status != DEVICE.CAN_USE) {
                throw new BadRequestError(DEVICE_MESSAGE[deviceFound.status]);
            }

            //Kiểm tra trong kho còn không? còn thì giảm 1.
            const inventory = await InventoryService.getInventoryDevice(deviceId);
            if (inventory.quantity < count) {
                throw new BadRequestError(INVENTORY.NOT_ENOUGH);
            }
        }
        // set type
        let countDeviceByStaff = await DeviceService.getCountDeviceByStaff(staff);
        let type =
            countDeviceByStaff == 0 ? HANDOVER.HANDOVER_ALL : HANDOVER.UPDATE;

        for (let i = 0; i < ids.length; i++) {
            const deviceId = ids[i];
            await DeviceService.handover({
                staff: staff,
                deviceId: deviceId,
                user: user,
                note: note,
                type,
            });
        }
    };
    static revokeAll = async ({ idStaff, note, user }) => {
        let handoverAll = await HandoverService.findByStaffAndIsOpen({
            staff: idStaff,
            type: [0, 1],
        });
        if (handoverAll) {
            throw new BadRequestError(
                "Nhân viên đang có phiếu bàn giao hoặc thu hồi chưa in phiếu!"
            );
        }
        const mouse = await device.findOne({ type: "mouse" }).lean();
        const keyboard = await device.findOne({ type: "keyboard" }).lean();
        const infoStaff = await staff.findById(idStaff);
        if (infoStaff.mouse > 0) {
            for (let i = 0; i < infoStaff.mouse; i++) {
                await DeviceService.revokeDevice({
                    deviceId: mouse._id,
                    user: user,
                    note: note,
                    type: HANDOVER.REVOKE_ALL,
                    staffId: idStaff,
                });
            }
        }
        if (infoStaff.keyboard > 0) {
            for (let i = 0; i < infoStaff.keyboard; i++) {
                await DeviceService.revokeDevice({
                    deviceId: keyboard._id,
                    user: user,
                    note: note,
                    type: HANDOVER.REVOKE_ALL,
                    staffId: idStaff,
                });
            }
        }
        const devices = await device.find({ staff: idStaff });
        for (let i = 0; i < devices.length; i++) {
            const element = devices[i];
            await DeviceService.revokeDevice({
                deviceId: element._id,
                user: user,
                note: note,
                type: HANDOVER.REVOKE_ALL,
            });
        }
    };
    static handover = async ({
        staff,
        deviceId,
        user,
        note,
        count = 1,
        numCase = null,
        type,
    }) => {
        if (type === HANDOVER.UPDATE) {
            // nếu có phiếu bàn giao hoặc thu hồi tất thì ko được bàn giao bổ sung
            let handoverAll = await HandoverService.findByStaffAndIsOpen({
                staff,
                type: [0, 1],
            });
            if (handoverAll) {
                throw new BadRequestError(
                    "Nhân viên đang có phiếu bàn giao hoặc thu hồi chưa in phiếu!"
                );
            }
        }

        // cập nhât staff trong device
        const deviceFound = await DeviceService.findById(deviceId);
        if (deviceFound.status != DEVICE.CAN_USE) {
            throw new BadRequestError(DEVICE_MESSAGE[deviceFound.status]);
        }
        // Tìm staff theo id để gán lại địa chỉ của thiết bị
        const staffFound = await StaffService.findByIdStaff(staff);
        //Kiểm tra trong kho còn không? còn thì giảm 1.
        const inventory = await InventoryService.getInventoryDevice(deviceId);
        if (inventory.quantity < count) {
            throw new BadRequestError(INVENTORY.NOT_ENOUGH);
        }
        const deviceClass = DeviceService.deviceRegister[deviceFound.type];
        await deviceClass.handover({
            staff,
            deviceFound,
            count,
            numCase,
            note,
            user,
        });
        deviceFound.location = staffFound.location;
        // await
        // Tạo bản ghi phiếu bàn giao
        //Kiểm tra staff có phiếu bàn giao nào đang mở không
        var handoverIsOpen = await HandoverService.findByStaffAndIsOpen({ staff });
        if (handoverIsOpen) {
            handoverIsOpen.deviceHandover.push(deviceFound);
            await handoverIsOpen.save();
            return handoverIsOpen;
        } else {
            var deviceHandover = [];
            deviceHandover.push(deviceFound);

            const newHandover = await HandoverService.create({
                user,
                staff,
                type,
                deviceHandover,
                note,
            });
            return newHandover;
        }
    };
    static revokeDevice = async ({
        deviceId,
        user,
        note,
        count = 1,
        type,
        staffId,
    }) => {
        const deviceFound = await DeviceService.findById(deviceId);
        if (
            deviceFound &&
            deviceFound.status != DEVICE.IN_USE &&
            deviceFound.type != DEVICE_TYPE.KEYBOARD &&
            deviceFound.type != DEVICE_TYPE.MOUSE
        ) {
            throw new BadRequestError("Thiết bị không phù hợp!");
        }
        if (type === HANDOVER.UPDATE) {
            // nếu có phiếu bàn giao hoặc thu hồi tất thì ko được bàn giao bổ sung
            let handoverAll = await HandoverService.findByStaffAndIsOpen({
                staff: deviceFound.staff,
                type: [0, 1],
            });
            if (handoverAll) {
                throw new BadRequestError(
                    "Nhân viên đang có phiếu bàn giao hoặc thu hồi chưa in phiếu!"
                );
            }
        }
        if (
            deviceFound.type != DEVICE_TYPE.KEYBOARD &&
            deviceFound.type != DEVICE_TYPE.MOUSE
        ) {
            // Kiểm tra inventory
            const inventory = await InventoryService.getInventoryDevice(deviceId);
            if (inventory.total < inventory.quantity + count) {
                throw new BadRequestError("Số lượng thu hồi không phù hợp!");
            }
            var staff = deviceFound.staff;
            if (!staff) {
                throw new BadRequestError(
                    "Không có dữ liệu nhân viên dùng thiết bị này!"
                );
            }
            deviceFound.staff = undefined;
            deviceFound.status = DEVICE.CAN_USE;
        } else {
            // xử lý thu hồi chuột, bàn phím
            var staff = await StaffService.findByIdStaff(staffId);
            const deviceClass = DeviceService.deviceRegister[deviceFound.type];
            await deviceClass.revoke({ deviceFound, staff, count });
            await staff.save();
        }

        await deviceFound.save();

        // Tăng số lượng trong inventory
        await InventoryService.updateQuantityByDevice(deviceFound._id, count);
        // Tạo history
        await HistoryService.create({
            device: deviceFound,
            staff,
            type: HISTORY.REVOKE,
            user,
            note,
            count,
        });
        // kiểm tra phiếu bàn giao, nếu có thì thêm vào phiếu, chưa có thì tạo phiếu bàn giao mới.
        var handoverIsOpen = await HandoverService.findByStaffAndIsOpen({ staff });
        if (handoverIsOpen) {
            handoverIsOpen.deviceRevoke.push(deviceFound);
            await handoverIsOpen.save();
            return handoverIsOpen;
        } else {
            var deviceRevoke = [];
            deviceRevoke.push(deviceFound);
            const newHandover = await HandoverService.create({
                user,
                staff,
                type,
                deviceRevoke,
                note,
            });
            return newHandover;
        }
    };
    static async revokeComponent({
        numCase,
        user,
        indexOfComponent,
        typeComponent,
        note,
        count = 1,
    }) {
        // if (type === HANDOVER.UPDATE && type === '') {
        //     // nếu có phiếu bàn giao hoặc thu hồi tất thì ko được bàn giao bổ sung
        //     let handoverAll = await HandoverService.findByStaffAndIsOpen({ staff, status: [0, 1] })
        //     if (handoverAll) {
        //         throw new BadRequestError("Nhân viên đang có phiếu bàn giao hoặc thu hồi chưa in phiếu!")
        //     }
        // }
        if (!numCase) {
            throw new BadRequestError("Số máy không được trống!");
        }
        console.log(typeComponent);
        const device = await Component.revoke({
            numCase,
            indexOfComponent,
            typeComponent,
            count,
            note,
            user,
        });
        return device;
    }
    static update = async (deviceId, type, payload) => {
        const deviceClass = DeviceService.deviceRegister[type];
        if (!deviceClass) {
            throw new BadRequestError("Loại thiết bị không phù hợp!");
        }
        return new deviceClass(payload).update(deviceId);
    };
    static getAllByType = async (type, test) => {
        return await device.find({ type }).populate("supplier");
    };
    static getDetailsByType = async (_id) => {
        return await device
            .findById(_id)
            .populate("supplier")
            .populate("staff")
            .populate("user");
    };
    static getDeviceByTypeAndQuantity = async (type) => {
        const deviceClass = DeviceService.deviceRegister[type];
        if (!deviceClass) {
            throw new BadRequestError("Loại thiết bị không phù hợp!");
        }
        let query = [
            {
                $match: {
                    type: type,
                },
            },
            {
                $lookup: {
                    from: "suppliers",
                    localField: "supplier",
                    foreignField: "_id",
                    as: "supplier",
                },
            },
            {
                $unwind: {
                    path: "$supplier",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "inventories",
                    localField: "_id",
                    foreignField: "device",
                    as: "inventory",
                },
            },
            {
                $unwind: "$inventory",
            },
        ];
        if (type == DEVICE_TYPE.COMPONENT) {
            let group = {
                $group: {
                    _id: "$attributes.type",
                    devices: { $push: "$$ROOT" },
                },
            };
            query.push(group);
        }
        const deviceFound = await device.aggregate(query);
        console.log(deviceFound);
        return deviceFound;
    };
    static getSummary = async () => {
        const deviceFound = await device.aggregate([
            {
                $match: {
                    type: {
                        $ne: "component",
                    },
                },
            },
            {
                $group: {
                    _id: "$type",
                    total: { $sum: 1 },
                    not_inuse: { $sum: { $cond: [{ $eq: ["$status", 1] }, 1, 0] } },
                    error: { $sum: { $cond: [{ $eq: ["$status", -1] }, 1, 0] } },
                },
            },
        ]);
        return deviceFound;
    };
    static getDeviceToHandoverAll = async () => {
        const deviceFound = await inventory.aggregate([
            {
                $match: {
                    type: {
                        $ne: "component",
                    },
                },
            },
            {
                $group: {
                    _id: "$type",
                    device: { $push: "$$ROOT" },
                },
            },
        ]);
        return deviceFound;
    };
    static increaseKeyBoardOrMouse = async (payload, quantity) => {
        const { type } = payload;
        if (type != DEVICE_TYPE.KEYBOARD && type != DEVICE_TYPE.MOUSE) {
            throw new BadRequestError("Loại thiết bị không phù hợp!");
        }
        if (typeof quantity != "number") {
            throw new BadRequestError("Số lượng tăng giảm không phù hợp!");
        }
        if (quantity < 1) {
            throw new BadRequestError("Số lượng tăng giảm không phù hợp!");
        }
        const deviceFound = await DeviceService.findOneByType(type);
        console.log(deviceFound);
        const inventoryDeviceFound = await InventoryService.getInventoryDevice(
            deviceFound._id
        );
        if (inventoryDeviceFound.quantity + quantity < 0) {
            throw new BadRequestError("Số lượng tăng giảm không phù hợp!");
        }
        return await InventoryService.updateQuantityByDevice(
            deviceFound._id,
            quantity
        );
    };
    static countDeviceByTypeAndStatus = async (type, status) => { };
}

class Device {
    constructor({
        staff,
        name,
        supplier,
        user,
        type,
        location,
        attributes,
        totalPrice,
        billPrice,
        expirationDate,
        note,
        total = 1,
        status,
    }) {
        this.staff = staff;
        this.name = name;
        this.supplier = supplier;
        this.user = user;
        this.type = type;
        this.location = location;
        this.attributes = attributes;
        this.totalPrice = totalPrice;
        this.billPrice = billPrice;
        this.expirationDate = expirationDate;
        this.note = note;
        if (total == 0) {
            total = 1;
        }
        this.total = total;
        this.status = status;
    }
    async create(_id = null) {
        const payload = _id ? { ...this, _id } : { ...this };
        const newDevice = await device.create(payload);
        if (newDevice) {
            await InventoryService.create({
                device: newDevice._id,
                total: this.total,
            });
            return newDevice;
        }
        throw new BadRequestError("Tạo thiết bị lỗi!");
    }
    async update(deviceId, payload) {
        return await updateDeviceById({ deviceId, payload, model: device });
    }
    static updateWithQuery = async (_id, query) => {
        await device.updateOne({ _id: new Types.ObjectId(_id), query });
    };
    static async getDeviceByNumCase(numCase) {
        const deviceFound = await device.findOne({
            "attributes.num": numCase,
            type: "case",
        });
        if (!deviceFound) {
            throw new BadRequestError("Không tìm thấy thiết bị");
        }
        return deviceFound;
    }
}

class CasePC extends Device {
    async create() {
        const newCase = await casePC.create(this.attributes);
        if (!newCase) {
            throw new BadRequestError("Create CasePC error!");
        }
        const newDevice = await super.create(newCase._id);
        if (!newDevice) {
            throw new BadRequestError("Tạo thiết bị lỗi!");
        }
        return newDevice;
    }
    async update(deviceId) {
        const objParams = removeUndefinedObject(this);
        if (objParams.attributes) {
            await updateDeviceById({
                deviceId,
                payload: updateNestedObjectParser(objParams.attributes),
                model: casePC,
            });
        }
        const updateDevice = await super.update(
            deviceId,
            updateNestedObjectParser(objParams)
        );
        return updateDevice;
    }
    static async handover({ deviceFound, count, staff, note, user }) {
        await setDeviceStaff({ deviceFound, count, staff, note, user });
    }
    static async findByNum(numOfCase) {
        const caseFound = casePC.findOne({ num: numOfCase });
        if (!caseFound) {
            throw new BadRequestError(`Lỗi không tìm thấy case số ${numOfCase}!`);
        }
        return caseFound;
    }
    static async checkUnique(payload) {
        // kiểm tra trùng số máy gửi lên
        const hasDuplicateNum = payload.some((obj, index) => {
            return (
                payload.findIndex((innerObj, innerIndex) => {
                    return (
                        innerObj.attributes.num === obj.attributes.num &&
                        innerIndex !== index
                    );
                }) !== -1
            );
        });
        if (hasDuplicateNum) {
            throw new BadRequestError("Trùng số máy gửi lên!");
        }

        // check xem số máy đã tồn tại trên hệ thống chưa?
        let nums = await getAllNum(casePC);
        console.log(nums);
        const existsDevice = payload.some((_) => nums.includes(_.attributes.num));
        console.log("exists:::", existsDevice);
        if (existsDevice) {
            throw new BadRequestError("Số máy đã tồn tài trên hệ thống!");
        }
    }
}
class Wacom extends Device {
    async create() {
        const newWacom = await wacom.create(this.attributes);
        if (!newWacom) {
            throw new BadRequestError("Create wacom error!");
        }
        const newDevice = await super.create(newWacom._id);
        if (!newDevice) {
            throw new BadRequestError("Tạo thiết bị lỗi!");
        }
        return newDevice;
    }
    async update(deviceId) {
        const objParams = removeUndefinedObject(this);
        if (objParams.attributes) {
            await updateDeviceById({
                deviceId,
                payload: updateNestedObjectParser(objParams.attributes),
                model: wacom,
            });
        }
        const updateDevice = await super.update(
            deviceId,
            updateNestedObjectParser(objParams)
        );
        return updateDevice;
    }
    static async handover({ deviceFound, count, staff, note, user }) {
        await setDeviceStaff({ deviceFound, count, staff, note, user });
    }
    static async checkUnique(payload) {
        // kiểm tra trùng số máy gửi lên
        const hasDuplicateNum = payload.some((obj, index) => {
            return (
                payload.findIndex((innerObj, innerIndex) => {
                    return (
                        innerObj.attributes.num === obj.attributes.num &&
                        innerIndex !== index
                    );
                }) !== -1
            );
        });
        if (hasDuplicateNum) {
            throw new BadRequestError("Trùng số wacom gửi lên!");
        }

        // kiểm tra trùng số seri gửi lên
        const hasDuplicateSeri = payload.some((obj, index) => {
            return (
                payload.findIndex((innerObj, innerIndex) => {
                    return (
                        innerObj.attributes.seriesNumber === obj.attributes.seriesNumber &&
                        innerIndex !== index
                    );
                }) !== -1
            );
        });
        if (hasDuplicateSeri) {
            throw new BadRequestError("Trùng số seri wacom gửi lên!");
        }

        // check xem số máy, số seri đã tồn tại trên hệ thống chưa?
        let nums = await getAllNum(wacom);
        let seris = await getAllNum(wacom, "seriesNumber");
        console.log(nums);
        const existsDevice = payload.some(
            (_) =>
                nums.includes(_.attributes.num) ||
                seris.includes(_.attributes.seriesNumber)
        );
        console.log("exists:::", existsDevice);
        if (existsDevice) {
            throw new BadRequestError("Wacom đã tồn tài trên hệ thống!");
        }
    }
}
class Monitor extends Device {
    async create() {
        const newMonitor = await monitor.create(this.attributes);
        if (!newMonitor) {
            throw new BadRequestError("Create monitor error!");
        }
        const newDevice = await super.create(newMonitor._id);
        if (!newDevice) {
            throw new BadRequestError("Tạo thiết bị lỗi!");
        }
        return newDevice;
    }
    static async handover({ deviceFound, count, staff, note, user }) {
        await setDeviceStaff({ deviceFound, count, staff, note, user });
    }
    async update(deviceId) {
        const objParams = removeUndefinedObject(this);
        if (objParams.attributes) {
            await updateDeviceById({
                deviceId,
                payload: updateNestedObjectParser(objParams.attributes),
                model: monitor,
            });
        }
        const updateDevice = await super.update(
            deviceId,
            updateNestedObjectParser(objParams)
        );
        return updateDevice;
    }
    static async checkUnique(payload) {
        // kiểm tra trùng số máy gửi lên
        const hasDuplicateNum = payload.some((obj, index) => {
            return (
                payload.findIndex((innerObj, innerIndex) => {
                    return (
                        innerObj.attributes.num === obj.attributes.num &&
                        innerIndex !== index
                    );
                }) !== -1
            );
        });
        if (hasDuplicateNum) {
            throw new BadRequestError("Trùng số màn gửi lên!");
        }

        // check xem số máy đã tồn tại trên hệ thống chưa?
        let nums = await getAllNum(monitor);
        console.log(nums);
        const existsDevice = payload.some((_) => nums.includes(_.attributes.num));
        console.log("exists:::", existsDevice);
        if (existsDevice) {
            throw new BadRequestError("Số màn đã tồn tài trên hệ thống!");
        }
    }
}
class Component extends Device {
    static componentType = {};
    static registerComponentType(type, classRef) {
        Component.componentType[type] = classRef;
    }
    async create() {
        var typeComponent = this.attributes.type;
        if (!Component.componentType[typeComponent]) {
            throw new BadRequestError(COMPONENT_MESSAGE.NOT_EXISTS_TYPE);
        }
        const newComponent = await component.create(this.attributes);
        if (!newComponent) {
            throw new BadRequestError("Tạo linh kiện lỗi!");
        }
        const newDevice = await super.create(newComponent._id);
        if (!newDevice) {
            throw new BadRequestError("Tạo thiết bị lỗi!");
        }
        return newDevice;
    }
    static groupByType() {
        return {
            $group: {
                _id: "$attributes.type",
                devices: { $push: "$$ROOT" },
            },
        };
    }
    static async revoke({
        numCase,
        indexOfComponent,
        typeComponent,
        count,
        note,
        user,
    }) {
        const typeClass = Component.componentType[typeComponent];
        if (!typeClass) {
            throw new BadRequestError("Loại linh kiện không phù hợp!");
        }
        const caseFound = await CasePC.findByNum(numCase);
        if (!caseFound) {
            throw new BadRequestError(`Case ${numCase} không tồn tại!`);
        }
        const deviceParent = await DeviceService.findById(caseFound._id);

        let handoverAll = await HandoverService.findByStaffAndIsOpen({
            staff: deviceParent.staff,
            type: [0, 1],
        });
        if (handoverAll) {
            throw new BadRequestError(
                "Nhân viên đang có phiếu bàn giao hoặc thu hồi chưa in phiếu!"
            );
        }

        const oldDevice = JSON.parse(JSON.stringify(deviceParent));
        const deviceFound = await typeClass.revoke({
            caseFound,
            typeComponent,
            indexOfComponent,
            count,
            deviceParent,
        });
        deviceParent.attributes = caseFound;
        // Tạo lịch sử linh kiện
        await HistoryService.create({
            device: deviceFound,
            staff: deviceParent.staff,
            type: HISTORY.REVOKE,
            user,
            note,
            count,
            num_case: numCase,
        });
        // Tạo lịch sử máy
        await HistoryService.create({
            device: deviceParent,
            staff: deviceParent.staff,
            type: HISTORY.REVOKE,
            user,
            note,
            count,
            old_device: oldDevice,
        });
        await deviceParent.save();
        var handoverIsOpen = await HandoverService.findByStaffAndIsOpen({
            staff: deviceParent.staff,
        });
        if (handoverIsOpen) {
            handoverIsOpen.deviceRevoke.push(deviceFound);
            await handoverIsOpen.save();
        } else {
            var deviceRevoke = [];
            deviceRevoke.push(deviceFound);
            await HandoverService.create({
                user,
                staff: deviceParent.staff,
                type: HANDOVER.UPDATE,
                deviceRevoke,
                note,
            });
        }
        return deviceParent;
    }
    async update(deviceId) {
        const objParams = removeUndefinedObject(this);
        if (objParams.attributes) {
            await updateDeviceById({
                deviceId,
                payload: updateNestedObjectParser(objParams.attributes),
                model: component,
            });
        }
        const updateDevice = await super.update(
            deviceId,
            updateNestedObjectParser(objParams)
        );
        return updateDevice;
    }
    static async handover({ deviceFound, count, numCase, note, user }) {
        const typeComponent = deviceFound.attributes.type;
        const typeClass = Component.componentType[typeComponent];
        if (!typeClass) {
            throw new BadRequestError("Loại linh kiện không phù hợp!");
        }
        if (!numCase) {
            throw new BadRequestError("Vui lòng chọn case muốn bàn giao linh kiện!");
        }
        const caseFound = await CasePC.findByNum(numCase);
        if (!caseFound) {
            throw new BadRequestError(`Case ${numCase} không tồn tại!`);
        }
        const deviceParent = await DeviceService.findById(caseFound._id);
        const oldDevice = JSON.parse(JSON.stringify(deviceParent));
        await typeClass.handover({ caseFound, typeComponent, deviceFound, count });
        await InventoryService.updateQuantityByDevice(deviceFound._id, -count);
        deviceParent.attributes = caseFound;
        //tạo history cho linh kiện
        await HistoryService.create({
            device: deviceFound,
            staff: deviceParent.staff,
            type: HISTORY.HANDOVER,
            user,
            note,
            count,
            num_case: numCase,
        });
        // tạo history cho case
        await HistoryService.create({
            device: deviceParent,
            staff: deviceParent.staff,
            type: HISTORY.HANDOVER,
            user,
            note,
            count,
            old_device: oldDevice,
        });
        await deviceParent.save();
    }
}
class Headphone extends Device {
    async create() {
        const newHeadphone = await headphone.create(this.attributes);
        if (!newHeadphone) {
            throw new BadRequestError("Create headphone error!");
        }
        const newDevice = await super.create(newHeadphone._id);
        if (!newDevice) {
            throw new BadRequestError("Tạo thiết bị lỗi!");
        }
        return newDevice;
    }
    static async handover({ deviceFound, count, staff, note, user }) {
        await setDeviceStaff({ deviceFound, count, staff, note, user });
    }
    async update(deviceId) {
        const objParams = removeUndefinedObject(this);
        const updateDevice = await super.update(
            deviceId,
            updateNestedObjectParser(objParams)
        );
        return updateDevice;
    }
    static async checkUnique(payload) {
        // kiểm tra trùng số máy gửi lên
        const hasDuplicateNum = payload.some((obj, index) => {
            return (
                payload.findIndex((innerObj, innerIndex) => {
                    return (
                        innerObj.attributes.num === obj.attributes.num &&
                        innerIndex !== index
                    );
                }) !== -1
            );
        });
        if (hasDuplicateNum) {
            throw new BadRequestError("Trùng số tai nghe gửi lên!");
        }

        // check xem số máy đã tồn tại trên hệ thống chưa?
        let nums = await getAllNum(headphone);
        console.log(nums);
        const existsDevice = payload.some((_) => nums.includes(_.attributes.num));
        console.log("exists:::", existsDevice);
        if (existsDevice) {
            throw new BadRequestError("Số tai nghe đã tồn tài trên hệ thống!");
        }
    }
}
class Keyboard extends Device {
    async create() {
        const deviceFound = await DeviceService.findOneByType(DEVICE_TYPE.KEYBOARD);
        if (deviceFound) {
            throw new BadRequestError("Bàn phím đã có, không thể tạo mới!");
        }
        const newKeyboard = await keyboard.create(this.attributes);
        if (!newKeyboard) {
            throw new BadRequestError("Tạo bàn phím lỗi!");
        }
        const newDevice = await super.create(newKeyboard._id);
        if (!newDevice) {
            throw new BadRequestError("Tạo thiết bị lỗi");
        }
        return newDevice;
    }
    static async handover({ deviceFound, count, staff, note, user }) {
        await setDeviceStaff({ deviceFound, count, staff, note, user });
        let staffFound = await StaffService.findByIdStaff(staff);
        staffFound.keyboard += count;
        staffFound.save();
    }
    static async revoke({ deviceFound, staff, count }) {
        if (staff.keyboard < 1) {
            throw new BadRequestError("Nhân viên không có bàn phím để thu hồi");
        }
        staff.keyboard -= count;
    }
}
class Mouse extends Device {
    async create() {
        const deviceFound = await DeviceService.findOneByType(DEVICE_TYPE.MOUSE);
        if (deviceFound) {
            throw new BadRequestError("Chuột đã có, không thể tạo mới!");
        }
        const newMouse = await mouse.create(this, this.attributes);
        if (!newMouse) {
            throw new BadRequestError("Tạo chuột lỗi!");
        }
        const newDevice = await super.create(newMouse._id);
        if (!newDevice) {
            throw new BadRequestError("Tạo thiết bị lỗi!");
        }
        return newDevice;
    }
    static async handover({ deviceFound, count, staff, note, user }) {
        await setDeviceStaff({ deviceFound, count, staff, note, user });
        let staffFound = await StaffService.findByIdStaff(staff);
        staffFound.mouse += count;
        staffFound.save();
    }
    static async revoke({ deviceFound, staff, count }) {
        if (staff.mouse < 1) {
            throw new BadRequestError("Nhân viên không có chuột để thu hồi");
        }
        staff.mouse -= count;
    }
}
class Webcam extends Device {
    async create() {
        const newWebcam = await webcam.create(this.attributes);
        if (!newWebcam) {
            throw new BadRequestError("Create webcam error!");
        }
        const newDevice = await super.create(newWebcam._id);
        if (!newDevice) {
            throw new BadRequestError("Tạo thiết bị lỗi!");
        }
        return newDevice;
    }
    async update(deviceId) {
        const objParams = removeUndefinedObject(this);
        const updateDevice = await super.update(
            deviceId,
            updateNestedObjectParser(objParams)
        );
        return updateDevice;
    }
    static async handover({ deviceFound, count, staff, note, user }) {
        await setDeviceStaff({ deviceFound, count, staff, note, user });
    }
    static async checkUnique(payload) {
        // kiểm tra trùng số máy gửi lên
        const hasDuplicateNum = payload.some((obj, index) => {
            return (
                payload.findIndex((innerObj, innerIndex) => {
                    return (
                        innerObj.attributes.num === obj.attributes.num &&
                        innerIndex !== index
                    );
                }) !== -1
            );
        });
        if (hasDuplicateNum) {
            throw new BadRequestError("Trùng số webcam gửi lên!");
        }

        // check xem số máy đã tồn tại trên hệ thống chưa?
        let nums = await getAllNum(webcam);
        console.log(nums);
        const existsDevice = payload.some((_) => nums.includes(_.attributes.num));
        console.log("exists:::", existsDevice);
        if (existsDevice) {
            throw new BadRequestError("Số webcam đã tồn tài trên hệ thống!");
        }
    }
}
class Ups extends Device {
    async create() {
        const newUPS = await ups.create(this.attributes);
        if (!newUPS) {
            throw new BadRequestError("Create Ups error!");
        }
        const newDevice = await super.create(newUPS._id);
        if (!newDevice) {
            throw new BadRequestError("Tạo thiết bị lỗi!");
        }
        return newDevice;
    }
    async update(deviceId) {
        const objParams = removeUndefinedObject(this);
        const updateDevice = await super.update(
            deviceId,
            updateNestedObjectParser(objParams)
        );
        return updateDevice;
    }
    static async handover({ deviceFound, count, staff, note, user }) {
        await setDeviceStaff({ deviceFound, count, staff, note, user });
    }
    static async checkUnique(payload) {
        // kiểm tra trùng số máy gửi lên
        const hasDuplicateNum = payload.some((obj, index) => {
            return (
                payload.findIndex((innerObj, innerIndex) => {
                    return (
                        innerObj.attributes.num === obj.attributes.num &&
                        innerIndex !== index
                    );
                }) !== -1
            );
        });
        if (hasDuplicateNum) {
            throw new BadRequestError("Trùng số UPS gửi lên!");
        }

        // check xem số máy đã tồn tại trên hệ thống chưa?
        let nums = await getAllNum(ups);
        console.log(nums);
        const existsDevice = payload.some((_) => nums.includes(_.attributes.num));
        console.log("exists:::", existsDevice);
        if (existsDevice) {
            throw new BadRequestError("Số UPS đã tồn tài trên hệ thống!");
        }
    }
}
class Mainboard {
    static async handover({ caseFound, typeComponent, deviceFound, count }) {
        await addFieldIsStringToCase({ caseFound, typeComponent, deviceFound });
    }
    static async revoke({ caseFound, typeComponent, deviceParent }) {
        const value = caseFound[typeComponent];
        if (!value) {
            throw new BadRequestError(`${typeComponent} chưa có, không thể thu hồi!`);
        }
        let payload = {
            name: value,
            type: DEVICE_TYPE.COMPONENT,
            supplier: deviceParent.supplier,
            expirationDate: deviceParent.expirationDate,
            note: `Thu hồi từ case ${caseFound.num}`,
            attributes: {
                type: typeComponent,
                attributes: {
                    name: value,
                },
            },
        };
        await DeviceService.create(DEVICE_TYPE.COMPONENT, payload);
        caseFound[typeComponent] = "";
        await caseFound.save();
        return {
            type_component: COMPONENT_TYPE.MAINBOARD,
            name: value,
        };
    }
}
class Chipset {
    static async handover({ caseFound, typeComponent, deviceFound, count }) {
        await addFieldIsStringToCase({ caseFound, typeComponent, deviceFound });
    }
    static async revoke({ caseFound, typeComponent, deviceParent }) {
        const value = caseFound[typeComponent];
        if (!value) {
            throw new BadRequestError(`${typeComponent} chưa có, không thể thu hồi!`);
        }
        let payload = {
            name: value,
            type: DEVICE_TYPE.COMPONENT,
            supplier: deviceParent.supplier,
            expirationDate: deviceParent.expirationDate,
            note: `Thu hồi từ case ${caseFound.num}`,
            attributes: {
                type: typeComponent,
                attributes: {
                    name: value,
                },
            },
        };
        await DeviceService.create(DEVICE_TYPE.COMPONENT, payload);
        caseFound[typeComponent] = "";
        await caseFound.save();
        return {
            type_component: COMPONENT_TYPE.CHIPSET,
            name: value,
        };
    }
}
class Ram {
    static async handover({ caseFound, typeComponent, deviceFound, count }) {
        await addFieldIsArrayToCase({
            caseFound,
            typeComponent,
            deviceFound,
            count,
        });
    }
    static async revoke({
        caseFound,
        typeComponent,
        deviceParent,
        indexOfComponent,
    }) {
        const value = JSON.parse(JSON.stringify(caseFound[typeComponent]));
        if (value.length == 0) {
            throw new BadRequestError(`${typeComponent} chưa có, không thể thu hồi!`);
        }
        if (value.length <= indexOfComponent) {
            throw new BadRequestError(`${typeComponent} vị trí thu hồi không đúng!`);
        }
        let payload = {
            name: value[indexOfComponent],
            type: DEVICE_TYPE.COMPONENT,
            supplier: deviceParent.supplier,
            expirationDate: deviceParent.expirationDate,
            note: `Thu hồi từ case ${caseFound.num}`,
            attributes: {
                type: typeComponent,
                attributes: value[indexOfComponent],
            },
        };
        await DeviceService.create(DEVICE_TYPE.COMPONENT, payload);
        caseFound[typeComponent].splice(indexOfComponent, 1);
        await caseFound.save();
        return {
            type_component: COMPONENT_TYPE.RAM,
            name: value[indexOfComponent],
        };
    }
}
class VGA {
    static async handover({ caseFound, typeComponent, deviceFound, count }) {
        await addFieldIsArrayToCase({
            caseFound,
            typeComponent,
            deviceFound,
            count,
        });
    }
    static async revoke({
        caseFound,
        typeComponent,
        deviceParent,
        indexOfComponent,
    }) {
        const value = JSON.parse(JSON.stringify(caseFound[typeComponent]));
        if (value.length == 0) {
            throw new BadRequestError(`${typeComponent} chưa có, không thể thu hồi!`);
        }
        if (value.length <= indexOfComponent) {
            throw new BadRequestError(`${typeComponent} vị trí thu hồi không đúng!`);
        }
        let payload = {
            name: value[indexOfComponent].name,
            type: DEVICE_TYPE.COMPONENT,
            supplier: deviceParent.supplier,
            expirationDate: deviceParent.expirationDate,
            note: `Thu hồi từ case ${caseFound.num}`,
            attributes: {
                type: typeComponent,
                attributes: value[indexOfComponent],
            },
        };
        await DeviceService.create(DEVICE_TYPE.COMPONENT, payload);
        caseFound[typeComponent].splice(indexOfComponent, 1);
        await caseFound.save();
        return { ...value[indexOfComponent], type_component: COMPONENT_TYPE.VGA };
    }
}
class PSU {
    static async handover({ caseFound, typeComponent, deviceFound, count }) {
        await addFieldIsStringToCase({ caseFound, typeComponent, deviceFound });
    }
    static async revoke({ caseFound, typeComponent, deviceParent }) {
        const value = caseFound[typeComponent];
        if (!value) {
            throw new BadRequestError(`${typeComponent} chưa có, không thể thu hồi!`);
        }
        let payload = {
            name: value,
            type: DEVICE_TYPE.COMPONENT,
            supplier: deviceParent.supplier,
            expirationDate: deviceParent.expirationDate,
            note: `Thu hồi từ case ${caseFound.num}`,
            attributes: {
                type: typeComponent,
                attributes: {
                    name: value,
                },
            },
        };
        await DeviceService.create(DEVICE_TYPE.COMPONENT, payload);
        caseFound[typeComponent] = "";
        await caseFound.save();
        return {
            type_component: COMPONENT_TYPE.PSU,
            name: value,
        };
    }
}
class HardDrive {
    static async handover({ caseFound, typeComponent, deviceFound, count }) {
        await addFieldIsArrayToCase({
            caseFound,
            typeComponent,
            deviceFound,
            count,
        });
    }
    static async revoke({
        caseFound,
        typeComponent,
        deviceParent,
        indexOfComponent,
    }) {
        const value = JSON.parse(JSON.stringify(caseFound[typeComponent]));
        if (value.length == 0) {
            throw new BadRequestError(`${typeComponent} chưa có, không thể thu hồi!`);
        }
        if (value.length <= indexOfComponent) {
            throw new BadRequestError(`${typeComponent} vị trí thu hồi không đúng!`);
        }
        let payload = {
            name: value[indexOfComponent].type,
            type: DEVICE_TYPE.COMPONENT,
            supplier: deviceParent.supplier,
            expirationDate: deviceParent.expirationDate,
            note: `Thu hồi từ case ${caseFound.num}`,
            attributes: {
                type: typeComponent,
                attributes: value[indexOfComponent],
            },
        };
        await DeviceService.create(DEVICE_TYPE.COMPONENT, payload);
        caseFound[typeComponent].splice(indexOfComponent, 1);
        await caseFound.save();
        return {
            ...value[indexOfComponent],
            type_component: COMPONENT_TYPE.HARDDRIVES,
        };
    }
}
DeviceService.registerDeviceType(DEVICE_TYPE.CASE, CasePC);
DeviceService.registerDeviceType(DEVICE_TYPE.WACOM, Wacom);
DeviceService.registerDeviceType(DEVICE_TYPE.MONITOR, Monitor);
DeviceService.registerDeviceType(DEVICE_TYPE.COMPONENT, Component);
DeviceService.registerDeviceType(DEVICE_TYPE.HEADPHONE, Headphone);
DeviceService.registerDeviceType(DEVICE_TYPE.WEBCAM, Webcam);
DeviceService.registerDeviceType(DEVICE_TYPE.UPS, Ups);
DeviceService.registerDeviceType(DEVICE_TYPE.KEYBOARD, Keyboard);
DeviceService.registerDeviceType(DEVICE_TYPE.MOUSE, Mouse);

Component.registerComponentType(COMPONENT_TYPE.MAINBOARD, Mainboard);
Component.registerComponentType(COMPONENT_TYPE.CHIPSET, Chipset);
Component.registerComponentType(COMPONENT_TYPE.RAM, Ram);
Component.registerComponentType(COMPONENT_TYPE.VGA, VGA);
Component.registerComponentType(COMPONENT_TYPE.PSU, PSU);
Component.registerComponentType(COMPONENT_TYPE.HARDDRIVES, HardDrive);
//

/** */
async function addFieldIsStringToCase({
    caseFound,
    typeComponent,
    deviceFound,
}) {
    const value = caseFound[typeComponent];
    if (value) {
        throw new BadRequestError(
            `${typeComponent} đã có, không thể bàn giao thêm!`
        );
    }
    caseFound[typeComponent] = deviceFound.attributes.attributes.name || "";
    await caseFound.save();
}

async function addFieldIsArrayToCase({
    caseFound,
    typeComponent,
    deviceFound,
    count,
}) {
    for (let index = 0; index < count; index++) {
        caseFound[typeComponent].push(deviceFound.attributes.attributes);
    }
    await caseFound.save();
}

async function removeFieldStringFromCase({
    caseFound,
    typeComponent,
    deviceFound,
}) { }

async function setDeviceStaff({ deviceFound, count, staff, note, user }) {
    // Giảm tồn khi đi số lương bàn giao
    await InventoryService.updateQuantityByDevice(deviceFound._id, -count);
    if (
        deviceFound.type != DEVICE_TYPE.KEYBOARD &&
        deviceFound.type != DEVICE_TYPE.MOUSE
    ) {
        deviceFound.staff = staff;
        deviceFound.status = DEVICE.IN_USE;
    }
    //Tạo history
    await HistoryService.create({
        device: deviceFound,
        staff,
        type: HISTORY.HANDOVER,
        user,
        note,
        count,
    });
    await deviceFound.save();
}
const updateDeviceById = async ({ deviceId, payload, model, isNew = true }) => {
    return await model.findByIdAndUpdate(deviceId, payload, {
        new: isNew,
    });
};

async function getAllNum(model, field = "num") {
    var devices = await model.find({}).lean();
    let nums = devices.map((_) => _[field]);
    return nums;
}
module.exports = DeviceService;
