const { SuccessResponse } = require("../responseHandle/success.response")
const JobService = require("../services/job.service")
class JobController {
    static create = async (req, res, next) => {
        new SuccessResponse({
            message: 'Tạo công việc thành công!',
            metadata: await JobService.create(req.body)
        }).send(res)
    }
    static update = async (req, res, next) => {
        new SuccessResponse({
            message: 'Cập nhật công việc thành công!',
            metadata: await JobService.update(req.params.jobId, req.body)
        }).send(res)
    }

    static getAll = async (req, res, next) => {
        new SuccessResponse({
            message: 'Lấy công việc thành công!',
            metadata: await JobService.getAll()
        }).send(res)
    }
}

module.exports = JobController