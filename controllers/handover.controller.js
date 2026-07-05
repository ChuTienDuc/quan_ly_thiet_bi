const { SuccessResponse } = require("../responseHandle/success.response");
const HandOverService = require("../services/handover.service");

class HandOverController {
    static getAll = async (req, res, next) => {
        // console.log("isOpen:::",req.query.isOpen);
        new SuccessResponse({
            message: 'Lấy tất cả biên bản thành công!',
            metadata: await HandOverService.getAll({ userId: req.session.userId, isOpen: req.query.isOpen })
        }).send(res)
    }

    static generatePDF = async (req, res, next) => {
        new SuccessResponse({
            message: 'Tạo phiếu thành công!',
            metadata: await HandOverService.generatePDF({
                user: req.session.userId,
                ...req.body
            })
        }).send(res)
    }
    static getById = async (req, res, next) => {
        new SuccessResponse({
            message: 'Lấy dữ liệu thành công!',
            metadata: await HandOverService.getById(req.params.id)
        }).send(res)
    }
    static getSumaryOpen = async (req, res, next) => {
        // console.log(1);
        new SuccessResponse({
            message: 'Lấy dữ số lượng phiếu chưa in thành công!',
            metadata: await HandOverService.getSumaryOpen(req.body.userId)
        }).send(res)
    }
    static getByUserIdAndIsOpen = async (req, res, next) => {
        new SuccessResponse({
            message: 'Lấy danh sách phiếu đã lọc thành công!',
            metadata: await HandOverService.getDataByUserIdAndIsOpen(req.session.userId)
        }).send(res)
    }
    static exportAll = async (req, res, next) => {
        new SuccessResponse({
            message: 'In tất cả phiếu thành công',
            metadata: await HandOverService.exportAll()
        }).send(res)
    }
}


module.exports = HandOverController
