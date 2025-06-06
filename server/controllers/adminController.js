const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { processAndSaveLaw } = require('../scripts/uploadLaw');

exports.importLawFile = async (req, res) => {
    try {
        const filePath = req.file.path;
        const law = await processAndSaveLaw(filePath);
        fs.unlinkSync(filePath); // Xóa file sau khi xử lý
        res.json({ success: true, law });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.importLawFromUrl = async (req, res) => {
    try {
        let { url } = req.body;
        if (!url) return res.status(400).json({ error: 'Missing url' });
        // Thay domain tvpl.vn thành m.tvpl.vn và thuvienphapluat.vn thành m.thuvienphapluat.vn
        url = url.replace(/^https?:\/\/(www\.)?tvpl\.vn/, 'https://m.tvpl.vn');
        url = url.replace(/^https?:\/\/(www\.)?thuvienphapluat\.vn/, 'https://m.thuvienphapluat.vn');
        // Tải HTML từ URL
        const response = await axios.get(url);
        const htmlContent = response.data;
        // Lưu ra file tạm
        const tempPath = path.join(__dirname, '../data/uploads', `law_${Date.now()}.html`);
        fs.writeFileSync(tempPath, htmlContent, 'utf-8');
        // Import như file upload
        const law = await processAndSaveLaw(tempPath);
        fs.unlinkSync(tempPath);
        res.json({ success: true, law });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}; 