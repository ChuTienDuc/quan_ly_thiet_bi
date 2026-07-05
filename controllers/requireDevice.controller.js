const { SuccessResponse } = require("../responseHandle/success.response")
const RequireDeviceService = require("../services/requireDevice.service")


class RequireDeviceController {
    static create = async (req, res, next) => {
        new SuccessResponse({
            message: 'Tạo yêu cầu thành công!',
            metadata: await RequireDeviceService.create({ ...req.body, staff: req.session.userId })
        }).send(res)
    }
    static getAll = async (req, res, next) => {
        new SuccessResponse({
            message: 'Lấy danh sách thành công!',
            metadata: await RequireDeviceService.getAll()
        }).send(res)
    }
    static getRequireDeviceByStaff = async (req, res, next) => {
        new SuccessResponse({
            message: 'Lấy danh sách thành công!',
            metadata: await RequireDeviceService.getRequireDeviceByStaff(req.session.userId)
        }).send(res)
    }
    static acceptRequireDevice = async (req, res, next) => {
        new SuccessResponse({
            message: 'Duyệt yêu cầu thành công!',
            metadata: await RequireDeviceService.acceptRequireDevice({ require_id: req.params.require_id, user: req.session.userId })
        }).send(res)
    }
    static rejectRequireDevice = async (req, res, next) => {
        new SuccessResponse({
            message: 'Từ chối yêu cầu thành công!',
            metadata: await RequireDeviceService.rejectRequireDevice({
                require_id: req.params.require_id,
                note_user: req.body.note_user,
                user: req.session.userId
            })
        }).send(res)
    }

}

module.exports = RequireDeviceController