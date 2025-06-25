const BrowserManager = require('./browser');
const UploadManager = require('./uploader');
const Situation = require('../../../models/Situation');
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class FacebookCrawler {
    static extractPostData(node) {
        try {
            if (!node || node.__typename !== 'Story') return null;

            const fbShortsStory = node?.attachments?.[0]?.styles?.attachment?.style_infos?.[0]?.fb_shorts_story;
            let media = fbShortsStory?.attachments?.[0]?.media;
            let videoUrl = media?.videoDeliveryResponseFragment?.videoDeliveryResponseResult?.progressive_urls?.[0]?.progressive_url || null;
            let content = fbShortsStory?.message?.text || null;

            if (!videoUrl && node.attachments?.[0]?.styles?.attachment?.media) {
                media = node.attachments[0].styles.attachment.media;
                videoUrl = media?.videoDeliveryResponseFragment?.videoDeliveryResponseResult?.progressive_urls?.[0]?.progressive_url || null;

                const storyMessage = node?.comet_sections?.content?.story?.message;
                if (storyMessage?.__typename === 'TextWithEntities') {
                    content = storyMessage.text || null;
                } else {
                    content = node?.message?.text || null;
                }
            }

            if (!videoUrl) return null;

            return {
                post_id: node.post_id || null,
                content: content,
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

    static async saveToMongoDB(post) {
        try {
            const newSituation = new Situation({
                situation_id: post.post_id,
                content: post.content,
                author: post.author,
                video_url: post.video_url,
                thumbnail_url: post.thumbnail_url,
                status: 'pending',
                tags: []
            });
            await newSituation.save();
            console.log(`Đã lưu tình huống ${post.post_id} vào MongoDB`);
            return newSituation;
        } catch (err) {
            console.error(`Lỗi khi lưu tình huống ${post.post_id} vào MongoDB: ${err.message}`);
            return null;
        }
    }

    static async crawl(groupUrl, cookiesData, options = {}) {
        const {
            maxVideos = 5,
            scrollTimeout = 15 * 60 * 1000
        } = options;

        const { browser, page } = await BrowserManager.init();
        let collectedVideos = 0;
        let responseCounter = 0;
        let logs = []; 

        const addLog = (message, type = 'info') => {
            const log = {
                timestamp: new Date().toISOString(),
                type,
                message
            };
            logs.push(log);
            console.log(`[${type.toUpperCase()}] ${message}`);
        };

        try {
            addLog('Bắt đầu quá trình crawl');
            addLog(`URL nhóm: ${groupUrl}`);

            const cookiesLoaded = await BrowserManager.loadCookies(page, cookiesData);
            if (!cookiesLoaded) {
                addLog('Không thể nạp cookies', 'error');
                throw new Error('Không thể nạp cookies');
            }
            addLog('Đã nạp cookies thành công');

            const isLoggedIn = await BrowserManager.checkLogin(page);
            if (!isLoggedIn) {
                addLog('Đăng nhập thất bại', 'error');
                throw new Error('Đăng nhập thất bại');
            }
            addLog('Đăng nhập thành công');

            page.on('response', async (response) => {
                if (collectedVideos >= maxVideos) return;

                const url = response.url();
                if (url.includes('/api/graphql/') && response.request().method() === 'POST') {
                    const postData = response.request().postData() || '';
                    const docIdMatch = postData.match(/doc_id=(\d+)/) || url.match(/doc_id=(\d+)/);
                    const docId = docIdMatch ? docIdMatch[1] : 'unknown';

                    responseCounter++;
                    const responseId = `${responseCounter}_${docId}`;
                    addLog(`Bắt response GraphQL #${responseId}: ${url}`);

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
                                            .map(item => FacebookCrawler.extractPostData(item.node))
                                            .filter(post => post !== null);

                                        for (const post of filteredPosts) {
                                            if (collectedVideos >= maxVideos) break;

                                            const existingPost = await Situation.findOne({
                                                situation_id: post.post_id
                                            });

                                            if (!existingPost) {
                                                addLog(`Đang xử lý video ${post.post_id}`);

                                                const uploadResult = await UploadManager.uploadVideo(
                                                    post.video_url,
                                                    post.post_id
                                                );

                                                if (uploadResult) {
                                                    const postToSave = {
                                                        post_id: post.post_id,
                                                        content: post.content,
                                                        author: post.author,
                                                        video_url: uploadResult.video_url,
                                                        thumbnail_url: uploadResult.thumbnail_url,
                                                        status: 'pending'
                                                    };

                                                    await FacebookCrawler.saveToMongoDB(postToSave);
                                                    collectedVideos++;
                                                    addLog(`Đã thu thập video ${collectedVideos}/${maxVideos}`);
                                                } else {
                                                    addLog(`Lỗi upload video ${post.post_id}`, 'error');
                                                }
                                            } else {
                                                addLog(`Video ${post.post_id} đã tồn tại, bỏ qua`);
                                            }
                                        }
                                    }
                                    buffer = '';
                                } catch (err) {
                                    addLog(`Lỗi parse JSON trong response #${responseId}: ${err.message}`, 'error');
                                    buffer = '';
                                }
                            }
                        }

                        if (braceCount !== 0) {
                            addLog(`Response #${responseId} không chứa JSON hợp lệ`, 'warn');
                        }
                    } catch (err) {
                        addLog(`Lỗi xử lý response #${responseId}: ${err.message}`, 'error');
                    }
                }
            });

            addLog('Đang truy cập nhóm Facebook...');
            await page.goto(groupUrl, { waitUntil: 'networkidle2' });
            addLog('Đã truy cập nhóm thành công');

            const scrollStartTime = Date.now();
            let scrollCount = 0;
            while (collectedVideos < maxVideos && Date.now() - scrollStartTime < scrollTimeout) {
                await page.evaluate(() => {
                    for (let j = 0; j < 5; j++) {
                        window.scrollBy(0, 1000);
                    }
                });
                scrollCount++;
                addLog(`Đã cuộn lần ${scrollCount}`);
                await delay(1000);
            }

            await delay(5000);
            addLog('Hoàn thành quá trình crawl');

            return {
                totalCollected: collectedVideos,
                totalResponses: responseCounter,
                logs,
                status: 'completed'
            };

        } catch (error) {
            addLog(`Lỗi: ${error.message}`, 'error');
            throw {
                error: error.message,
                logs,
                status: 'failed'
            };
        } finally {
            await browser.close();
            addLog('Đã đóng trình duyệt');
        }
    }
}

module.exports = FacebookCrawler;