const { history, device } = require("../models/model")
const { InternalServerError } = require("../responseHandle/error.response")
const { Types } = require('mongoose')
// const mongoose = require('mongoose');
class HistoryService {
    static create = async ({ device, staff, type, user, note, count, old_device, num_case }) => {
        const historyCollection = await history.create({
            device, staff, type, user, note, count, old_device, num_case
        })
        if (!historyCollection) {
            throw new InternalServerError('Lỗi tạo lịch sử bàn giao!')
        }
        return historyCollection
    }
    static getHistoryByIdDevice = async (idDevice) => {
        const historyFound = await history.find({ "device._id": new Types.ObjectId(idDevice) })
            .populate('staff', 'name _id').populate('user', 'name -_id')
        if (!historyFound) {
            throw new InternalServerError('Không tìm thấy thiết bị!')
        }
        return historyFound
    }
    static getHistoryByStaff = async (idStaff) => {
        const staffObjectId = new Types.ObjectId(idStaff)
        const historyFound = await history.aggregate([
            {
                $match: {
                    staff: staffObjectId,
                    "device.type": { $ne: "component" }
                    //   $expr: { $eq: ['$' + id_staff, '$' + id_staff] } // Thay 'id_staff' bằng tên trường chứa id_staff trong collection của bạn
                }
            },
            {
                $group: {
                    _id: '$staff',
                    staff: { $first: "$staff" },
                    devices: { $push: "$$ROOT" },
                },

            },
            {
                $lookup: {
                    from: "staffs",
                    localField: "staff",
                    foreignField: "_id",
                    as: "staff"
                }
            },
            {
                $unwind: "$staff"
            },
        ])
        if (!historyFound) {
            throw new InternalServerError('Không tìm thấy nhân viên!')
        }
        return historyFound
    }
    static getAllHistory = async () => {
        const historyFound = await history.aggregate([
            {
                $group: {
                    _id: "$staff",
                    staff: { $first: "$staff" },
                    // supplier:
                    devices: { $push: "$$ROOT" },
                }
            },

            {
                $lookup: {
                    from: "staffs",
                    localField: "staff",
                    foreignField: "_id",
                    as: "staff"
                }
            },

            {
                $unwind: "$staff"
            },
            {
                $project: {
                    _id: 0,
                    staff: 1,
                    devices: 1
                }
            },
        ])
        // .populate('staff', 'name _id').populate('user', 'name -_id')
        if (!historyFound) {
            throw new InternalServerError('Không tìm thấy thiết bị!')
        }
        return historyFound
    }
}

module.exports = HistoryService