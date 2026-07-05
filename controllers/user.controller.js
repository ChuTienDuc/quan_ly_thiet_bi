const { SuccessResponse } = require("../responseHandle/success.response")
const UserService = require("../services/user.service")


class UserController {
    static create = async (req, res, next) => {
        new SuccessResponse({
            message:'Tạo user thành công!',
            metadata: await UserService.create(req.body)
        }).send(res)
    }
    static update = async (req, res, next) => {
        new SuccessResponse({
            message:'Cập nhật user thành công!',
            metadata: await UserService.update(req.params.userId,req.body)
        }).send(res)
    }
    static getAll = async(req, res, next)=>{
        new SuccessResponse({
            message:'Lấy danh sách user thành công!',
            metadata: await UserService.getAll()
        }).send(res)
    }
    static resetPassword = async (req, res, next) => {
        new SuccessResponse({
            message:'Đặt lại mật khẩu thành công!',
            metadata: await UserService.resetPassword(req.params.userId, req.body.newPassword)
        }).send(res)
    }
    static changePassword = async (req, res, next) => {
        new SuccessResponse({
            message:'Thay đổi mật khẩu  thành công!',
            metadata: await UserService.changePassword(req.params.userId,req.body.newPassword,req.body.currentPassword)
        }).send(res)
    }
}

module.exports = UserController