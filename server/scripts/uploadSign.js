const fs = require('fs');
const path = require('path');
const cloudinary = require('../config/cloudinaryConfig');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const folderPath = path.join(__dirname, '../data/assets/images');
const outputCsvPath = path.join(__dirname, 'output2.csv');

const csvWriter = createCsvWriter({
  path: outputCsvPath,
  header: [
    { id: 'filename', title: 'Filename' },
    { id: 'url', title: 'URL' }
  ]
});

(async () => {
  try {
    const files = fs.readdirSync(folderPath);
    const uploadResults = [];

    for (const file of files) {
      const filePath = path.join(folderPath, file);

      if (!fs.statSync(filePath).isFile() || !/\.(jpg|jpeg|png|gif)$/i.test(file)) {
        console.log(`⚠️ Bỏ qua: ${file}`);
        continue;
      }

      try {
        const result = await cloudinary.uploader.upload(filePath, {
          folder: 'questions_upload',
          use_filename: true,
          unique_filename: false
        });

        console.log(`✅ Uploaded ${file} → ${result.secure_url}`);
        uploadResults.push({ filename: file, url: result.secure_url });

      } catch (err) {
        console.error(`❌ Upload lỗi với ${file}:`, err.message);
      }
    }

    // Ghi file CSV
    await csvWriter.writeRecords(uploadResults);
    console.log(`📄 Đã lưu CSV: ${outputCsvPath}`);

  } catch (err) {
    console.error('❌ Lỗi tổng quát:', err);
  }
})();
