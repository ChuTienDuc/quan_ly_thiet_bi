const { SuccessResponse } = require("../responseHandle/success.response")
const SupplierService = require("../services/supplier.service")
class SupplierController {
    static create = async (req, res, next) => {
        console.log(req.body);
        new SuccessResponse({
            message:'Tạo nhà cung cấp thành công!',
            metadata: await SupplierService.create(req.body)
        }).send(res)
    }
    static getAll = async (req, res, next) => {
        new SuccessResponse({
            message:'Lấy danh sách thành công',
            metadata: await SupplierService.getAll()
        }).send(res)
    }
}
module.exports = SupplierController