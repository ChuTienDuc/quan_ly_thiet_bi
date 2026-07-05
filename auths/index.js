const { user } = require("../models/model");
const asyncHandle = require("../helpers/asyncHandler");
const { AuthFailureError } = require("../responseHandle/error.response");

const checkLogin = asyncHandle(async (req, res, next) => {
    if (req.session.login) {
        next()
    } else {
        res.redirect('/login')
    }
})
const checkRole = (role) => {
    return async(req, res, next) => {
        if (role.includes(Number(req.session.role))) {
            return next()
        }
        // const foundUser =  await user.findById(req.session.userId);
        // if (role.includes(foundUser.role)) {
        //     return next()
        // }
        res.redirect('/');
        // throw new AuthFailureError('Bạn không có quyền truy cập')
    }
}
module.exports = {
    checkLogin,
    checkRole
}