const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Post = require('../models/Post');
const dotenv = require('dotenv');
dotenv.config();

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
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
      thumbnail_url: media?.thumbnailImage?.uri || null,
      video_url: videoUrl,
      status: 'pending' // Thêm status mặc định
    };
  } catch (e) {
    console.error(`Lỗi khi xử lý node: ${e.message}`);
    return null;
  }
}

// Hàm lưu batch vào MongoDB
async function saveBatchToMongoDB(posts) {
  try {
    const savedPosts = [];
    for (const post of posts) {
      // Kiểm tra xem post đã tồn tại chưa
      const existingPost = await Post.findOne({ post_id: post.post_id });
      if (!existingPost) {
        const newPost = new Post(post);
        await newPost.save();
        savedPosts.push(newPost);
      }
    }
    console.log(`✅ Đã lưu ${savedPosts.length} bài viết mới vào MongoDB`);
    return savedPosts;
  } catch (err) {
    console.error(`❌ Lỗi khi lưu batch vào MongoDB: ${err.message}`);
    return [];
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

  // Đặt user agent và viewport để sử dụng giao diện desktop
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Edge/137.0.56 Safari/537.36');
  await page.setViewport({ width: 1280, height: 1000 });
  await page.setExtraHTTPHeaders({ 'Accept': 'text/html,application/xhtml+xml' });

  // Chặn tài nguyên không cần thiết
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
      req.abort();
    } else {
      req.continue();
    }
  });

  // Thu thập và xử lý response XHR
  let responseCounter = 0;
  const startTime = Date.now();
  const MAX_DURATION = 300000; // 5 phút
  const BATCH_SIZE = 10; // Lưu sau mỗi 10 bài viết
  let allPosts = []; // Lưu trữ tạm thời các bài viết

  page.on('response', async (response) => {
    if (Date.now() - startTime > MAX_DURATION) return;

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
              // Kiểm tra xem response có cấu trúc mong muốn
              if (jsonObj?.data?.node?.__typename === 'Group' && jsonObj?.data?.node?.group_feed?.edges) {
                const edges = jsonObj.data.node.group_feed.edges;
                // Trích xuất và lọc bài viết có video
                const filteredPosts = edges
                  .map(item => extractPostData(item.node))
                  .filter(post => post !== null);

                if (filteredPosts.length > 0) {
                  allPosts.push(...filteredPosts);
                  console.log(`✅ Đã tìm thấy ${filteredPosts.length} bài viết có video`);
                  // Lưu batch nếu đủ số lượng
                  if (allPosts.length >= BATCH_SIZE) {
                    await saveBatchToMongoDB(allPosts);
                    allPosts = []; // Reset sau khi lưu
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
  await page.goto('https://www.facebook.com/groups/otofun2021/?sorting_setting=CHRONOLOGICAL', {
    waitUntil: 'networkidle2',
  });

  // Kiểm tra đăng nhập
  const isLoggedIn = await page.evaluate(() => {
    return !document.querySelector('form[action*="login"]');
  });
  if (!isLoggedIn) {
    console.error('❌ Đăng nhập thất bại. Vui lòng xóa file cookies và thử lại.');
    await browser.close();
    return;
  }

  // Cuộn trang để kích hoạt XHR
  const MAX_SCROLLS = 30;
  let noNewContentCount = 0;
  const MAX_NO_NEW_CONTENT = 3; // Thoát nếu không có nội dung mới sau 3 lần
  let previousHeight;
  for (let i = 0; i < MAX_SCROLLS; i++) {
    previousHeight = await page.evaluate('document.body.scrollHeight');
    await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
    try {
      await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`, { timeout: 10000 });
      noNewContentCount = 0; // Reset nếu có nội dung mới
    } catch {
      console.log('📉 Không tải thêm nội dung, tiếp tục cuộn sâu hơn.');
      noNewContentCount++;
      if (noNewContentCount >= MAX_NO_NEW_CONTENT) {
        console.log('🛑 Không còn nội dung mới, thoát cuộn.');
        break;
      }
    }
    await delay(3000); // Giảm từ 10s xuống 3s
  }

  // Lưu các bài viết còn lại trong allPosts
  if (allPosts.length > 0) {
    await saveBatchToMongoDB(allPosts);
  }

  // Đợi thêm để đảm bảo thu thập hết response
  await delay(5000);

  console.log(`✅ Đã xử lý tổng cộng ${responseCounter} response GraphQL`);

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