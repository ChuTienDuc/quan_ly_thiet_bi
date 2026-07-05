const express = require('express')
const asyncHandle = require('../helpers/asyncHandler')
const UserController = require('../controllers/user.controller')
const { checkRole } = require('../auths')
const { USER } = require('../GVs/user.config')
const router = express.Router()

router.get('/login', (req, res, next) => {
    res.render("login", { title: "Đăng nhập" })
})
router.post('/changePassword/:userId', asyncHandle(UserController.changePassword))

router.use(checkRole([USER.ADMIN]))

router.get('/', (req, res, next) => {
    res.render("user", { title: "Quản lý User" })
})
router.post('/', asyncHandle(UserController.create))
router.get('/getAll', asyncHandle(UserController.getAll))
router.post('/resetPassword/:userId', asyncHandle(UserController.resetPassword))
router.patch('/:userId', asyncHandle(UserController.update))

module.exports = router