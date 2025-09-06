const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
// sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
  // 启动浏览器
  const browser = await puppeteer.launch({
    headless: false, // 先使用非无头模式进行调试
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=2800,1200',
      '--start-maximized'
    ]
  });
  const page = await browser.newPage();

  // 设置窗口大小
  await page.setViewport({ width: 1500, height: 1200 });

  // 检查实际窗口大小
  const viewport = await page.viewport();
  console.log('设置的视口大小:', viewport);

  // 获取实际窗口大小
  const windowSize = await page.evaluate(() => {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height
    };
  });
  console.log('实际窗口大小:', windowSize);

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
  await new Promise(resolve => setTimeout(resolve, 30 * 1000)); // 30秒

  // 检查iframe是否加载完成
  console.log('正在检查iframe加载状态...');
  try {
    // 等待iframe出现
    await page.waitForSelector('iframe', { timeout: 10000 });
    console.log('✅ iframe已找到');

    // 获取iframe元素
    const iframe = await page.$('iframe');
    const frame = await iframe.contentFrame();

    if (frame) {
      console.log('✅ iframe内容框架已获取');

      // 等待iframe内容加载完成
      try {
        await frame.waitForSelector('body', { timeout: 30000 });
        console.log('✅ iframe内容加载完成');

        // 等待iframe内的网络请求完成
        await frame.waitForFunction(() => {
          return document.readyState === 'complete';
        }, { timeout: 30000 });
        console.log('✅ iframe文档状态完成');

      } catch (frameError) {
        console.log('❌ iframe内容加载超时:', frameError.message);
      }

    } else {
      console.log('❌ 无法获取iframe内容框架');
    }
  } catch (error) {
    console.log('❌ iframe检查失败:', error.message);
  }

  // 尝试多种可能的选择器

  const downloadSelector = '#app .source_main_box .title .title-right .top-name-div .print-btn'

  // 等待按钮存在后再点击
  console.log('正在等待按钮出现...');
  try {
    await page.waitForSelector(downloadSelector, { timeout: 30 * 1000 });
    console.log('✅ 按钮已找到！');
    await page.click(downloadSelector);
    console.log('✅ 按钮已点击！');
  } catch (error) {
    console.log('❌ 按钮未找到:', error.message);
  }

  // 等待下载按钮出现（在iframe内）
  console.log('正在等待iframe内的下载按钮出现...');
  const printSelector = '.down-info .down-info-btn .print-btn'
  console.log('查找的选择器:', printSelector);

  try {
    // 获取iframe
    const iframe = await page.$('iframe');
    if (!iframe) {
      throw new Error('未找到iframe');
    }

    const frame = await iframe.contentFrame();
    if (!frame) {
      throw new Error('无法获取iframe内容框架');
    }

    console.log('✅ 已获取iframe内容框架');

    // 在iframe内等待按钮出现
    await frame.waitForSelector(printSelector, { timeout: 60 * 1000 });
    console.log('✅ iframe内下载按钮已找到！');

    // 打印下载按钮信息
    const downloadButton = await frame.$(printSelector);
    const buttonText = await frame.evaluate(el => el.textContent, downloadButton);
    console.log('下载按钮文本:', buttonText);

    // 在iframe内点击按钮
    await frame.click(printSelector);
    console.log('✅ iframe内下载按钮已点击！');
    // 获取当前URL中的name参数作为文件名
    const currentUrl = page.url();
    const urlParams = new URLSearchParams(currentUrl.split('?')[1]);
    const fileName = urlParams.get('name') || '试卷';
    console.log('提取的文件名:', fileName);

    // 设置下载路径到当前项目目录的download文件夹
    const downloadPath = path.join(__dirname, 'download');

    // 确保download文件夹存在
    if (!fs.existsSync(downloadPath)) {
      fs.mkdirSync(downloadPath, { recursive: true });
      console.log('✅ 已创建download文件夹:', downloadPath);
    }

    // 等待并检测浏览器打印弹框是否出现
    console.log('等待浏览器打印弹框出现...');

    // 使用Command+P调起浏览器打印弹框
    console.log('正在调起浏览器打印弹框...');

    await sleep(10000);
    try {
      console.log('开始生成PDF...');
      await page.emulateMediaType('screen')
      await sleep(1000)
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: false
      });
      
      fs.writeFileSync('hn.pdf', pdfBuffer);
      console.log('✅ PDF文件已保存为 hn.pdf');
    } catch (error) {
      console.log('❌ 打印过程中出现错误:', error.message);
    }


  } catch (error) {
    console.log('❌ iframe内下载按钮未找到:', error.message);
  }

  // 关闭浏览器
  // await browser.close();
}

run();
