const { location } = require("../models/model")
const { BadRequestError } = require("../responseHandle/error.response")

class LocationService {
    static create = async ({ address, floor, job, company }) => {
        if (!address || !company || !floor || !job) {
            throw new BadRequestError('Thông tin không được để trống')
        }
        const existsLocation = await location.findOne({ address: address, floor: floor, job: job, company: company })
        console.log(existsLocation);
        if (existsLocation) {
            throw new BadRequestError('Thông tin đã tồn tại đã tồn tại!')
        }
        const newLocation = await location.create({
            address, floor, job, company
        })
        if (!newLocation) {
            throw new BadRequestError('Tạo thông tin lỗi!')
        }
        return newLocation
    }
    static getAll = async () => {
        const existsLocation = await location.find()
        return existsLocation
    }
}

module.exports = LocationService