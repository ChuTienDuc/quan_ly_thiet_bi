const express = require('express')
const asyncHandle = require('../helpers/asyncHandler')
const DepartmentController = require('../controllers/department.controller')
const { USER } = require('../GVs/user.config')
const { checkRole } = require('../auths')
const router = express.Router()

router.use(checkRole([USER.ADMIN, USER.ACCOUNTANT]))
router.post('',asyncHandle(DepartmentController.create))
router.get('',asyncHandle(DepartmentController.getAll))
router.patch('/:departmentId',asyncHandle(DepartmentController.update))

module.exports = router