const express = require('express')
const asyncHandle = require('../helpers/asyncHandler')
const HistoryController = require('../controllers/history.controller')

const router = express.Router()
// router.post('/',asyncHandle(HistoryController.create))
router.get('/',asyncHandle(HistoryController.getAllHistory))
router.post('/device/:id',asyncHandle(HistoryController.getHistoryByIdDevice))
router.post('/staff/:id',asyncHandle(HistoryController.getHistoryByStaff))
router.get('/deviceUsed',(req,res,next)=>{
    res.render('deviceUsed',{ title: "Quản lý lịch sử sử dụng" })
})

module.exports = router