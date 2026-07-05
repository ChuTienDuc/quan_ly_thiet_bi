const express = require('express')
const asyncHandle = require('../helpers/asyncHandler')
const InventoryController = require("../controllers/inventory.controller")
const router = express.Router()
router.post('/findByDeviceId', asyncHandle(InventoryController.findByDeviceId))
router.get('/', asyncHandle(InventoryController.getAll))


module.exports  = router
