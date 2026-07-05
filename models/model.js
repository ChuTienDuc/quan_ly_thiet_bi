const { Schema, model } = require('mongoose')
// Declare the Schema of the Mongo model
const staffSchema = new Schema({
    code: {
        type: Number,
        // unique: true,
    },
    name: {
        type: String,
        required: true,
        index: true,
    },
    company: {
        type: String,
    },
    location: {
        address: { type: String },
        floor: { type: String }
    },
    phoneNumber: {
        type: String,
        unique: true,
        require: [true, "Please provide a vaild phone number"],
        minLength: 10,
        maxLength: 10,
    },
    department: {
        type: Schema.Types.ObjectId,
        ref: 'department'
    },
    job: {
        type: Schema.Types.ObjectId,
        ref: 'job'
    },
    position: {
        type: Schema.Types.ObjectId,
        ref: 'position'
    },
    manager: {
        type: Schema.Types.ObjectId,
        ref: 'staff'
    },
    mouse: {
        type: Number,
        default: 0
    },
    keyboard: {
        type: Number,
        default: 0
    },
    status: {
        type: Number,
        default: 1,
        enum: [0, 1]
    }
}, {
    timestamps: true,
    versionKey: false
});
const supplierSchema = new Schema({
    name: {
        type: String,
        require: true,
    },
    phoneNumber: {
        type: String,
        unique: true,
    },
    address: {
        type: String
    },
    VAT: {
        type: Number
    },
    status: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true,
    versionKey: false
})
const userSchema = new Schema({
    name: {
        type: String,
        require: [true, "Please provide a vaild username"],
    },
    phoneNumber: {
        type: String,
        unique: true,
        require: [true, "Please provide a vaild phone number"],
        minLength: 10,
        maxLength: 10,
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        minLength: [6, "Password must be at least 6 characters"],
    },
    role: {
        type: Number,
        enum: [0, 1, 2, 3],
        default: 3,
    },
    status: {
        type: Number,
        default: 1,
        enum: [0, 1],
    },
    failedLoginAttempts: {
        type: Number,
        default: 0,
    },
    lockedUntil: {
        type: Date,
        default: null,
    }
}, {
    timestamps: true,
    versionKey: false
})

