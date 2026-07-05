const { BadRequestError, InternalServerError } = require("../responseHandle/error.response")
const { SuccessResponse } = require("../responseHandle/success.response")
const AccessService = require("../services/access.service")
const { getInfoData } = require("../utils")

class AccessController {
    static login = async (req, res, next) => {
        const foundUser = await AccessService.login(req.body)
        req.session.regenerate(async function (err) {
            if (err) {
                throw new InternalServerError()
            }
            req.session.login = true;
            req.session.userId = foundUser._id
            req.session.role = foundUser.role
            req.session.name = foundUser.name
            res.cookie('role', foundUser.role, { maxAge: 60 * 60 * 1000 })
            res.cookie('phoneNumber', foundUser.phoneNumber, { maxAge: 60 * 60 * 1000 })
            res.cookie('userId', foundUser._id)
            res.cookie('username', foundUser.name)
            new SuccessResponse({
                message: 'Login success!',
                metadata: getInfoData({ fields: ["name", "phoneNumber", "role",], object: foundUser })
            }).send(res)
        });
    }
    static logout = async (req, res, next) => {
        try {
            req.session.login = false;
            req.session.userId = null;
            req.session.role = null;

            req.session.destroy((err) => {
                if (err) {
                    return next(err); 
                }

                res.clearCookie('connect.sid');
                res.cookie('level', "", { maxAge: 0 });
                res.cookie('username', "", { maxAge: 0 });

                new SuccessResponse({
                    message: 'Logout success!',
                }).send(res);
            });
        } catch (err) {
            next(err);
        }
    }

}
module.exports = AccessController