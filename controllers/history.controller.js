const { SuccessResponse } = require("../responseHandle/success.response")
const HistoryService = require("../services/history.service")

class HistoryController {
    static getHistoryByIdDevice = async (req, res, next) => {
        new SuccessResponse({
            message: 'Lấy lịch sử thiết bị thành công!',
            metadata: await HistoryService.getHistoryByIdDevice(req.params.id)
        }).send(res)
    }
    static getHistoryByStaff = async (req, res, next) => {
        new SuccessResponse({
            message: 'Lấy lịch sử nhân viên thành công!',
            metadata: await HistoryService.getHistoryByStaff(req.params.id)
        }).send(res)
    }
    static getAllHistory = async (req, res, next) => {
        new SuccessResponse({
            message: 'Lấy lịch sử thiết bị thành công!',
            metadata: await HistoryService.getAllHistory()
        }).send(res)
    }
}
module.exports = HistoryController