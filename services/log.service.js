'use strict'

const { log } = require("../models/model")

class LogService {
    static async create({
        method, code, url, ip
    }) {
        const newLog = await log.create({
            method: method,
            code: code,
            url: url,
            ip: ip
        })
        return newLog
    }
    static async getAll() {
        const logs = await log.find().lean()
        return logs
    }
}

module.exports = LogService
