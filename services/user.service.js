const { user } = require("../models/model")
const { BadRequestError, InternalServerError } = require("../responseHandle/error.response")
const { removeUndefinedObject, updateNestedObjectParser } = require("../utils")
const bcrypt = require('bcrypt');

const MIN_PASSWORD_LENGTH = 6;

const validatePassword = (password, message = `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự!`) => {
    if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
        throw new BadRequestError(message)
    }
}

class UserService {
    static create = async ({ name, phoneNumber, password, role }) => {
        const existsUser = await user.findOne({ phoneNumber })
        if (existsUser) {
            throw new BadRequestError('User đã tồn tại!')
        }
        validatePassword(password)
        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = await user.create({
            name, phoneNumber, password: passwordHash, role
        })
        if (!newUser) {
            throw new BadRequestError('Tạo user lỗi!!')
        }
        return newUser
    }
    static update = async (userId, payload) => {
        const data = removeUndefinedObject(payload)
        const newUser = await user.findByIdAndUpdate(userId, updateNestedObjectParser(data), { new: true });
        if (!newUser) {
            throw new InternalServerError('Lỗi cập nhật user!')
        }
        return newUser
    }
    static getAll = async () => {
        const users = await user.find().lean()
        return users
    }
    static resetPassword = async (userId, newPassword) => {
        const User = await user.findById(userId).lean()
        if (!User) {
            throw new InternalServerError('Không tìm thấy user!')
        }
        validatePassword(newPassword, `Mật khẩu mới phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự!`)
        const passwordHash = await bcrypt.hash(newPassword, 10);
        const updatedUser = await user.findByIdAndUpdate(userId, { password: passwordHash }, { new: true })
        return updatedUser
    }
    static changePassword = async (userId, newPassword, currentPassword) => {
        const User = await user.findById(userId).lean()
        if (!User) {
            throw new InternalServerError('Không tìm thấy user!')
        }
        const isMatch = await bcrypt.compare(currentPassword, User.password);

        if (!isMatch) {
            throw new InternalServerError('Mật khẩu không hợp lệ!')
        }
        validatePassword(newPassword, `Mật khẩu mới phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự!`)
        const passwordHash = await bcrypt.hash(newPassword, 10);

        const newUser = await user.findByIdAndUpdate(userId, { password: passwordHash }, { new: true })

        return newUser
    }
}

module.exports = UserService
