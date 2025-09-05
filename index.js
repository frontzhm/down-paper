const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function run() {
  // 启动浏览器
  const browser = await puppeteer.launch({
    headless: false, // 先使用非无头模式进行调试
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  // 设置窗口大小
  await page.setViewport({ width: 2500, height: 1200 });

  // 设置cookie
  const cookies = [
    { name: 'gr_user_id', value: 'f5bbcce9-7b86-48d5-b270-67c04aaa6621', domain: '.xdf.cn' },
    { name: 'XDFUUID', value: 'db0b0bd2-6407-b293-514e-fc4984c6c284', domain: '.xdf.cn' },
    { name: 'email', value: 'zhanghuimin61%40xdf.cn', domain: '.xdf.cn' },
    { name: 'nickname', value: '%E5%BC%A0%E6%85%A7%E6%95%8F', domain: '.xdf.cn' },
    { name: 'staffToken', value: 'emhhbmdodWltaW42MWVmMjEwYjJlLTM0Y2YtNDcxZS1hZDU3LTIzZTYyOWUyNzJjMw==', domain: '.xdf.cn' },
    { name: 'jsessionid', value: '227c68cc-95fe-42c3-a0cb-92dda0fcb18e', domain: '.xdf.cn' },
    { name: 'rem', value: 'on', domain: '.xdf.cn' },
    { name: 'e2e', value: 'DCB2A892933AF3582BA5A72F10828894', domain: '.xdf.cn' },
    { name: 'e2mf', value: '068a62e2555c4d62b08d3603302acfe8', domain: '.xdf.cn' },
    { name: 'ac5caea5d6c36013_gr_session_id', value: 'edcf5031-19c4-4a1f-8b20-48e16f578f36', domain: '.xdf.cn' },
    { name: 'ac5caea5d6c36013_gr_session_id_sent_vst', value: 'edcf5031-19c4-4a1f-8b20-48e16f578f36', domain: '.xdf.cn' },
    { name: 'wpsUserInfo', value: '{%22useId%22:%22408aea3f921d4edf9e14dcacf3537bf6%22%2C%22nickName%22:%22%E5%88%98%E4%B8%B9%E5%A6%AE%22%2C%22name%22:%22%E5%88%98%E4%B8%B9%E5%A6%AE%22%2C%22email%22:%22liudanni7@xdf.cn%22}', domain: '.xdf.cn' }
  ];
  
  await page.setCookie(...cookies);

  // 打开一个网页
  await page.goto('https://iteach-cloudwps.xdf.cn/paperEditor?paperId=77d3642015c549e8b393e83008285f0a&questionBankHubPaperId=CL2ffcf14ad3984eab801a695dfc80dde7&updateTime=2025-09-05%2B14%3A17%3A11&subjectName=%E8%84%91%E5%8A%9B%E4%B8%8E%E6%80%9D%E7%BB%B4&subjectId=1574&name=FY26%E7%A7%8B-%E8%8B%8F%E6%95%99%E7%89%88-4%E5%B9%B4%E7%BA%A7-%E7%AC%AC5%E8%AE%B2-%E8%AF%BE%E5%90%8E%E7%9B%B8%E4%BC%BC%E9%A2%98&schoolName=%E9%9B%86%E5%9B%A2&ownerType=3&useScene=khlx&showMode=edit');

  // 等待页面加载完成
  await page.waitForTimeout(120000); // 2分钟

  // 尝试多种可能的选择器
  
  const downloadSelector = '#app .source_main_box .title .title-right .top-name-div .print-btn'
  
  // 等待按钮存在后再点击
  console.log('正在等待按钮出现...');
  try {
    await page.waitForSelector(downloadSelector, { timeout: 3000000 });
    console.log('✅ 按钮已找到！');
    await page.click(downloadSelector);
    console.log('✅ 按钮已点击！');
  } catch (error) {
    console.log('❌ 按钮未找到:', error.message);
  }

  // 等待下载按钮出现
  console.log('正在等待下载按钮出现...');
  const printSelector = '.down-info .down-info-btn .print-btn'
  try {
    await page.waitForSelector(printSelector, { timeout: 30000000 });
    console.log('✅ 下载按钮已找到！');
    
    // 打印下载按钮信息
    const downloadButton = await page.$(printSelector);
    const buttonText = await page.evaluate(el => el.textContent, downloadButton);
    console.log('下载按钮文本:', buttonText);
    
    await page.click(printSelector);
    console.log('✅ 下载按钮已点击！');
  } catch (error) {
    console.log('❌ 下载按钮未找到:', error.message);
  }

  // 关闭浏览器
  await browser.close();
}

run();
