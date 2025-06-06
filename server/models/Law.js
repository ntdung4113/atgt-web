const mongoose = require("mongoose");

const lawSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        lawNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        issuedDate: {
            type: Date,
            required: true,
        },
        contentText: {
            type: String,
            required: true,
        },
        rawHtml: {
            type: String,
        },
        metadata: {
            country: { type: String, default: "Việt Nam" },
            issuer: { type: String, required: true },
            keywords: [{ type: String }],
            type: { type: String, required: true },
            signer: { type: String, required: true }
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true, // Tự động cập nhật createdAt và updatedAt
    }
);

// Tạo text index để hỗ trợ tìm kiếm full-text
lawSchema.index({
    title: 'text',
    contentText: 'text',
    'metadata.keywords': 'text',
    lawNumber: 1, // Index riêng cho lawNumber
    'metadata.issuer': 1, // Index cho issuer
    issuedDate: -1, // Index cho sắp xếp issuedDate
});

module.exports = mongoose.model("Law", lawSchema);