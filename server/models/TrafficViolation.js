const mongoose = require("mongoose");

const trafficViolationSchema = new mongoose.Schema(
    {
        vehicle_type: {
            type: String,
            required: true,
            trim: true,
        },
        topic: {
            type: String,
            required: true,
            trim: true,
        },
        violation_name: {
            type: String,
            required: true,
            trim: true,
            index: true, // hỗ trợ tìm kiếm
        },
        fine: {
            type: String,
        },
        additional_penalty: {
            type: String,
        },
        other_penalty: {
            type: String,
        },
        remedial_measures: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Tạo text index cho violation_name để hỗ trợ tìm kiếm
trafficViolationSchema.index({ violation_name: 'text' });

module.exports = mongoose.model("TrafficViolation", trafficViolationSchema); 