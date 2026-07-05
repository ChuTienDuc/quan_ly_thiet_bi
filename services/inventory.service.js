const { inventory } = require("../models/model");

class InventoryService {
    static create = async ({ device, location, total }) => {
        const quantity = total;
        return await inventory.create({ device, location, total, quantity })
    }
    static getInventoryDevice = async (device) => {
        return await inventory.findOne({ device: device }).lean()
    }
    static updateQuantityByDevice = async (device, quantityChange) => {
        var inven = await inventory.findOne({ device })
        inven.quantity += quantityChange
        const { modifiedCount } = await inven.updateOne(inven);
        return modifiedCount
    }
    static findByDeviceId = async (_id) => {
        return await inventory.findOne({
            device: _id
        }).lean()
    }
    static getByDeviceIdAndQuantity = async (deviceId) => {
        const inventoryFound = await inventory.aggregate([
            {
                $match: {
                    device: deviceId,
                    quantity: { $gt: 0 }
                }
            },
            {
                $lookup: {
                    from: "devices",
                    localField: "device",
                    foreignField: "_id",
                    as: "device"
                }
            },
            {
                $unwind: "$device"
            },
            {
                $lookup: {
                    from: "suppliers",
                    localField: "device.supplier",
                    foreignField: "_id",
                    as: "suppiler"
                }
            },
            {
                $unwind: "$suppiler",
            },
        ])
        return inventoryFound
    }
    static getAll = async (query) => {
        const matchStage = { $match: {} };
        if (query) {
            const { quantity } = query;
            if (quantity === 0) {
                matchStage.$match.quantity = 0;
            } else if (quantity == 1) {
                matchStage.$match.quantity = { $gt: parseInt(0) };
            }
        }
        const inventories = await inventory.aggregate([
            matchStage,
            {
                $lookup: {
                    from: "devices",
                    localField: "device",
                    foreignField: "_id",
                    as: "device"
                }
            },
            {
                $unwind: "$device"
            },
            {
                $lookup: {
                    from: "suppliers",
                    localField: "device.supplier",
                    foreignField: "_id",
                    as: "supplier"
                }
            },
            {
                $unwind: {
                    path: "$supplier",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    "device.supplier": "$supplier"
                }
            },
            {
                $project: {
                    supplier: false
                }
            },
            {
                $group: {
                    _id: "$device.type",
                    device: { $push: "$$ROOT" }
                }
            },
            {
                $project: {
                    type: "$_id",
                    _id: false,
                    device: 1
                }
            },
        ]);

        return inventories;
    };

}

module.exports = InventoryService