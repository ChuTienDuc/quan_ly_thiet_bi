#!/usr/bin/env node

/**
 * SEED DATABASE - Import dữ liệu vào MongoDB
 *
 * Cách dùng:
 *   node seed.js
 *
 * Kết quả:
 *   - Tạo database MinhVietHardware
 *   - Import tất cả collections
 *   - Tạo admin user (phone: 0375871003, password: 111)
 */

require('dotenv').config();
const mongoose = require('mongoose');

// ==========================================
// BƯỚC 1: Connect MongoDB
// ==========================================
async function connectDB() {
  try {
    const mongoUrl = process.env.MONGO_CONNECT || 'mongodb://127.0.0.1:27017/MinhVietHardware';
    console.log('\n🔄 Kết nối MongoDB...');
    console.log(`📍 URL: ${mongoUrl}`);

    await mongoose.connect(mongoUrl);
    console.log('✅ MongoDB kết nối thành công\n');
    return true;
  } catch (error) {
    console.error('❌ Lỗi kết nối MongoDB:');
    console.error(`   ${error.message}`);
    console.log('\n💡 Hướng dẫn khắc phục:');
    console.log('   1. Cài MongoDB: https://www.mongodb.com/try/download/community');
    console.log('   2. Bật MongoDB Service (Windows) hoặc mongod (Linux/Mac)');
    console.log('   3. Kiểm tra .env file có MONGO_CONNECT không\n');
    return false;
  }
}

// ==========================================
// BƯỚC 2: Import dữ liệu
// ==========================================
async function importData() {
  try {
    console.log('🔄 Import dữ liệu vào MongoDB...\n');

    const { importDB } = require('./dbs/importDB');
    await importDB();

    console.log('\n✅ Import dữ liệu thành công!\n');
    return true;
  } catch (error) {
    console.error('❌ Lỗi import dữ liệu:');
    console.error(`   ${error.message}`);
    console.log('\n💡 Kiểm tra:');
    console.log('   - File JSON có trong folder /private');
    console.log('   - Cấu trúc JSON đúng format');
    console.log('   - Database MinhVietHardware đã tạo\n');
    return false;
  }
}

// ==========================================
// BƯỚC 3: Kiểm tra kết quả
// ==========================================
async function verifyData() {
  try {
    console.log('📊 Kiểm tra dữ liệu...\n');

    const { user, staff, device } = require('./models/model');

    const userCount = await user.countDocuments();
    const staffCount = await staff.countDocuments();
    const deviceCount = await device.countDocuments();

    console.log('📈 Thống kê dữ liệu:');
    console.log(`   ✓ Users: ${userCount}`);
    console.log(`   ✓ Staff: ${staffCount}`);
    console.log(`   ✓ Device: ${deviceCount}\n`);

    // Lấy admin user
    const adminUser = await user.findOne({ role: 0 });
    if (adminUser) {
      console.log('👤 Admin user:');
      console.log(`   ✓ Name: ${adminUser.name}`);
      console.log(`   ✓ Phone: ${adminUser.phoneNumber}`);
      console.log(`   ✓ Role: ${adminUser.role} (Admin)\n`);
    }

    return true;
  } catch (error) {
    console.error('⚠️  Lỗi kiểm tra dữ liệu:');
    console.error(`   ${error.message}\n`);
    return true; // Tiếp tục dù có lỗi
  }
}

// ==========================================
// BƯỚC 4: Disconnect & Exit
// ==========================================
async function disconnect() {
  try {
    await mongoose.disconnect();
    console.log('✅ Ngắt kết nối MongoDB thành công\n');
  } catch (error) {
    console.error('⚠️  Lỗi ngắt kết nối:', error.message);
  }
}

// ==========================================
// MAIN FLOW
// ==========================================
async function main() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║     SEED DATABASE - MinhVietHardware System    ║');
  console.log('╚════════════════════════════════════════════════╝');

  // Kết nối DB
  const connected = await connectDB();
  if (!connected) {
    process.exit(1);
  }

  // Import dữ liệu
  const imported = await importData();
  if (!imported) {
    await disconnect();
    process.exit(1);
  }

  // Verify kết quả
  await verifyData();

  // Ngắt kết nối
  await disconnect();

  console.log('╔════════════════════════════════════════════════╗');
  console.log('║          ✅ HOÀN THÀNH IMPORT DỮ LIỆU        ║');
  console.log('╠════════════════════════════════════════════════╣');
  console.log('║ 📌 Bước tiếp theo: Chạy server                 ║');
  console.log('║    npm start                                   ║');
  console.log('║                                                ║');
  console.log('║ 🌐 Truy cập: http://localhost:20236            ║');
  console.log('║ 👤 Tài khoản: 0375871003 / 111                ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  process.exit(0);
}

// ==========================================
// ERROR HANDLING
// ==========================================
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n⚠️  Người dùng dừng quá trình');
  process.exit(0);
});

// Chạy main
main().catch(error => {
  console.error('❌ Lỗi chính:', error);
  process.exit(1);
});