const deviceSchema = new Schema({
    staff: {
        type: Schema.Types.ObjectId,
        ref: 'staff'
    },
    name: {
        type: String
    },
    supplier: {
        type: Schema.Types.ObjectId,
        ref: 'supplier'
    },
    user: {
        type: Schema.Types.ObjectId,
        require: true,
        ref: 'user'
    },
    type: {
        type: String,
        require: true,
        enum: ['case', 'wacom', 'headphone', 'monitor', 'webcam', 'component', 'ups', 'keyboard', 'mouse']
    },
    location: {
        address: { type: String },
        floor: { type: String }
    },
    attributes: {
        type: Schema.Types.Mixed,
    },
    totalPrice: {
        type: Number
    },
    billPrice: {
        type: Number
    },
    expirationDate: {
        type: Date
    },
    note: {
        type: String
    },
    status: { type: Number, default: 1, enum: [0, 1, -1] },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    versionKey: false
})
deviceSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
})
const caseSchema = new Schema({
    macAddress: {
        type: String
    },
    num: {
        type: Number,
        unique: true,
        require: true,
        // validate: {
        //     validator: function (value) {
        //         return validateUniqueField(this.constructor, "num", value, "Số máy")
        //     },
        // },
    },

    ipAddress: {
        type: String
    },
    mainBoard: {
        type: String
    },
    chipset: {
        type: String
    },
    ram: {
        type: [String]
    },
    VGA: [{
        _id: false,
        name: {
            type: String
        },
        vram: {
            type: String
        },
        connector: [{
            type: String
        }]
    }],
    PSU: {
        type: String
    },
    hardDrives: [
        {
            _id: false,
            size: {
                type: String
            },
            type: {
                type: String
            },
            brand: {
                type: String
            },
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    versionKey: false
})
caseSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
})
const wacomSchema = new Schema({
    seriesNumber: {
        type: String,
        unique: true,
    },
    num: {
        type: Number,
        unique: true,
        require: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    versionKey: false
})
wacomSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
})
const headphoneSchema = new Schema({
    num: {
        type: Number,
        unique: true,
        require: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    versionKey: false
})
headphoneSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
})
const webcamSchema = new Schema({
    num: {
        type: Number,
        unique: true,
        require: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    versionKey: false
})
webcamSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
})
const componentSchema = new Schema({
    type: {
        type: String,
    },
    attributes: {
        type: Schema.Types.Mixed
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    versionKey: false
})
componentSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
})
const monitorSchema = new Schema({
    connector: {
        type: Array
    },
    num: {
        type: Number,
        unique: true,
        require: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    versionKey: false
})
monitorSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
})
const keyboardSchema = new Schema({

})
const mouseSchema = new Schema({

})
const historySchema = new Schema({
    device: {
        type: Schema.Types.Mixed,
        require: true
    },
    staff: {
        type: Schema.Types.ObjectId,
        ref: 'staff'
    },
    old_device: {
        type: Schema.Types.Mixed
    },
    num_case: {
        type: Number
    },
    type: {
        type: Number,
        enum: [0, 1]
        // 0 thu thu hồi, 1 bàn giao
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    count: {
        type: Number
    },
    note: {
        type: String,
        default: ''
    },
    status: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true,
    versionKey: false
})
const handoverDocSchema = new Schema({
    no: {
        type: Number,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    staff: {
        type: Schema.Types.ObjectId,
        ref: 'staff'
    },
    deviceHandover: {
        type: Array,
        default: []
    },
    deviceRevoke: {
        type: Array,
        default: []
    },
    type: { type: Number, require: true, enum: [0, 1, 2] },
    // TODO 1:  0: Thu hồi tất cả, 1 Bàn giao tất cả,  2: Cập nhật bổ sung (thu hồi)
    note: {
        type: String
    },
    signDate: {
        type: Date
    },
    isOpen: {
        type: Boolean,
        require: true
    },
    file: {
        type: String
    },
    status: {
        type: Number,
        enum: [0, 1],
        default: 1
    }
}, {
    timestamps: true,
    versionKey: false
})
const inventorySchema = new Schema({
    device: {
        type: Schema.Types.ObjectId,
        ref: 'device'
    },
    location: {
        type: String,
        default: 'Kho tầng 3'
    },
    total: {
        type: Number,
        default: 1
    },
    quantity: {
        type: Number,
        require: true
    },
}, {
    timestamps: true,
    versionKey: false
});
const UPSSchema = new Schema({
    PSU: {
        type: Number,
    },
    capacity: {
        type: Number
    },
    num: {
        type: Number,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    versionKey: false
})
UPSSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
})
const locationSchema = new Schema({
    address: {
        type: String,
        require: true,
        unique: true
    },
    floor: {
        type: Number,
        require: true,
        unique: true
    },
    company: [
        {
            unique: true,
            require: true,
            type: String
        }
    ],
    job: [
        {
            require: true,
            type: String
        }
    ]

})

const departmentSchema = new Schema({
    name: {
        type: String,
        require: true,
        unique: true
    },
    status: {
        type: Number,
        enum: [0, 1],
        default: 1
    }
}, {
    timestamps: true,
    versionKey: false
})

const jobSchema = new Schema({
    name: {
        type: String,
        require: true,
    },
    status: {
        type: Number,
        enum: [0, 1],
        default: 1
    }
}, {
    timestamps: true,
    versionKey: false
})
const positionSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    level: {
        type: Number,
        enum: [0, 1, 2, 3],
        // TODO 0: Ban lãnh đạo, 1: Trưởng bộ phận, 2: Nhân viên, 3: Thực tập
    },
    status: {
        type: Number,
        enum: [0, 1],
        default: 1
    }
}, {
    timestamps: true,
    versionKey: false
})
const logSchema = new Schema({
    method: {
        type: String,
        require: true
    },
    url: {
        type: String,
        require: true
    },
    ip: {
        type: String,
        require: true
    },
    code: {
        type: Number,
        enum: [0, 1],
        // 0: body, 1: query
    }
}, {
    timestamps: true,
    versionKey: false
})
const requireSchema = new Schema({
    staff: {
        type: Schema.Types.ObjectId,
        ref: 'staff'
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    devices: [{
        type: Schema.Types.ObjectId,
        ref: 'device'
    }],
    devices_return: [{
        type: Schema.Types.ObjectId,
        ref: 'device'
    }],
    note_staff: {
        type: String,
    },
    note_user: {
        type: String,
    },
    type: {
        type: Number,
        enum: [0, 1, 2],
        // TODO: 2-Hoàn trả, 1-Bàn giao, 0-Luân chuyển
        default: 1
    },
    status: {
        type: Number,
        enum: [
            0, // Rejected - Từ chối tổng quát
            1, // Accepted - Chấp thuận tổng quát
            2, // Pending - Đang chờ xử lý
            3, // Approved by Admin - Hành chính duyệt
            4, // Rejected by Admin - Hành chính từ chối
            5, // Approved by Tech - Kỹ thuật duyệt
            6, // Rejected by Tech - Kỹ thuật từ chối
        ],
        default: 2, // Mặc định: Đang chờ xử lý
    },
}, {
    timestamps: true,
    versionKey: false
})

const validateUniqueField = async function (model, fieldName, fieldValue, nameUnique) {
    const existingRecord = await model.findOne({ [fieldName]: fieldValue });
    if (existingRecord) {
        throw new Error(`${nameUnique} '${fieldValue}' đã tồn tại`);
    }
};
//Export the model
module.exports = {
    staff: model('staff', staffSchema),
    supplier: model('supplier', supplierSchema),
    device: model('device', deviceSchema),
    user: model('user', userSchema),
    casePC: model('case', caseSchema),
    monitor: model('monitor', monitorSchema),
    history: model('history', historySchema),
    wacom: model('wacom', wacomSchema),
    headphone: model('headphone', headphoneSchema),
    webcam: model('webcam', webcamSchema),
    component: model('component', componentSchema),
    handover: model('handover', handoverDocSchema),
    inventory: model('inventory', inventorySchema),
    location: model('location', locationSchema),
    ups: model('ups', UPSSchema),
    department: model('department', departmentSchema),
    job: model('job', jobSchema),
    position: model('position', positionSchema),
    keyboard: model('keyboard', keyboardSchema),
    mouse: model('mouse', mouseSchema),
    requireDevice: model('require_device', requireSchema),
    log: model('log', logSchema)
}
