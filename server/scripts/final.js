const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const Situation = require('../models/Situation');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Kiểm tra biến môi trường
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI is not defined in the .env file');
  process.exit(1);
}
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('❌ Cloudinary environment variables are missing');
  process.exit(1);
}

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('✅ Đã kết nối MongoDB');
}).catch(err => {
  console.error('❌ Lỗi kết nối MongoDB:', err);
  process.exit(1);
});

// Hàm tạo độ trễ
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Hàm trích xuất thông tin từ một node
function extractPostData(node) {
  try {
    if (!node || node.__typename !== 'Story') return null;

    const fbShortsStory = node?.attachments?.[0]?.styles?.attachment?.style_infos?.[0]?.fb_shorts_story;
    const media = fbShortsStory?.attachments?.[0]?.media;

    const videoUrl = media?.videoDeliveryResponseFragment?.videoDeliveryResponseResult?.progressive_urls?.[0]?.progressive_url || null;

    // Chỉ trả về bài viết nếu có video URL
    if (!videoUrl) return null;

    return {
      post_id: node.post_id || null,
      content: fbShortsStory?.message?.text || null,
      author: {
        name: node.actors?.[0]?.name || null,
        link: node.actors?.[0]?.url || null
      },
      video_url: videoUrl,
      status: 'not-uploaded'
    };
  } catch (e) {
    console.error(`Lỗi khi xử lý node: ${e.message}`);
    return null;
  }
}

