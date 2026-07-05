const express = require('express')
const asyncHandle = require('../helpers/asyncHandler')
const LocationController = require('../controllers/location.controller')


const router = express.Router()

router.post('/',asyncHandle(LocationController.create))
router.get('/getAll',asyncHandle(LocationController.getAll))

module.exports = router