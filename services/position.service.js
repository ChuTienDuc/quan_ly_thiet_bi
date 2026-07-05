const { position } = require("../models/model")
const { BadRequestError } = require("../responseHandle/error.response")
const { removeUndefinedObject, updateNestedObjectParser } = require("../utils")

class PositionService {
    static async create({ name }) {
        const positionFound = await position.findOne({ name }).lean()
        if (positionFound) {
            throw new BadRequestError('Vị trí đã tồn tại!')
        }
        return await position.create({ name });
    }
    static async update(positionId, data) {
        const objParams = removeUndefinedObject(data)
        const newPosition = await position.findByIdAndUpdate(positionId, updateNestedObjectParser(objParams), { new: true })
        if (!newPosition) {
            throw new BadRequestError('Cập nhật vị trí lỗi!')
        }
        return newPosition
    }
    static async getAll() {
        return await position.find({}).lean()
    }
}

module.exports = PositionService