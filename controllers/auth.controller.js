class Auth {
    static checkLogin = (req, res, next) => {
        // console.log(req.session.login);
        if (req.session.login) {
            return next()
        }
        else {
            // res.json({
            //     success: 0,
            //     msg: 'not Login',
            //     statusCode: 402
            // })
            res.redirect('/login')
        }
    }
}
module.exports = Auth