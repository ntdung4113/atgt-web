const mongoose = require('mongoose');
const { htmlToText } = require('html-to-text');
const cheerio = require('cheerio');
const Law = require('../models/Law');
const fs = require('fs');
const path = require('path');
require('dotenv').config();


// Hàm làm sạch HTML để loại bỏ \n thừa
function cleanHtml(htmlContent) {
    const $ = cheerio.load(htmlContent);

    $('p, td, th, span').each((index, element) => {
        let text = $(element).text();
        text = text
            .replace(/\n+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        $(element).text(text);
    });

    return $.html();
}

// Hàm trích xuất metadata từ <div id="thuocTinh">
function extractMetadata(htmlContent) {
    const $ = cheerio.load(htmlContent);
    const metadata = {};
    const thuocTinhDiv = $('#thuocTinh');
    if (thuocTinhDiv.length) {
        // Tiêu đề
        metadata.title = thuocTinhDiv.find('p.title-properties').text().trim() || metadata.title;

        // Trích xuất từ bảng
        const tableRows = thuocTinhDiv.find('table.table-properties tbody tr');
        tableRows.each((index, row) => {
            const th = $(row).find('th').text().trim();
            const td = $(row).find('td').text().trim();

            switch (th) {
                case 'Loại văn bản:':
                    metadata.type = td || metadata.type;
                    break;
                case 'Số hiệu:':
                    metadata.lawNumber = td || metadata.lawNumber;
                    break;
                case 'Nơi ban hành:':
                    metadata.issuer = td || metadata.issuer;
                    break;
                case 'Người ký:':
                    metadata.signer = td || metadata.signer;
                    break;
                case 'Ngày ban hành:':
                    if (td.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                        const [day, month, year] = td.split('/');
                        metadata.issuedDate = `${year}-${month}-${day}`;
                    }
                    break;
            }
        });
    }

    // Bổ sung từ <meta> nếu thiếu
    metadata.title = metadata.title || $('meta[property="og:title"]').attr('content')?.replace('THƯ VIỆN PHÁP LUẬT - ', '').trim() || $('title').text().trim();
    metadata.keywords = metadata.keywords || $('meta[name="keywords"]').attr('content')?.split(',').map(k => k.trim()) || [];
    metadata.category = metadata.category || metadata.keywords.find(k => k.includes('Giao thông')) || 'Không xác định';
    metadata.country = metadata.country || 'Việt Nam';

    // Chuẩn hóa metadata
    return {
        title: metadata.title?.trim() || 'Không xác định',
        lawNumber: metadata.lawNumber?.trim() || null,
        issuedDate: metadata.issuedDate || null,
        issuer: metadata.issuer?.trim() || 'Không xác định',
        signer: metadata.signer?.trim() || null,
        status: metadata.status?.trim() || null,
        category: metadata.category?.trim() || 'Không xác định',
        keywords: metadata.keywords || [],
        country: metadata.country,
        type: metadata.type
    };
}

// Hàm trích xuất contentText từ <div id="ContentVN">
function extractContentText(htmlContent) {
    const $ = cheerio.load(htmlContent);
    const contentDiv = $('#ContentVN');

    if (!contentDiv.length) {
        return '';
    }

    // Làm sạch HTML trong div
    const cleanedHtml = cleanHtml(contentDiv.html());

    // Trích xuất văn bản
    return htmlToText(cleanedHtml, {
        wordwrap: false,
        ignoreHref: true,
        ignoreImage: true,
        preserveNewlines: true,
        uppercaseHeadings: false,
        formatters: {
            table: (elem, walk, builder) => {
                const rows = elem.children.filter((child) => child.name === 'tr');
                rows.forEach((row) => {
                    const cells = row.children.filter(
                        (cell) => cell.name === 'td' || cell.name === 'th'
                    );
                    const rowText = cells
                        .map((cell) => walk(cell.children, builder).trim())
                        .join(' | ');
                    builder.addInline(rowText + '\n');
                });
            },
        },
        selectors: [
            { selector: 'table', format: 'table' },
            { selector: 'p', options: { leadingLineBreaks: 1, trailingLineBreaks: 1 } },
            { selector: 'a', options: { ignoreHref: true } },
            { selector: 'b', format: 'inline' },
            { selector: 'span', format: 'inline' },
        ],
    });
}

// Hàm chuẩn hóa xuống dòng
function normalizeNewlines(text) {
    let result = text.replace(/^[ \t]+$/gm, '');
    result = result.replace(/\n{2,}/g, '\n\n');
    result = result.trim();
    return result;
}

// Hàm chuyển đổi src ảnh thành tuyệt đối cho thuvienphapluat.vn
function absolutizeImgSrc(htmlContent) {
    const $ = cheerio.load(htmlContent);
    $('img').each((i, el) => {
        let src = $(el).attr('src');
        if (src) {
            if (src.startsWith('/uploads/doc2htm/')) {
                $(el).attr('src', 'https://files.thuvienphapluat.vn' + src);
            } else if (src.startsWith('uploads/doc2htm/')) {
                $(el).attr('src', 'https://files.thuvienphapluat.vn/' + src);
            } else if (
                !src.startsWith('http://') &&
                !src.startsWith('https://') &&
                !src.startsWith('//')
            ) {
                // Trường hợp src là đường dẫn tương đối (ví dụ: 00636740_files/image001.jpg)
                $(el).attr('src', 'https://files.thuvienphapluat.vn/uploads/doc2htm/' + src);
            }
        }
    });
    return $.html();
}

// Hàm xử lý và lưu tài liệu
async function processAndSaveLaw(filePath) {
    try {
        // Đọc nội dung HTML từ file upload
        const htmlContent = fs.readFileSync(filePath, 'utf-8');
        const $ = cheerio.load(htmlContent);

        // Trích xuất metadata
        console.log(`Extracting metadata...`);
        const metadata = extractMetadata(htmlContent);
        console.log(`Metadata extracted:`, metadata);

        // Trích xuất contentText và chuẩn hóa
        console.log(`Extracting contentText...`);
        const rawContentText = extractContentText(htmlContent);
        const contentText = normalizeNewlines(rawContentText);
        console.log(`ContentText extracted and normalized`);

        // Trích xuất HTML thô từ <div id="ContentVN">
        const contentDiv = $('#ContentVN');
        let contentHtml = contentDiv.length ? contentDiv.html() : '';
        if (contentHtml) {
            // Chuyển src ảnh thành tuyệt đối cho thuvienphapluat.vn
            contentHtml = absolutizeImgSrc(contentHtml);
        }
        const rawHtml = contentHtml;
        console.log(`Raw HTML extracted from ContentVN: ${rawHtml.length > 0 ? `${rawHtml.length} characters` : 'None'}`);

        // Lưu vào MongoDB với upsert
        console.log(`Saving law to MongoDB...`);
        const filter = { lawNumber: metadata.lawNumber };
        const update = {
            title: metadata.title,
            lawNumber: metadata.lawNumber,
            issuedDate: metadata.issuedDate ? new Date(metadata.issuedDate) : null,
            effectiveDate: metadata.effectiveDate ? new Date(metadata.effectiveDate) : null,
            contentText,
            rawHtml,
            metadata: {
                country: metadata.country,
                issuer: metadata.issuer,
                signer: metadata.signer,
                status: metadata.status,
                category: metadata.category,
                keywords: metadata.keywords,
                type: metadata.type
            },
        };
        const options = { upsert: true, new: true, setDefaultsOnInsert: true };

        const law = await Law.findOneAndUpdate(filter, update, options);
        console.log('Law upserted successfully:', law._id);

        return law;
    } catch (error) {
        console.error('Error processing law:', error.message);
        throw error;
    }
}

// Kết nối MongoDB
async function connectDB() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
}

// Ví dụ sử dụng
// async function main() {
//     await connectDB();
//
//     const filePath = './data/36.html';
//
//     try {
//         console.log('Starting law processing...');
//         const savedLaw = await processAndSaveLaw(filePath);
//         console.log('Saved law:', savedLaw);
//     } catch (error) {
//         console.error('Failed to process law:', error);
//     } finally {
//         console.log('Disconnecting from MongoDB...');
//         await mongoose.disconnect();
//         console.log('Disconnected from MongoDB');
//     }
// }

// main();

module.exports = {
    processAndSaveLaw,
    // ... các hàm khác nếu cần
};