const { HANDOVER } = require("../GVs/handover.config")
const { SuccessResponse } = require("../responseHandle/success.response")
const DeviceService = require("../services/device.service")
const InventoryService = require("../services/inventory.service")
class DeviceController {
    static getAll = async (req, res, next) => {
        new SuccessResponse({
            message: 'Lấy tất cả thiết bị thành công!',
            metadata: await DeviceService.getAll()
        }).send(res)
    }
    static getByStaff = async (req, res, next) => {
        new SuccessResponse({
            message: 'Lấy tất cả thiết bị thành công!',
            metadata: await DeviceService.getByStaff(req.session.userId)
        }).send(res)
    }
    static create = async (req, res, next) => {
        console.log(req.body);
        new SuccessResponse({
            message: 'Tạo thiết bị thành công!',
            metadata: await DeviceService.create(req.body.type, {
                ...req.body,
                user: req.session.userId
            })
        }).send(res)
    }
    static createMany = async (req, res, next) => {
        new SuccessResponse({
            message: 'Tạo thiết bị thành công!',
            metadata: await DeviceService.createMany(req.body.devices, req.body.type)
        }).send(res)
    }
    static update = async (req, res, next) => {
        new SuccessResponse({
            message: 'Cập nhật thiết bị thành công!',
            metadata: await DeviceService.update(req.params.deviceId, req.body.type, {
                ...req.body,
                user: req.session.userId
            })
        }).send(res)
    }

    static handoverAll = async (req, res, next) => {
        new SuccessResponse({
            message: 'Bàn giao toàn bộ thiết bị thành công!',
            metadata: await DeviceService.handoverAll({
                ...req.body,
                user: req.session.userId
            })
        }).send(res)
    }

    static revokeAll = async (req, res, next) => {
        new SuccessResponse({
            message: 'Thu hồi toàn bộ thiết bị thành công!',
            metadata: await DeviceService.revokeAll({
                ...req.body,
                user: req.session.userId
            })
        }).send(res)
    }
    static handover = async (req, res, next) => {
        new SuccessResponse({
            message: 'Bàn giao thiết bị thành công!',
            metadata: await DeviceService.handover({
                ...req.body,
                user: req.session.userId,
                type: HANDOVER.UPDATE
            })
        }).send(res)
    }
    static revokeDevice = async (req, res, next) => {
        new SuccessResponse({
            message: 'Thu hồi thiết bị thành công!',
            metadata: await DeviceService.revokeDevice({
                ...req.body,
                user: req.session.userId,
                type: HANDOVER.UPDATE
            })
        }).send(res)
    }
    static revokeComponent = async (req, res, next) => {
        new SuccessResponse({
            message: 'Thu hồi linh kiện thành công!',
            metadata: await DeviceService.revokeComponent({
                ...req.body,
                user: req.session.userId
            })
        }).send(res)
    }
    static getAllByType = async (req, res, next) => {
        new SuccessResponse({
            message: 'Lấy thiết bị thành công!',
            metadata: await DeviceService.getAllByType(req.body.type)
        }).send(res)
    }
    static getDetailsByType = async (req, res, next) => {
        new SuccessResponse({
            message: 'Lấy thông tin chi tiết thành công',
            metadata: await DeviceService.getDetailsByType(req.body._id)
        }).send(res)
    }
    //todo lấy số lượng và loại thiết bị còn lại trong kho >0
    static getDeviceByTypeAndQuantity = async (req, res, next) => {
        new SuccessResponse({
            message: 'Lấy thông tin thiết bị thành công',
            metadata: await DeviceService.getDeviceByTypeAndQuantity(req.query.type)
        }).send(res)
    }
    static getAllInventories = async (req, res, next) => {
        new SuccessResponse({
            message: 'Lấy thông tin thiết bị thành công',
            metadata: await InventoryService.getAll()
        }).send(res)
    }
    static getSummary = async (req, res, next) => {
        new SuccessResponse({
            message: 'Lấy thông tin thiết bị thành công',
            metadata: await DeviceService.getSummary()
        }).send(res)
    }
    static getDeviceToHandoverAll = async (req, res, next) => {
        new SuccessResponse({
            message: 'Lấy thông tin thiết bị thành công',
            metadata: await DeviceService.getDeviceToHandoverAll()
        }).send(res)
    }
    static increaseKeyBoardOrMouse = async (req, res, next) => {
        new SuccessResponse({
            message: 'Tăng số lượng thành công!',
            metadata: await DeviceService.increaseKeyBoardOrMouse({user: req.session.userId, type: req.body.type}, req.body.quantity)
        }).send(res)
    }
}

module.exports = DeviceController