const express = require('express')
const asyncHandle = require('../helpers/asyncHandler')
const JobController = require('../controllers/job.controller')
const { checkRole } = require('../auths')
const { USER } = require('../GVs/user.config')
const router = express.Router()

router.use(checkRole([USER.ADMIN, USER.ACCOUNTANT]))

router.get('/view', (req, res, next) => {
    res.render('job')
})

router.post('', asyncHandle(JobController.create))
router.get('', asyncHandle(JobController.getAll))
router.patch('/:jobId', asyncHandle(JobController.update))

module.exports = router