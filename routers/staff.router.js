const express = require('express')
const asyncHandle = require('../helpers/asyncHandler')
const StaffController = require('../controllers/staff.controller')
const { checkRole } = require('../auths')
const { USER } = require('../GVs/user.config')
const router = express.Router()

router.get('/getToStaffsHanvover',asyncHandle(StaffController.getStaffToHanover) )
router.get('/getSummary',asyncHandle(StaffController.getSummary) )

router.use(checkRole([USER.ADMIN, USER.ACCOUNTANT]))
router.get('/getAll',asyncHandle(StaffController.getAll))
router.post('/',asyncHandle(StaffController.create))
router.patch('/:staffId',asyncHandle(StaffController.update))

router.get('/', (req,res,next)=>{
    res.render('staff', {title: "Quản lý nhân viên"})
})

module.exports = router