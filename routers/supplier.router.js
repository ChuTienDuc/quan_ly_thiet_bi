const express = require('express')
const asyncHandle = require('../helpers/asyncHandler')
const SupplierController = require('../controllers/supplier.controller')
const { USER } = require('../GVs/user.config')
const { checkRole } = require('../auths')


const router = express.Router()
router.get('/',asyncHandle(SupplierController.getAll))
router.use(checkRole([USER.ADMIN, USER.TECHNIQUE]))
router.post('/',asyncHandle(SupplierController.create))

module.exports = router