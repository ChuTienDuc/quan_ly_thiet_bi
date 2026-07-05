const { department } = require("../models/model")
const { BadRequestError } = require("../responseHandle/error.response")
const { removeUndefinedObject, updateNestedObjectParser } = require("../utils")

class DepartmentService {
    static async create({ name }) {
        const departmentFound = await department.findOne({ name }).lean()
        if (departmentFound) {
            throw new BadRequestError('Phòng ban đã tồn tại!')
        }
        return await department.create({ name });
    }
    static async update(departmentId, data) {
        const objParams = removeUndefinedObject(data)
        const newDepartment = await department.findByIdAndUpdate(departmentId, updateNestedObjectParser(objParams), { new: true })
        if (!newDepartment) {
            throw new BadRequestError('Cập nhật phòng ban lỗi!')
        }
        return newDepartment
    }
    static async getAll() {
        return await department.find({}).lean()
    }
}

module.exports = DepartmentService