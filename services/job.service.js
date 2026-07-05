const { job } = require("../models/model")
const { BadRequestError } = require("../responseHandle/error.response")
const { removeUndefinedObject, updateNestedObjectParser } = require("../utils")

class JobService {
    static async create({ name }) {
        const jobFound = await job.findOne({ name }).lean()
        if (jobFound) {
            throw new BadRequestError('Công việc đã tồn tại!')
        }
        return await job.create({ name });
    }
    static async update(jobId, data) {
        const objParams = removeUndefinedObject(data)
        const newJob = await job.findByIdAndUpdate(jobId, updateNestedObjectParser(objParams), { new: true })
        if (!newJob) {
            throw new BadRequestError('Cập nhật công việc lỗi!')
        }
        return newJob
    }
    static async getAll() {
        return await job.find({}).lean()
    }
}

module.exports = JobService