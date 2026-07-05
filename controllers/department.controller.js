const { SuccessResponse } = require("../responseHandle/success.response")
const DepartmentService = require("../services/department.service")

class DepartmentController {
    static create = async (req, res, next) => {
        new SuccessResponse({
            message: 'Tạo phòng ban thành công!',
            metadata: await DepartmentService.create(req.body)
        }).send(res)
    }
    static update = async (req, res, next) => {
        new SuccessResponse({
            message: 'Cập nhật phòng ban thành công!',
            metadata: await DepartmentService.update(req.params.departmentId, req.body)
        }).send(res)
    }

    static getAll = async (req, res, next) => {
        new SuccessResponse({
            message: 'Lấy phòng ban thành công!',
            metadata: await DepartmentService.getAll()
        }).send(res)
    }
}

module.exports = DepartmentController