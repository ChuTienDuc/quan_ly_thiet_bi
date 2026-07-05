const express = require('express')
const asyncHandle = require('../helpers/asyncHandler')
const ChatbotController = require('../controllers/chatbot.controller')
const rateLimit = require('express-rate-limit')

const router = express.Router()

const chatbotLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    message: { success: 0, message: 'Bạn đã gửi quá nhiều tin nhắn. Vui lòng đợi 1 phút.' },
    standardHeaders: true,
    legacyHeaders: false,
})

router.post('/message', chatbotLimiter, asyncHandle(ChatbotController.sendMessage))
router.post('/clear', asyncHandle(ChatbotController.clearHistory))

module.exports = router
