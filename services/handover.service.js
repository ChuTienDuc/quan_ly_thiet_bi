const {
    handover,
    user
} = require("../models/model")
const {
    InternalServerError,
    BadRequestError
} = require("../responseHandle/error.response")
const puppeteer = require('puppeteer-core');
const path = require('path');
const {
    HANDOVER
} = require("../GVs/handover.config");
const {
    Types
} = require('mongoose');
const {
    convertToObjectId
} = require("../utils");
const {
    port
} = require("../GVs/port.config")
class HandoverService {

    static create = async ({
        user,
        staff,
        type,
        note,
        signDate,
        file,
        deviceHandover = [],
        deviceRevoke = [],
        isOpen = true
    }) => {
        const handoverDoc = await handover.create({
            user,
            staff,
            type,
            note,
            signDate,
            file,
            deviceHandover,
            deviceRevoke,
            isOpen
        })
        if (!handoverDoc) {
            throw InternalServerError('Lỗi tạo phiếu bàn giao!')
        }
        return handoverDoc
    }
    static findByStaffAndIsOpen = async ({
        staff,
        isOpen = true,
        type = [0, 1, 2]
    }) => {
        const handoverIsOpen = await handover.findOne({
            staff,
            isOpen,
            type: {
                $in: type
            }
        })
        return handoverIsOpen ? handoverIsOpen : null
    }
    static getById = async (id) => {
        return await handover.findById(id).populate({
            path: 'staff',
            populate: [{
                path: 'job',
                model: 'job'
            },
            {
                path: 'department',
                model: 'department'
            },
            {
                path: 'position',
                model: 'position'
            },
            {
                path: 'manager',
                model: 'staff',
                select: 'name'
            },
            ]
        }).lean()
    }
    static closeHandover = async ({
        handoverId
    }) => {
        const handoverDoc = await handover.findById(handoverId)
        if (!handoverDoc) {
            throw new BadRequestError('Không tồn tại phiếu bàn giao!')
        }
        handoverDoc.isOpen = false;
        const {
            modifiedCount
        } = await handoverDoc.updateOne(handoverDoc)
        return modifiedCount
    }

    static generateNewNo = async (year) => {
        const latestDoc = await handover.findOne().sort('-no').exec();
        let newNo = 1;
        if (latestDoc.no) {
            newNo = latestDoc.no + 1;
        }
        if (year != new Date(latestDoc.createdAt).getFullYear()) {
            newNo = 1
        }
        return newNo;
    }