// Hàm upload video lên Cloudinary
async function uploadToCloudinary(videoUrl, postId) {
  try {
    // Upload video
    const videoResult = await cloudinary.uploader.upload(videoUrl, {
      resource_type: 'video',
      folder: 'videos_upload',
      public_id: `video_${postId}`,
      overwrite: false
    });

    // Tạo thumbnail URL từ public_id của video
    const thumbnailUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload/videos_upload/video_${postId}.jpg`;

    return {
      video_url: videoResult.secure_url,
      thumbnail_url: thumbnailUrl
    };
  } catch (err) {
    console.error(`❌ Lỗi khi upload lên Cloudinary: ${err.message}`);
    return null;
  }
}

// Hàm lưu bài viết vào MongoDB
async function saveToMongoDB(post) {
  try {
    const newSituation = new Situation({
      situation_id: post.post_id,
      content: post.content,
      author: post.author,
      video_url: post.video_url,
      thumbnail_url: post.thumbnail_url,
      status: 'pending',
      tags: [] // Khởi tạo mảng tags rỗng
    });
    await newSituation.save();
    console.log(`✅ Đã lưu tình huống ${post.post_id} vào MongoDB`);
    return newSituation;
  } catch (err) {
    console.error(`❌ Lỗi khi lưu tình huống ${post.post_id} vào MongoDB: ${err.message}`);
    return null;
  }
}

(async () => {
  // Khởi động trình duyệt ở chế độ headless
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu'
    ]
  });
  const page = await browser.newPage();

  // Đặt user agent và viewport
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Edge/137.0.56 Safari/537.36');
  await page.setViewport({ width: 1280, height: 1000 });
  await page.setExtraHTTPHeaders({ 'Accept': 'text/html,application/xhtml+xml' });

  // Chặn tài nguyên không cần thiết (cho phép media để tải video)
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
      req.abort();
    } else {
      req.continue();
    }
  });

  // Thu thập và xử lý response XHR
  let responseCounter = 0;
  let collectedVideos = 0; // Đếm số video đã thu thập
  const MAX_VIDEOS = 5; // Giới hạn 5 video
  const SCROLL_TIMEOUT = 15 * 60 * 1000; // 15 phút timeout

  page.on('response', async (response) => {
    if (collectedVideos >= MAX_VIDEOS) return;

    const url = response.url();
    if (url.includes('/api/graphql/') && response.request().method() === 'POST') {
      const postData = response.request().postData() || '';
      const docIdMatch = postData.match(/doc_id=(\d+)/) || url.match(/doc_id=(\d+)/);
      const docId = docIdMatch ? docIdMatch[1] : 'unknown';

      responseCounter++;
      const responseId = `${responseCounter}_${docId}`;
      console.log(`📦 Bắt response GraphQL #${responseId}: ${url}`);

      try {
        const text = await response.text();
        let buffer = '';
        let braceCount = 0;
        for (const char of text) {
          buffer += char;
          if (char === '{') braceCount++;
          else if (char === '}') braceCount--;
          if (braceCount === 0 && buffer.trim()) {
            try {
              const jsonObj = JSON.parse(buffer.trim());
              if (jsonObj?.data?.node?.__typename === 'Group' && jsonObj?.data?.node?.group_feed?.edges) {
                const edges = jsonObj.data.node.group_feed.edges;
                const filteredPosts = edges
                  .map(item => extractPostData(item.node))
                  .filter(post => post !== null);

                for (const post of filteredPosts) {
                  if (collectedVideos >= MAX_VIDEOS) break;

                  // Kiểm tra xem bài viết đã tồn tại trong MongoDB
                  const existingPost = await Situation.findOne({ situation_id: post.post_id });
                  if (!existingPost) {
                    // Upload lên Cloudinary
                    const uploadResult = await uploadToCloudinary(post.video_url, post.post_id);
                    if (uploadResult) {
                      // Lưu URL từ Cloudinary vào MongoDB
                      const postToSave = {
                        post_id: post.post_id,
                        content: post.content,
                        author: post.author,
                        video_url: uploadResult.video_url,
                        thumbnail_url: uploadResult.thumbnail_url,
                        status: 'pending'
                      };
                      await saveToMongoDB(postToSave);
                      collectedVideos++;
                      console.log(`✅ Đã thu thập video ${collectedVideos}/${MAX_VIDEOS}`);
                    }
                  } else {
                    console.log(`⏭ Tình huống ${post.post_id} đã tồn tại trong MongoDB, bỏ qua.`);
                  }
                }
              }
              buffer = '';
            } catch (err) {
              buffer = '';
            }
          }
        }

        if (braceCount !== 0) {
          console.log(`⚠️ Response #${responseId} không chứa JSON hợp lệ`);
        }
      } catch (err) {
        console.error(`❌ Lỗi xử lý response: ${url}, Error: ${err.message}`);
      }
    }
  });

  // Truy cập Facebook
  await page.goto('https://www.facebook.com/', { waitUntil: 'networkidle2' });
  console.log('Navigated to Facebook homepage');

  // Nạp cookies
  const cookiesFilePath = path.join(__dirname, '../data/www.facebook.com_06-06-2025.json');
  if (fs.existsSync(cookiesFilePath)) {
    try {
      const cookiesString = fs.readFileSync(cookiesFilePath);
      const cookiesData = JSON.parse(cookiesString);
      let cookiesToSet = [];
      if (cookiesData.cookies && Array.isArray(cookiesData.cookies)) {
        cookiesToSet = cookiesData.cookies;
        console.log('Đã phát hiện cookies định dạng {url:, cookies:[]}');
      } else if (Array.isArray(cookiesData)) {
        cookiesToSet = cookiesData;
        console.log('Đã phát hiện cookies định dạng Puppeteer');
      } else {
        throw new Error('Định dạng cookies không được hỗ trợ');
      }
      await page.setCookie(...cookiesToSet);
      console.log('🍪 Đã nạp cookies từ file');
    } catch (error) {
      console.error('⚠️ Lỗi khi nạp cookies:', error.message);
      console.log('Tiếp tục với đăng nhập thủ công...');
      await handleManualLogin(page, cookiesFilePath);
    }
  } else {
    console.error(`❌ Không tìm thấy file cookies tại: ${cookiesFilePath}`);
    await handleManualLogin(page, cookiesFilePath);
  }

  // Truy cập nhóm
  await page.goto('https://www.facebook.com/groups/otofun2021', { waitUntil: 'networkidle2' });

  // Kiểm tra đăng nhập
  const isLoggedIn = await page.evaluate(() => {
    return !document.querySelector('form[action*="login"]');
  });
  if (!isLoggedIn) {
    console.error('❌ Đăng nhập thất bại. Vui lòng xóa file cookies và thử lại.');
    await browser.close();
    return;
  }

  // Cuộn trang nhanh để kích hoạt XHR
  const scrollStartTime = Date.now();
  let scrollCount = 0;
  while (collectedVideos < MAX_VIDEOS && Date.now() - scrollStartTime < SCROLL_TIMEOUT) {
    // Cuộn nhiều lần trong mỗi vòng lặp để kích hoạt XHR nhanh hơn
    await page.evaluate(() => {
      for (let j = 0; j < 5; j++) {
        window.scrollBy(0, 1000); // Cuộn 1000px mỗi lần
      }
    });
    scrollCount++;
    console.log(`📜 Đã cuộn lần ${scrollCount}`);
    await delay(1000); // Delay 1000ms để cân bằng tốc độ và độ tin cậy
  }

  // Đợi thêm để đảm bảo thu thập hết response
  await delay(5000);

  console.log(`✅ Đã xử lý tổng cộng ${responseCounter} response GraphQL`);
  console.log(`✅ Đã thu thập ${collectedVideos} video`);

  // Đóng kết nối MongoDB và trình duyệt
  await mongoose.connection.close();
  await browser.close();
})();

async function handleManualLogin(page, cookiesFilePath) {
  console.log('🔐 Vui lòng đăng nhập thủ công...');
  try {
    await page.waitForSelector('div[role="navigation"]', { timeout: 120000 });
    const currentCookies = await page.cookies();
    const cookiesObject = {
      url: 'https://www.facebook.com',
      cookies: currentCookies
    };
    fs.writeFileSync(cookiesFilePath, JSON.stringify(cookiesObject, null, 2));
    console.log('✅ Đã lưu cookies');
  } catch (error) {
    console.error('❌ Lỗi đăng nhập thủ công:', error.message);
  }
}