const { SuccessResponse } = require("../responseHandle/success.response")
const ChatbotService = require("../services/chatbot.service")

class ChatbotController {
    static sendMessage = async (req, res, next) => {
        const { message } = req.body
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({ success: 0, message: 'Tin nhắn không hợp lệ' })
        }
        if (message.length > 500) {
            return res.status(400).json({ success: 0, message: 'Tin nhắn tối đa 500 ký tự' })
        }

        const result = await ChatbotService.chat(req.session, message.trim())
        new SuccessResponse({
            message: 'OK',
            metadata: result
        }).send(res)
    }

    static clearHistory = async (req, res, next) => {
        ChatbotService.clearHistory(req.session)
        new SuccessResponse({
            message: 'Đã xóa lịch sử chat',
            metadata: {}
        }).send(res)
    }
}

module.exports = ChatbotController
