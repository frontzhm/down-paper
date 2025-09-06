const puppeteer = require('puppeteer');
const { generatePDF } = require('./pdfGenerator');
const logger = require('./logger');

// sleep函数
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 处理iframe页面并生成PDF的方法
 * @param {Object} options - 配置选项
 * @param {string} options.url - 要访问的主页面URL
 * @param {string|Array} options.cookies - Cookie字符串或数组
 * @param {string} options.downloadSelector - 下载按钮选择器（默认：'#app .source_main_box .title .title-right .top-name-div .print-btn'）
 * @param {string} options.printSelector - 打印按钮选择器（默认：'.down-info .down-info-btn .print-btn'）
 * @param {string} options.textSelector - 用于生成文件名的文本选择器（默认：'.x-text'）
 * @param {string} options.checkboxSelector - 复选框选择器（默认：'.el-checkbox'）
 * @param {Array} options.checkboxIndexes - 要点击的复选框索引数组（默认：[1, 2]）
 * @param {string} options.outputDir - 输出目录（默认：''）
 * @returns {Promise<Object>} 返回生成的文件信息
 */
async function processIframeAndGeneratePDF(options) {
  const {
    url,
    cookies = '',
    downloadSelector = '#app .source_main_box .title .title-right .top-name-div .print-btn',
    printSelector = '.down-info .down-info-btn .print-btn',
    textSelector = '.x-text',
    checkboxSelector = '.el-checkbox',
    checkboxIndexes = [1, 2],
    outputDir = ''
  } = options;

  // 将cookie字符串转换为对象数组格式
  let cookieArray = [];
  if (typeof cookies === 'string' && cookies.length > 0) {
    cookieArray = cookies.split('; ').map(cookieItem => {
      const [name, value] = cookieItem.split('=');
      return { name, value, domain: '.xdf.cn' };
    });
  } else if (Array.isArray(cookies)) {
    cookieArray = cookies;
  }

  if (!url) {
    const error = new Error('URL参数是必需的');
    logger.error('processIframeAndGeneratePDF参数验证失败', { error: error.message });
    throw error;
  }

  logger.info('开始iframe处理流程', { 
    url, 
    downloadSelector, 
    printSelector, 
    textSelector, 
    checkboxSelector 
  });

  let browser;
  try {
    // 启动浏览器 窗口最大化
    logger.info('启动浏览器（iframe处理）');
    browser = await puppeteer.launch({
      headless: false,
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--window-size=2800,1200',
        '--start-maximized'
      ]
    });
    logger.success('浏览器启动成功（iframe处理）');
    const page = await browser.newPage();

    // 设置窗口大小
    await page.setViewport({ width: 1500, height: 1200 });

    // 检查实际窗口大小
    await page.viewport();

    // 获取实际窗口大小
   await page.evaluate(() => {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height
      };
    });

    // 设置cookie
    if (cookieArray.length > 0) {
      await page.setCookie(...cookieArray);
    }

    // 打开网页
    logger.info('正在访问主页面', { url });
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
    logger.success('主页面访问成功');
    // 检查iframe是否加载完成
    logger.info('正在检查iframe加载状态');
    try {
      // 等待iframe出现
      await page.waitForSelector('iframe', { timeout: 10000 });
      logger.success('iframe已找到');

      // 获取iframe元素
      const iframe = await page.$('iframe');
      if (!iframe) {
        throw new Error('未找到iframe元素');
      }
      
      const frame = await iframe.contentFrame();
      if (!frame) {
        throw new Error('无法获取iframe内容框架');
      }

      logger.success('iframe内容框架已获取');

      // 等待iframe内容加载完成
      try {
        await frame.waitForSelector('body', { timeout: 30000 });
        logger.success('iframe内容加载完成');

        // 等待iframe内的网络请求完成
        await frame.waitForFunction(() => {
          return document.readyState === 'complete';
        }, { timeout: 30000 });
        logger.success('iframe文档状态完成');

      } catch (frameError) {
        logger.warn('iframe内容加载超时', { error: frameError.message });
      }

    } catch (error) {
      logger.error('iframe检查失败', { error: error.message });
      throw error;
    }

    // 等待按钮存在后再点击
    logger.info('正在等待主页面按钮出现', { selector: downloadSelector });
    try {
      await page.waitForSelector(downloadSelector, { timeout: 30 * 1000 });
      logger.success('主页面按钮已找到');
      await page.click(downloadSelector);
      logger.success('主页面按钮已点击');
    } catch (error) {
      logger.error('主页面按钮未找到或点击失败', { 
        error: error.message, 
        selector: downloadSelector 
      });
      throw error;
    }

    // 等待下载按钮出现（在iframe内）
    logger.info('正在等待iframe内的下载按钮出现', { selector: printSelector });

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

      logger.success('已获取iframe内容框架');

      // 在iframe内等待按钮出现
      await frame.waitForSelector(printSelector, { timeout: 60 * 1000 });
      logger.success('iframe内下载按钮已找到');

      // 获取下载按钮信息
      const downloadButton = await frame.$(printSelector);
      if (downloadButton) {
        const buttonText = await frame.evaluate(el => el.textContent, downloadButton);
        logger.info('下载按钮信息', { text: buttonText });
      }

      // 获取frame的URL
      const frameUrl = await frame.url();
      logger.success('获取到frame URL', { frameUrl });

      // 关闭当前浏览器
      logger.info('关闭iframe处理浏览器');
      await browser.close();

      // 调用generatePDF方法
      logger.info('开始调用generatePDF方法处理frame内容');
      
      const result = await generatePDF({
        url: frameUrl,
        cookies: cookieArray,
        textSelector: textSelector,
        checkboxSelector: checkboxSelector,
        checkboxIndexes: checkboxIndexes,
        outputDir: outputDir
      });
      
      logger.success('iframe处理流程完成', { 
        fileName: result.fileName,
        files: result.files,
        fileCount: result.files.length 
      });

      return result;

    } catch (error) {
      logger.error('iframe内下载按钮处理失败', { 
        error: error.message, 
        stack: error.stack,
        selector: printSelector 
      });
      throw error;
    }

  } catch (error) {
    logger.error('iframe处理过程中出现严重错误', { 
      error: error.message, 
      stack: error.stack,
      url 
    });
    throw error;
  } finally {
    if (browser) {
      logger.info('关闭iframe处理浏览器（finally）');
      await browser.close();
    }
  }
}

module.exports = { processIframeAndGeneratePDF };
