const { HANDOVER } = require("../GVs/handover.config");
const { requireDevice, inventory } = require("../models/model")
const { BadRequestError } = require("../responseHandle/error.response");
const DeviceService = require("./device.service");
const STATUS_ENUM = {
    PENDING: 2,
    ACCEPTED: 1,
    REJECTED: 0,
};
const TYPE_ENUM = {
    TRANSFER: 0,    // Luân chuyển
    HANDOVER: 1,    // Bàn giao
    RETURN: 2       // Hoàn trả
};

module.exports = TYPE_ENUM; // nếu bạn cần sử dụng trong nhiều file

class RequireDeviceService {
    static create = async ({ staff, devices = [], devices_return = [], note_staff, note, note_user = "", type }) => {
        note_staff = note_staff ?? note;
        //    TODO Validate stock
        const result = await this.validateCreate(devices, devices_return, note_staff);
        if (result) {
            const newRequireDevice = await requireDevice.create({
                staff: staff,
                devices: devices,
                devices_return: devices_return,
                note_staff: note_staff,
                note_user: note_user,
                type: type
            });
            return newRequireDevice;
        }
    }
    static validateCreate = async (devices, devices_return, note_staff) => {
        if (devices.length == 0 && devices_return.length == 0) {
            throw new BadRequestError("Thiết bị không được để trống");
        }
        if (!note_staff || note_staff.trim().length === 0) {
            throw new BadRequestError("Ghi chú của nhân viên không được để trống.");
        }
        await this.checkStockDevice(devices);
        return true;
    }
    static checkStockDevice = async (devices) => {
        for (let i = 0; i < devices.length; i++) {
            const device = devices[i];
            const foundInventoryDevice = await inventory.findOne({ device: device }).populate('device').lean();
            if (!foundInventoryDevice) {
                throw new BadRequestError(`Thiết bị không tồn tại`);
            }
            if (foundInventoryDevice.quantity == 0) {
                throw new BadRequestError(`Device ${foundInventoryDevice.name} không còn ở trong kho`);
            }

        }
    }
    static getAll = async () => {
        const existsRequireDevice = await requireDevice.find().sort('updated_at').populate('devices devices_return user')
        return existsRequireDevice
    }

    static getRequireDeviceByStaff = async (staff) => {
        const existsRequireDevice = await requireDevice.find({ staff: staff }).sort('updated_at').populate('devices devices_return user')
        return existsRequireDevice
    }
    static processHandoverDevice = async (foundRequireDevice, user) => {
        console.log("TEst::", foundRequireDevice)
        if (foundRequireDevice.devices.length > 0) {
            if (foundRequireDevice.type == TYPE_ENUM.HANDOVER) {
                await DeviceService.handoverAll({
                    staff: foundRequireDevice.staff,
                    ids: foundRequireDevice.devices,
                    user: user,
                })
            }
            else if (foundRequireDevice.type == TYPE_ENUM.TRANSFER) {
                console.log("foundRequireDevice::", foundRequireDevice)
                for (let i = 0; i < foundRequireDevice.devices.length; i++) {
                    const device = foundRequireDevice.devices[i];
                    await DeviceService.handover({
                        staff: foundRequireDevice.staff,
                        deviceId: device._id,
                        user: user,
                        note: foundRequireDevice.note_staff,
                        type: HANDOVER.UPDATE
                    })
                }
            }
        }
    }
    static processReturnDevice = async (foundRequireDevice, user) => {
        if (foundRequireDevice.devices_return.length > 0) {
            for (let i = 0; i < foundRequireDevice.devices_return.length; i++) {
                const device = foundRequireDevice.devices_return[i];
                await DeviceService.revokeDevice({
                    user: user,
                    staff: foundRequireDevice.staff,
                    deviceId: device,
                    note: foundRequireDevice.note_staff,
                    type: HANDOVER.UPDATE
                })
            }
        }
    }
    static acceptRequireDevice = async ({ require_id, user }) => {
        const foundRequireDevice = await requireDevice.findById(require_id).lean()
        if (!foundRequireDevice) {
            throw new BadRequestError("Yêu cầu bàn giao thiết bị không tồn tại.")
        }
        if (foundRequireDevice.type == TYPE_ENUM.HANDOVER) {
            await this.processHandoverDevice(foundRequireDevice, user);
        }
        else if (foundRequireDevice.type == TYPE_ENUM.TRANSFER) {
            await this.processReturnDevice(foundRequireDevice, user);
            await this.processHandoverDevice(foundRequireDevice, user);
        }
        else if (foundRequireDevice.type == TYPE_ENUM.RETURN) {
            await this.processReturnDevice(foundRequireDevice, user);
        }

        const updatedDevice = await requireDevice.findByIdAndUpdate(
            require_id,
            { status: STATUS_ENUM.ACCEPTED, user: user },
            { new: true }
        );
        return updatedDevice;

    }
    static rejectRequireDevice = async ({ require_id, note_user, user }) => {
        const foundRequireDevice = await requireDevice.findById(require_id).lean()
        if (!foundRequireDevice) {
            throw new BadRequestError("Yêu cầu bàn giao thiết bị không tồn tại.")
        }
        if (!note_user) {
            throw new BadRequestError("Ghi chú không được để trống");
        }

        const updatedDevice = await requireDevice.findByIdAndUpdate(
            require_id,
            {
                status: STATUS_ENUM.REJECTED,
                note_user: note_user,
                user: user
            },
            { new: true }
        );
        return updatedDevice;
    }
}

module.exports = RequireDeviceService
