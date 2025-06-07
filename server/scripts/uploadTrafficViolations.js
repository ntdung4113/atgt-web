const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const TrafficViolation = require('../models/TrafficViolation');

const DATA_PATH = path.join(__dirname, '../data/traffic_violations.json');

async function uploadTrafficViolations() {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
        if (!Array.isArray(data)) {
            throw new Error('Dữ liệu không phải là mảng');
        }
        // Xóa hết dữ liệu cũ để tránh nhân bản nhiều lần
        await TrafficViolation.deleteMany({});
        await TrafficViolation.insertMany(data);
        console.log(`Đã upload ${data.length} vi phạm giao thông (chấp nhận trùng lặp).`);
    } catch (err) {
        console.error('Lỗi upload:', err);
    }
}

async function connectDB() {
    try {
        console.log('Kết nối MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Đã kết nối MongoDB');
    } catch (error) {
        console.error('Lỗi kết nối MongoDB:', error.message);
        process.exit(1);
    }
}

async function main() {
    await connectDB();
    await uploadTrafficViolations();
    await mongoose.disconnect();
    console.log('Đã ngắt kết nối MongoDB');
}

if (require.main === module) {
    main();
} 