const { SuccessResponse } = require("../responseHandle/success.response")
class Login{
    static login = async(req,res,next)=>{
        new SuccessResponse({
            message: 'Lấy tất cả thiết bị thành công!',
            metadata: await LoginService.checkLogin(req.body.phoneNumber, req.body.password)
        }).send(res)
    }
}
module.exports = Login