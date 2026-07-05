const { SuccessResponse } = require("../responseHandle/success.response")
const StaffService = require("../services/staff.service")


class StaffController {
    static create = async (req, res, next) => {
        new SuccessResponse({
            message: 'Tạo nhân viên thành công!',
            metadata: await StaffService.create(req.body,req.session.userId)
        }).send(res)
    }
    static update = async (req, res, next) => {
        new SuccessResponse({
            message: 'Cập nhật nhân viên thành công!',
            metadata: await StaffService.update(req.params.staffId, req.body,req.session.userId)
        }).send(res)
    }
    static getAll = async (req, res, next) => {
        new SuccessResponse({
            message: 'Lấy danh sách nhân viên thành công!',
            metadata: await StaffService.getAll()
        }).send(res)
    }
    static getStaffToHanover = async(req, res, next)=>{
        new SuccessResponse({
            message: 'Lấy danh sách nhân viên để bàn giao thành công!',
            metadata: await StaffService.getStaffToHanover()
        }).send(res)
    }
    static getSummary = async(req, res, next)=>{
        new SuccessResponse({
            message: 'Lấy số lượng nhân viên thành công!',
            metadata: await StaffService.getSummary()
        }).send(res)
    }


}

module.exports = StaffController