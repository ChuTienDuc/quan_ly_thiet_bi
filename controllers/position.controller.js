const { SuccessResponse } = require("../responseHandle/success.response")
const PositionService = require("../services/position.service")

class PositionController {
    static create = async (req, res, next) => {
        new SuccessResponse({
            message: 'Tạo vị trí thành công!',
            metadata: await PositionService.create(req.body)
        }).send(res)
    }
    static update = async (req, res, next) => {
        new SuccessResponse({
            message: 'Cập nhật vị trí thành công!',
            metadata: await PositionService.update(req.params.positionId, req.body)
        }).send(res)
    }

    static getAll = async (req, res, next) => {
        new SuccessResponse({
            message: 'Lấy vị trí thành công!',
            metadata: await PositionService.getAll()
        }).send(res)
    }
}

module.exports = PositionController