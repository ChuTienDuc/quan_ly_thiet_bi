const { HANDOVER } = require("../GVs/handover.config")
const { SuccessResponse } = require("../responseHandle/success.response")
const InventoryService = require("../services/inventory.service")
class InventoryController {
    static findByDeviceId = async (req, res, next) => {
        new SuccessResponse({
            message: 'Lấy tất cả thiết bị thành công!',
            metadata: await InventoryService.findByDeviceId(req.body.deviceId)
        }).send(res)
    }
    static getAll = async (req, res, next) => {
        new SuccessResponse({
            message: 'Lấy danh sách kho thành công!',
            metadata: await InventoryService.getAll(req.query)
        }).send(res)
    }
    
}

module.exports = InventoryController