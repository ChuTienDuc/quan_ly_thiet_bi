const { SuccessResponse } = require("../responseHandle/success.response")
const LocationService = require("../services/location.service")
class LocationController {
    static create = async (req, res, next) => {
        console.log(req.body);
        new SuccessResponse({
            message:'Tạo nhà cung cấp thành công!',
            metadata: await LocationService.create(req.body)
        }).send(res)
    }
    static getAll = async (req, res, next) => {
        new SuccessResponse({
            message:'Lấy danh sách thành công',
            metadata: await LocationService.getAll()
        }).send(res)
    }
}
module.exports = LocationController