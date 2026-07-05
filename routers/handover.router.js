const express = require('express')
const asyncHandle = require('../helpers/asyncHandler')
const { checkRole } = require('../auths')
const HandOverController = require('../controllers/handover.controller')
const { USER } = require('../GVs/user.config')
const router = express.Router()

router.get('/getAll', asyncHandle(HandOverController.getAll))
router.get('/files', (req, res, next) => {
    res.render('handoverPDF', { title: "Phiếu bàn giao" })
})
router.get('/filter', asyncHandle(HandOverController.getByUserIdAndIsOpen))
router.use(checkRole([USER.ADMIN, USER.ACCOUNTANT, USER.TECHNIQUE]))

router.post('/print-pdf', asyncHandle(HandOverController.generatePDF))

// get sumary of handOver is  Open
router.post('/export', asyncHandle(HandOverController.exportAll))


module.exports = router
