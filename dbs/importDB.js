const monitorJson = require("../private/monitor.json");
const caseJson = require("../private/case.json");
const headphoneJson = require("../private/headphone.json");
const staffJSON = require("../private/staff.json");
const wacomJson = require("../private/wacom.json");
const jobJson = require("../private/jobs.json");
const departmentsJson = require("../private/departments.json");
const positionsJson = require("../private/positions.json");
const deviceService = require("../services/device.service");
const { convertToObjectId } = require("../utils");
const bcrypt = require('bcrypt');

const {
  job,
  department,
  position,
  monitor,
  device,
  casePC,
  headphone,
  wacom,
  staff,
  inventory,
  user,
  handover,
  keyboard,
  mouse,
  history,
} = require("../models/model");
const StaffService = require("../services/staff.service");
const { DEVICE } = require("../GVs/device.config");

async function processDevice(json, model, name) {
  await model.deleteMany();
  for (let index = 0; index < json.items.length; index++) {
    const element = json.items[index];
    element.attributes.num = +element.attributes.num;
    if (element.supplier.trim().length == 0) {
      delete element.supplier;
    }
    let newDevice = await deviceService.create(element.type, { ...element });
    let createdDate =
      element.createdAt.trim().length == 0
        ? new Date()
        : new Date(element.createdAt.trim());
    newDevice.createdAt = createdDate;
    let childDevice = await model.findOne({ _id: newDevice._id });
    childDevice.createdAt = createdDate;
    await newDevice.save();
    await childDevice.save();
  }
  console.log(`${name} DONE!`);
}

async function processStaff() {
  await staff.deleteMany();
  const userFound = await user.findOne({});
  for (let index = 0; index < staffJSON.items.length; index++) {
    const element = staffJSON.items[index];
    console.log(index, element.name);
    if (element.code) {

      if (element.department.trim().length == 0) {
        delete element.department;
      }
      if (element.job.trim().length == 0) {
        delete element.job;
      }
      if (element.position.trim().length == 0) {
        delete element.position;
      }
      if (element.code.trim().length == 0) {
        // console.log('delete');
        delete element.code;
      }
      let newStaff = await StaffService.create(element, userFound._id);
      // gán thiết bị cho nhân viên

      // gán case
      for (let j = 0; j < element.case_id.length; j++) {
        const elementJ = element.case_id[j];
        if (elementJ.trim().length == 0) {
          continue;
        }
        let caseFound = await casePC.findOne({ num: +elementJ });
        let deviceFound = await device.findById(caseFound._id);
        deviceFound.staff = newStaff._id;
        deviceFound.status = DEVICE.IN_USE;
        const inventoryFound = await inventory.findOne({
          device: deviceFound._id,
        });
        inventoryFound.quantity--;
        await inventoryFound.save();
        await deviceFound.save();
      }
      // gán monitor
      for (let j = 0; j < element.monitor.length; j++) {
        const elementJ = element.monitor[j];
        if (elementJ.trim().length == 0) {
          continue;
        }
        let monitorFound = await monitor.findOne({ num: +elementJ });
        let deviceFound = await device.findById(monitorFound._id);
        deviceFound.staff = newStaff._id;
        deviceFound.status = DEVICE.IN_USE;
        const inventoryFound = await inventory.findOne({
          device: deviceFound._id,
        });
        inventoryFound.quantity--;
        await inventoryFound.save();
        await deviceFound.save();
      }
      // gán wacom
      if (element.wacom.trim().length != 0) {
        let wacomFound = await wacom.findOne({ num: +element.wacom });
        let deviceFound = await device.findById(wacomFound._id);
        deviceFound.staff = newStaff._id;
        deviceFound.status = DEVICE.IN_USE;
        const inventoryFound = await inventory.findOne({
          device: deviceFound._id,
        });
        inventoryFound.quantity--;
        await inventoryFound.save();
        await deviceFound.save();
      }
      if (element.headphone.trim().length != 0) {
        let headphoneFound = await headphone.findOne({ num: +element.headphone });
        let deviceFound = await device.findById(headphoneFound._id);
        deviceFound.staff = newStaff._id;
        deviceFound.status = DEVICE.IN_USE;
        const inventoryFound = await inventory.findOne({
          device: deviceFound._id,
        });
        inventoryFound.quantity--;
        await inventoryFound.save();
        await deviceFound.save();
      }
    }
  }
  console.log("import Staff DONE!");
}

// importDB();
async function importDB() {
  await createAdminUser();
  await processAllDevice();
  await processJDP();
  await processStaff();
  await dropHandover();
}

async function processAllDevice() {
  await device.deleteMany();
  await inventory.deleteMany();
  await processDevice(monitorJson, monitor, "monitor");
  await processDevice(caseJson, casePC, "case");
  await processDevice(headphoneJson, headphone, "headphone");
  await processDevice(wacomJson, wacom, "wacom");

  console.log("IMPORT device DONE!");
}
async function createAdminUser() {
  await user.deleteMany();
  const newAdmin = await user.create({
    _id: '675470c4e5e4e5b0b81c73ed',
    name: "Đặng Tuấn Anh",
    phoneNumber: "0375871003",
    password: await bcrypt.hash("123456", 10),
    role: 0,
    status: 1,
  });
}
async function importJDP(json, model) {
  await model.deleteMany();
  for (let index = 0; index < json.items.length; index++) {
    const element = json.items[index];
    let newJDP = await model.create({ ...element });
  }
}
async function processJDP() {
  importJDP(jobJson, job);
  importJDP(departmentsJson, department);
  importJDP(positionsJson, position);
  console.log("IMPORT JDP DONE!");
}

function isAllNumber(arr) {
  return arr.every((item) => !isNaN(item) && item.trim().length != 0);
}
async function dropHandover() {
  await handover.deleteMany();
  await history.deleteMany();
  await processMK(keyboard, "keyboard");
  await processMK(mouse, "mouse");
  console.log("Drop Handover DONE!");
}

// console.log(isAllNumber(['1', '2', '3', '']));

async function processMK(model, name) {
  await model.deleteMany();
  // const userAdmin = await user.findOne({ phoneNumber: "0983152695" }).lean()
  // let newDevice = await deviceService.create(name, {
  //     total: 1,
  //     note: "Thêm mới",
  //     user: userAdmin._id
  // })

  console.log(`${name} DONE!`);
}

module.exports = { importDB };
