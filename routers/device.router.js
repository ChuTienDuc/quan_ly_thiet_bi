const express = require('express')
const asyncHandle = require('../helpers/asyncHandler')
const DeviceController = require('../controllers/device.controller')
const { checkRole } = require('../auths')
const { USER } = require('../GVs/user.config')
const router = express.Router()

router.get('/', asyncHandle(DeviceController.getAll))
router.get('/by-staff', asyncHandle(DeviceController.getByStaff))

router.post('/details', asyncHandle(DeviceController.getDetailsByType))
router.get('/getSummary', asyncHandle(DeviceController.getSummary))
router.get('/getByTypeAndQuantity', asyncHandle(DeviceController.getDeviceByTypeAndQuantity))
router.get('/getAllInventories', asyncHandle(DeviceController.getAllInventories))
router.use(checkRole([USER.ADMIN, USER.TECHNIQUE]))
router.get('/case', (req, res, next) => {
    res.render('case', { title: "Quản lý Case" })
})
router.get('/details/:id', (req, res, next) => {
    res.render('devicedetails', { title: "Thông tin chi tiết thiết bị" })
})
router.get('/monitor', (req, res, next) => {
    res.render('monitor', { title: "Quản lý Monitor" })
})
router.get('/wacom', (req, res, next) => {
    res.render('wacom', { title: "Quản lý Wacom" })
})

router.get('/webcam', (req, res, next) => {
    res.render('webcam', { title: "Quản lý Webcam" })
})
router.get('/headphone', (req, res, next) => {
    res.render('headphone', { title: "Quản lý Headphone" })
})
router.get('/ups', (req, res, next) => {
    res.render('ups', { title: "Quản lý UPS" })
})
router.get('/mouse-keyboard', (req, res, next) => {
    res.render('mouse-keyboard', { title: "Quản lý Chuột bàn phím" })
})
router.get('/component', (req, res, next) => {
    res.render('component', { title: "Quản lý phụ kiện" })
})
router.get('/inventory', (req, res, next) => {
    res.render('inventory', { title: "Quản lý nhà kho" })
})
router.post('/', asyncHandle(DeviceController.create))
router.post('/createMany', asyncHandle(DeviceController.createMany))
router.post('/getAllByType', asyncHandle(DeviceController.getAllByType))
router.post('/handoverAll', asyncHandle(DeviceController.handoverAll))
router.post('/revokeAll', asyncHandle(DeviceController.revokeAll))
router.post('/handover', asyncHandle(DeviceController.handover))
router.post('/revokeDevice', asyncHandle(DeviceController.revokeDevice))
router.post('/revokeComponent', asyncHandle(DeviceController.revokeComponent))
// lấy theo loại thiết bị và số lượng > 0

router.patch('/:deviceId', asyncHandle(DeviceController.update))
// lấy loại thiết và số lượng
router.post('/increase', asyncHandle(DeviceController.increaseKeyBoardOrMouse))
// Lấy tất cả thiết bị để bàn giao



module.exports = router