const express = require('express')
const asyncHandle = require('../helpers/asyncHandler')
const RequireDeviceController = require('../controllers/requireDevice.controller');
const { checkRole } = require('../auths');
const { USER } = require('../GVs/user.config');

const router = express.Router()
router.get('/staff', (req, res, next) => {
    res.render('requireDevice', { title: "Thông tin chi tiết thiết bị" })
});
router.get('/by-staff', asyncHandle(RequireDeviceController.getRequireDeviceByStaff))
router.post('/', asyncHandle(RequireDeviceController.create))
router.use(checkRole([USER.ADMIN, USER.ACCOUNTANT]))
router.get('/management', (req, res, next) => {
    res.render('requireDeviceManagement', { title: "Thông tin chi tiết thiết bị" })
});
router.get('/all', asyncHandle(RequireDeviceController.getAll))
router.post('/accept/:require_id', asyncHandle(RequireDeviceController.acceptRequireDevice))
router.post('/reject/:require_id', asyncHandle(RequireDeviceController.rejectRequireDevice))

module.exports = router