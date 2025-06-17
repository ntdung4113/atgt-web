const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class BrowserManager {
    static async init() {
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
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Edge/137.0.56 Safari/537.36');
        await page.setViewport({ width: 1280, height: 1000 });
        await page.setExtraHTTPHeaders({ 'Accept': 'text/html,application/xhtml+xml' });

        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        return { browser, page };
    }

    static async loadCookies(page, cookiesData) {
        try {
            let cookiesToSet = [];
            if (cookiesData.cookies && Array.isArray(cookiesData.cookies)) {
                cookiesToSet = cookiesData.cookies;
            } else if (Array.isArray(cookiesData)) {
                cookiesToSet = cookiesData;
            } else {
                throw new Error('Định dạng cookies không hợp lệ');
            }
            
            await page.setCookie(...cookiesToSet);
            return true;
        } catch (error) {
            console.error('Lỗi khi nạp cookies:', error.message);
            return false;
        }
    }

    static async checkLogin(page) {
        await page.goto('https://www.facebook.com/', { waitUntil: 'networkidle2' });
        const isLoggedIn = await page.evaluate(() => {
            return !document.querySelector('form[action*="login"]');
        });
        return isLoggedIn;
    }
}

module.exports = BrowserManager;