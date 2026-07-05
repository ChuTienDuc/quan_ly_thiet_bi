const { USER } = require("../GVs/user.config")
const { staff } = require("../models/model")
const { device, user } = require("../models/model")
const bcrypt = require('bcrypt');

const { BadRequestError, InternalServerError } = require("../responseHandle/error.response")
const { removeUndefinedObject, updateNestedObjectParser } = require("../utils")

class StaffService {
    static create = async ({ code, name, company, job, department, position, location, floor, phoneNumber, keyboard, mouse, manager }, userId) => {
        const existsStaff = await staff.findOne({ phoneNumber })
        if (existsStaff) {
            throw new BadRequestError('Nhân viên đã tồn tại!')
        }
        const User = await user.findById(userId).lean()
        if (User.role != 0 && User.role != 2) {
            manager = null
        }
        const foundUser = await user.findOne({ phoneNumber: phoneNumber }).lean()
        if (foundUser) {
            const newStaff = await staff.create({
                _id: foundUser._id,
                code, name, company, job, department, position, location, floor, phoneNumber, keyboard, mouse, manager
            })
            return newStaff
        }
        const newStaff = await staff.create({
            code, name, company, job, department, position, location, floor, phoneNumber, keyboard, mouse, manager
        })
        if (!foundUser) {
            const passwordHash = await bcrypt.hash(phoneNumber, 10);
            await user.create({
                _id: newStaff._id,
                phoneNumber: phoneNumber,
                name: name,
                password: passwordHash
            })
        }
        if (!newStaff) {
            throw new InternalServerError('Lỗi server!')
        }
        return newStaff
    }
    static update = async (staffId, data, userId) => {
        const User = await user.findById(userId).lean()
        if (User.role != USER.ADMIN && User.role != USER.ACCOUNTANT) {
            delete data.manager
        }
        var manager = data.manager
        const objParams = removeUndefinedObject(data)
        const newStaff = await staff.findByIdAndUpdate(staffId, updateNestedObjectParser(objParams), { new: true }).populate('job').populate('position').populate('department')
        if (manager == undefined && (User.role == USER.ADMIN || User.role == USER.ACCOUNTANT)) {
            newStaff.manager = manager
            await newStaff.save()
        }
        if (!newStaff) {
            throw new BadRequestError('Cập nhật nhân viên lỗi!')
        }
        return newStaff

    }
    static getAll = async () => {
        const staffs = await staff.find().populate('job').populate('position').populate('department').populate('manager')
        return staffs;
    }
    static getStaffToHanover = async () => {
        const staffs = await staff.aggregate([
            {
                $unwind: "$job"
            },
            {
                $lookup: {
                    from: "jobs",
                    localField: "job",
                    foreignField: "_id",
                    as: "job"
                }
            },
            {
                $match: {
                    status: { $ne: 0 }
                }
            },
            {
                $group: {
                    _id: "$location.address",
                    staff: { $push: "$$ROOT" }
                }
            },

        ])
        return staffs
    }
    static getSummary = async () => {
        const staffs = await staff.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    is_working: { $sum: { $cond: { if: { $eq: ['$status', 1] }, then: 1, else: 0 } } }
                }
            }
        ])
        return staffs

    }
    static findByIdStaff = async (id) => {
        const staffs = await staff.findById(id).populate('job').populate('position').populate('department')
        return staffs
    }
}

module.exports = StaffService