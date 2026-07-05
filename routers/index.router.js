const express = require('express')

const asyncHandle = require('../helpers/asyncHandler')
const { checkLogin } = require('../auths')
const HandOverController = require('../controllers/handover.controller')
const router = express.Router()

router.use('/login', (req, res, next) => {
    res.render('login')
})
router.use('/api/', require('./access.router'))

// Public handover routes (used by PDF renderer)
router.get('/api/handover/preview', (req, res, next) => {
    res.render('contentPDF', { title: "Chi tiết phiếu bàn giao" })
})
router.post('/api/handover/getSumary', asyncHandle(HandOverController.getSumaryOpen))
router.get('/api/handover/preview-data/:id', asyncHandle(HandOverController.getById))

router.use(checkLogin)

router.use('/api/handover', require('./handover.router'))
router.use('/api/device', require('./device.router'))
router.use('/api/inventory', require('./inventory.router'))
router.use('/api/require-device', require('./requireDevice.router'))
router.use('/api/staff', require('./staff.router'))
router.use('/api/user', require('./user.router'))
router.use('/api/supplier', require('./supplier.router'))
router.use('/api/history', require('./history.router'))
router.use('/api/department', require('./department.router'))
router.use('/api/position', require('./position.router'))
router.use('/api/job', require('./job.router'))
router.use('/api/location', require('./location.router'))
router.use('/api/chatbot', require('./chatbot.router'))

router.get("/", (req, res, next) => {
    res.render('index', { title: "Quản lý Minh Việt"})
})
module.exports = router
