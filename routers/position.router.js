const express = require('express')
const asyncHandle = require('../helpers/asyncHandler')
const PositionController = require('../controllers/position.controller')
const { USER } = require('../GVs/user.config')
const { checkRole } = require('../auths')

const router = express.Router()
router.use(checkRole([USER.ADMIN, USER.ACCOUNTANT]))
router.post('',asyncHandle(PositionController.create))
router.get('',asyncHandle(PositionController.getAll))
router.patch('/:positionId',asyncHandle(PositionController.update))

module.exports = router