    static getAll = async ({
        isOpen,
        userId
    }) => {
        var query = isOpen == "true" ? {
            isOpen,
            user: convertToObjectId(userId)
        } : {};
        var User = await user.findById(userId).lean()
        var handoverDoc = await handover.find(query).populate({
            path: 'staff',
            populate: [{
                path: 'job',
                model: 'job'
            },
            {
                path: 'department',
                model: 'department'
            },
            {
                path: 'position',
                model: 'position'
            },
            {
                path: 'manager',
                model: 'staff',
                select: 'name'
            },
            ]
        }).populate("user")
        if (User.role == 0 || User.role == 2) {
            return handoverDoc
        }
        handoverDoc = handoverDoc.filter(_ => _.user.role == User.role)
        return handoverDoc
    }
    static generatePDF = async ({
        user,
        id
    }) => {
        // Xử lý số phiếu bàn giao
        const newNo = await HandoverService.generateNewNo(new Date().getFullYear())
        console.log("new No:::", newNo);
        //check phiếu bàn giao đã đóng chưa. đóng rồi thì throw badrequest
        const handoverDoc = await handover.findById(id)
        handoverDoc.no = newNo
        await handoverDoc.save()
        if (!handoverDoc) {
            throw new BadRequestError('Không tồn tại phiếu bàn giao!')
        }
        if (!handoverDoc.isOpen) {
            throw new BadRequestError('phiếu bàn giao không hợp lệ!')
        }

        // Đóng phiếu
        handoverDoc.isOpen = false;

        // Xử lý signDate là ngày in ra phiếu.
        handoverDoc.signDate = Date.now()

        // tạo phiếu bàn giao
        const browser = await puppeteer.launch({
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
        });
        const page = await browser.newPage();
        // await page.goto(`${req.protocol}://${req.get('host')}` + "/api/handover/preview", {
        //     waitUntil: "networkidle2"
        // });

        await page.goto(`http://localhost:${port}/api/handover/preview?id=${id}`, {
            waitUntil: 'networkidle0'
        });

        await page.waitForSelector('#content-pdf');
        await page.waitForFunction(() => window.pdfReady === true && document.querySelector('#content-pdf')?.innerHTML.trim().length > 0);

        await page.setViewport({
            width: 1680,
            height: 1050
        });

        const todayDate = new Date();

        // Xác định kích thước khung trang
        const {
            width,
            height
        } = await page.evaluate(() => {
            const content = document.querySelector('body');
            const boundingRect = content.getBoundingClientRect();
            return {
                width: boundingRect.width,
                height: boundingRect.height,
            };
        });

        // Điều chỉnh kích thước trang in
        await page.setViewport({
            width: Math.ceil(width),
            height: Math.ceil(height),
            deviceScaleFactor: 1,
        });

        const pdfn = await page.pdf({
            path: `${path.join(__dirname, '../public/handover', id + ".pdf")}`,
            format: 'A4',
            margin: {
                top: '0 px',
                right: '0px',
                bottom: '0px',
                left: '0px'
            },
            printBackground: true,
            displayHeaderFooter: false
        })

        // const pdfPath = path.join(__dirname, '../public/handover', id + ".pdf");

        // const imgWidth = await page.$eval('#content-pdf img', img => img.width);
        // const imgHeight = await page.$eval('#content-pdf img', img => img.height);

        // const pdfOptions = {
        //     path: pdfPath,
        //     // format: 'A4',
        //     width: `${imgWidth}px`,
        //     height: `${imgHeight}px`,
        //     margin: {
        //         top: '0 px',
        //         right: '0px',
        //         bottom: '0px',
        //         left: '0px'
        //     },
        //     padding: {
        //         top: '0px',
        //         right: '0px',
        //         bottom: '0px',
        //         left: '0px',
        //     },
        //     printBackground: true,
        //     displayHeaderFooter: false
        // };

        // await page.pdf(pdfOptions);

        // await page.screenshot({
        //     path: path.join(__dirname, '../public/handover', id + "_screenshot.png")
        // });

        await browser.close();

        const pdfURL = path.join(__dirname, '../public/handover', id + ".pdf")

        console.log(pdfURL);

        // res.set({
        //     "content-Type": "application/pdf",
        //     "Content-Length": pdfn.length
        // })

        // res.sendFile(pdfURL)
        handoverDoc.file = pdfURL;
        await handoverDoc.save()
        return handoverDoc

        // res.download(pdfURL, function(err) {
        //     if(err) {
        //         console.log(err);
        //     }
        // })
    }
    static getSumaryOpen = async (idUser) => {
        // const userObjectId = new Types.ObjectId(idUser)
        const idOpenStatus = true
        const handoverDoc = await handover.countDocuments({
            'user': convertToObjectId(idUser),
            'isOpen': idOpenStatus
        })
        return handoverDoc
    }
    static getDataByUserIdAndIsOpen = async (idUser) => {
        const handoverDoc = await handover.aggregate([{
            $match: {
                user: convertToObjectId(idUser),
                isOpen: true
                //   $expr: { $eq: ['$' + id_staff, '$' + id_staff] } // Thay 'id_staff' bằng tên trường chứa id_staff trong collection của bạn
            }
        }])
        return handoverDoc
    }
    static exportAll = async () => {
        const handovers = await handover.find({ isOpen: true });
        var arrayHandover = []
        if (handovers.length == 0) throw new BadRequestError('Không có phiếu nào đang mở');
        for (let i = 0; i < handovers.length; i++) {
            const handover = handovers[i];
            arrayHandover.push(await this.generatePDF({ id: handover._id }))
        }
        return arrayHandover
    }
}
module.exports = HandoverService
