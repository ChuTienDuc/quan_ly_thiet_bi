const { StatusCodes, ReasonPhrases } = require("../utils/httpStatusCode")

class SuccessResponse {
    constructor({ message, status = StatusCodes.OK, reason = ReasonPhrases.OK, metadata = {},success = 1 }) {
        this.message = !message ? reason : message
        this.status = status
        this.metadata = metadata
        this.success = success
    }
    send(res, header = {}) {
        return res.status(this.status).json(this)
    }
}

class OK extends SuccessResponse {
    constructor({ message, metadata }) {
        super({ message, metadata })
    }
}

class Created extends SuccessResponse {
    constructor({ option = {} ,message, status = StatusCodes.CREATED, reason = ReasonPhrases.CREATED, metadata }) {
        super({ message, status, reason, metadata })
        this.option = option
    }
}

module.exports = {
    OK,Created,SuccessResponse
}