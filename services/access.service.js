const { user } = require('../models/model')
const { BadRequestError } = require('../responseHandle/error.response')
const bcrypt = require('bcrypt');

const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000;

class AccessService {
    static login = async ({ phoneNumber, password }) => {
        const foundUser = await user.findOne({ phoneNumber })
        if (!foundUser) {
            throw new BadRequestError("Số điện thoại hoặc mật khẩu không đúng!")
        }

        if (foundUser.status !== 1) {
            throw new BadRequestError("Tài khoản đã bị khóa!")
        }

        if (foundUser.lockedUntil && foundUser.lockedUntil > new Date()) {
            throw new BadRequestError("Tài khoản tạm khóa do đăng nhập sai quá 5 lần. Vui lòng thử lại sau!")
        }

        if (foundUser.lockedUntil && foundUser.lockedUntil <= new Date()) {
            foundUser.failedLoginAttempts = 0;
            foundUser.lockedUntil = null;
            await foundUser.save();
        }

        const match = await bcrypt.compare(password, foundUser.password)

        if (!match) {
            const failedLoginAttempts = (foundUser.failedLoginAttempts || 0) + 1;
            const updateData = { failedLoginAttempts };

            if (failedLoginAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
                updateData.lockedUntil = new Date(Date.now() + LOCK_TIME_MS);
                await user.findByIdAndUpdate(foundUser._id, updateData);
                throw new BadRequestError("Tài khoản tạm khóa do đăng nhập sai quá 5 lần. Vui lòng thử lại sau 15 phút!")
            }

            await user.findByIdAndUpdate(foundUser._id, updateData);
            throw new BadRequestError("Số điện thoại hoặc mật khẩu không đúng!")
        }

        if (foundUser.failedLoginAttempts > 0 || foundUser.lockedUntil) {
            foundUser.failedLoginAttempts = 0;
            foundUser.lockedUntil = null;
            await foundUser.save();
        }

        return foundUser;
    }
}
module.exports = AccessService
