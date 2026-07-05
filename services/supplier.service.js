const { supplier } = require("../models/model")
const { BadRequestError } = require("../responseHandle/error.response")

class SupplierService {
    static create = async ({ name, phoneNumber, address, VAT }) => {
        if(!phoneNumber || !name ){
            throw new BadRequestError('Số điện thoại hoặc tên không được để trống')
        }
        const existsSupplier = await supplier.findOne({phoneNumber})
        console.log(existsSupplier);
        if (existsSupplier) {
            throw new BadRequestError('Nhà cung cấp đã tồn tại!')
        }
        const newSupplier = await supplier.create({
            name, phoneNumber, address, VAT
        })
        if (!newSupplier) {
            throw new BadRequestError('Tạo nhà cung cấp lỗi!')
        }
        return newSupplier
    }
    static getAll = async () => {
        const existsSupplier = await supplier.find()
        return existsSupplier
    }
}

module.exports = SupplierService