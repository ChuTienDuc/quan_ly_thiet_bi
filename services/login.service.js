const { InternalServerError, BadRequestError } = require("../responseHandle/error.response")
const { user } = require('../models/model')
class LoginService{
    static checkLogin = async(phoneNumber,password,reqSession)=>{
        const userFound = await user.findOne(
            {
                $and: [
                    { phoneNumber: phoneNumber },
                    { password: password }
                ]
            }
        )
        if(userFound){
            session = req.session;
            session.userid = req.body.phoneNumber;
            session.login = true
        }
    }
}
module.exports = LoginService