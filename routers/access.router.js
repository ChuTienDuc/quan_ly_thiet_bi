const express = require('express')
const asyncHandle = require('../helpers/asyncHandler')
const AccessController = require('../controllers/access.controller')
const router = express.Router()

router.post('/login',asyncHandle(AccessController.login))
router.get('/logout',asyncHandle(AccessController.logout))

module.exports = router