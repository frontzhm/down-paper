const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 生成PDF文件的方法
 * @param {Object} options - 配置选项
 * @param {string} options.url - 要访问的URL
 * @param {Array} options.cookies - Cookie数组
 * @param {string} options.textSelector - 用于生成文件名的文本选择器（默认：'.x-text'）
 * @param {string} options.checkboxSelector - 复选框选择器（默认：'.el-checkbox'）
 * @param {Array} options.checkboxIndexes - 要点击的复选框索引数组（默认：[1, 2]）
 * @param {string} options.outputDir - 输出目录（默认：当前目录）
 * @returns {Promise<Object>} 返回生成的文件信息
 */
async function generatePDF(options) {
  let {
    url,
    cookies = [],
    textSelector = '.x-text',
    checkboxSelector = '.down-type-container-info .el-checkbox',
    checkboxIndexes = [1, 2],
    outputDir = './download/',
    headless = false  // 新增：是否使用无头模式
  } = options;

  if (!url) {
    const error = new Error('URL参数是必需的');
    logger.error('generatePDF参数验证失败', { error: error.message });
    throw error;
  }

  // 确保输出目录存在并格式化路径
  if (outputDir) {
    // 使用 path.join 和 path.sep 确保跨平台兼容
    let normalizedOutputDir = path.normalize(outputDir);
    
    // 确保路径末尾有分隔符，但避免双分隔符
    if (!normalizedOutputDir.endsWith(path.sep)) {
      normalizedOutputDir += path.sep;
    }
    
    if (!fs.existsSync(normalizedOutputDir)) {
      fs.mkdirSync(normalizedOutputDir, { recursive: true });
      logger.info('创建输出目录', { outputDir: normalizedOutputDir });
    }
    
    // 更新 outputDir 为标准化后的路径
    outputDir = normalizedOutputDir;
  }

  logger.info('开始PDF生成流程', { url, textSelector, checkboxSelector, checkboxIndexes });

  let browser;
  try {
    // 启动浏览器
    logger.info('启动浏览器');
    
    // 跨平台浏览器配置
    const browserOptions = {
      headless: headless,  // 使用传入的 headless 参数
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    };
    
    // 根据操作系统设置浏览器路径
    const os = require('os');
    const platform = os.platform();
    
    if (platform === 'darwin') {
      // macOS
      browserOptions.executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    } else if (platform === 'win32') {
      // Windows - 尝试常见的 Chrome 安装路径
      const possiblePaths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe'
      ];
      
      const fs = require('fs');
      for (const path of possiblePaths) {
        if (fs.existsSync(path)) {
          browserOptions.executablePath = path;
          break;
        }
      }
    }
    // Linux 和其他系统使用默认路径
    
    // 记录浏览器配置信息
    logger.info('浏览器配置', { 
      platform, 
      executablePath: browserOptions.executablePath || '使用默认路径',
      headless: browserOptions.headless 
    });
    
    browser = await puppeteer.launch(browserOptions);
    logger.success('浏览器启动成功');

    const page = await browser.newPage();

    // 监听页面控制台消息
    // page.on('console', msg => {
    //   console.log('页面控制台:', msg.text());
    // });

    // 设置窗口大小
    await page.setViewport({ width: 1500, height: 1200 });

    // 设置cookie
    if (cookies.length > 0) {
      await page.setCookie(...cookies);
    }

    // 访问页面
    logger.info('正在访问页面', { url });
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
    logger.success('页面访问成功');
    // 移除.preview-breadcrumb元素
    try {
      await page.waitForSelector('.preview-breadcrumb', { timeout: 10000 });
      logger.info('找到.preview-breadcrumb元素');
      
      await page.evaluate(() => {
        const elements = document.querySelectorAll('.preview-breadcrumb');
        elements.forEach(el => {
          el.remove();
        });
      });
      logger.success('已移除.preview-breadcrumb元素');
    } catch (error) {
      logger.warn('未找到.preview-breadcrumb元素', { error: error.message });
    }

    // 设置.down-preview-container-left的padding为0
    try {
      await page.waitForSelector('.down-preview-container-left', { timeout: 10000 });
      logger.info('找到.down-preview-container-left元素');
      
      await page.evaluate(() => {
        const elements = document.querySelectorAll('.down-preview-container-left');
        elements.forEach(el => {
          if (el && el.style) {
            el.style.padding = '0';
          }
        });
      });
      logger.success('已设置.down-preview-container-left的padding为0');
    } catch (error) {
      logger.warn('未找到.down-preview-container-left元素', { error: error.message });
    }

    // 查找文本元素并生成文件名
    let fileName = 'default';
    try {
      logger.info(`正在查找文本元素`, { selector: textSelector });
      await page.waitForSelector(textSelector, { timeout: 30*1000 });
      
      const textContent = await page.evaluate((selector) => {
        const element = document.querySelector(selector);
        return element ? element.textContent : null;
      }, textSelector);
      
      if (textContent) {
        logger.success('找到文本元素', { content: textContent });
        
        // 以-分割，取第二、三、四项，再用-拼接
        const parts = textContent.split('-');
        if (parts.length >= 4) {
          const result = `${parts[1]}-${parts[2]}-${parts[3]}`;
          fileName = result;
          logger.success('文件名生成成功', { fileName: result, originalText: textContent });
        } else {
          logger.warn('文本内容分割后项数不足4项', { parts, partCount: parts.length });
        }
      } else {
        logger.warn('未找到文本元素或无文本内容', { selector: textSelector });
      }
    } catch (error) {
      logger.error('处理文本元素时出现错误', { error: error.message, selector: textSelector });
    }

    const result = {
      files: [],
      fileName: fileName
    };

    logger.logPDFStart(url, fileName);

    // 生成第一个PDF（未点击复选框）
    try {
      logger.info('开始生成第一个PDF（无答案版本）');
      await page.emulateMediaType('screen');
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: false,
        displayHeaderFooter: false
      });

      const filePath1 = path.join(outputDir, `${fileName}.pdf`);
      fs.writeFileSync(filePath1, pdfBuffer);
      const fileSize = fs.statSync(filePath1).size;
      logger.logPDFSuccess(fileName, filePath1, fileSize);
      result.files.push(filePath1);
    } catch (error) {
      logger.logPDFError(fileName, error, { type: 'first_pdf', step: 'generate_without_answers' });
    }

    // 点击复选框并生成第二个PDF
    try {
      logger.info('开始查找复选框元素', { selector: checkboxSelector });
      await page.waitForSelector(checkboxSelector, { timeout: 30*1000 });
      
      const checkboxes = await page.$$(checkboxSelector);
      logger.success(`找到复选框元素`, { count: checkboxes.length, selector: checkboxSelector });
      
      if (checkboxes.length >= Math.max(...checkboxIndexes) + 1) {
        // 点击指定的复选框
        logger.info('开始点击复选框', { indexes: checkboxIndexes });
        for (const index of checkboxIndexes) {
          try {
            await checkboxes[index].click();
            logger.success(`已点击第${index + 1}个复选框`);
            await sleep(5*1000);
          } catch (clickError) {
            logger.error(`点击第${index + 1}个复选框失败`, { error: clickError.message, index });
          }
        }
        await sleep(5*1000);
        // 等待.answer-content元素出现且内部有两个.answer-item元素
        logger.info('等待答案内容加载');
        await page.waitForFunction(() => {
          const answerContent = document.querySelector('.answer-content');
          if (!answerContent) return false;
          const answerItems = answerContent.querySelectorAll('.answer-item');
          return answerItems.length >= 2;
        }, { timeout: 30*1000 });
        logger.success('答案内容加载完成');

        // 生成第二个PDF
        logger.info('开始生成第二个PDF（含答案版本）');
        await page.emulateMediaType('screen');
        const pdfBuffer2 = await page.pdf({
          format: 'A4',
          printBackground: false,
          displayHeaderFooter: false
        });
        
        const filePath2 = path.join(outputDir, `${fileName}-答案.pdf`);
        fs.writeFileSync(filePath2, pdfBuffer2);
        const fileSize2 = fs.statSync(filePath2).size;
        logger.logPDFSuccess(`${fileName}-答案`, filePath2, fileSize2);
        result.files.push(filePath2);
      } else {
        logger.warn('未找到足够的复选框元素', { 
          found: checkboxes.length, 
          required: Math.max(...checkboxIndexes) + 1,
          selector: checkboxSelector 
        });
      }
    } catch (error) {
      logger.logPDFError(fileName, error, { 
        type: 'second_pdf', 
        step: 'generate_with_answers',
        selector: checkboxSelector,
        indexes: checkboxIndexes 
      });
    }

    logger.success('PDF生成流程完成', { 
      fileName, 
      filesGenerated: result.files.length,
      files: result.files 
    });
    return result;

  } catch (error) {
    // 特殊处理浏览器启动错误
    if (error.message.includes('Failed to launch the browser process') || 
        error.message.includes('spawn') || 
        error.message.includes('ENOENT')) {
      
      const os = require('os');
      const platform = os.platform();
      
      let errorMessage = '浏览器启动失败。';
      
      if (platform === 'win32') {
        errorMessage += '\n\nWindows 系统解决方案：';
        errorMessage += '\n1. 确保已安装 Google Chrome 浏览器';
        errorMessage += '\n2. 如果已安装，请尝试重新安装 Chrome';
        errorMessage += '\n3. 或者安装 Chromium: npm install -g chromium';
        errorMessage += '\n4. 或者使用无头模式（在代码中设置 headless: true）';
      } else if (platform === 'darwin') {
        errorMessage += '\n\nmacOS 系统解决方案：';
        errorMessage += '\n1. 确保已安装 Google Chrome 浏览器';
        errorMessage += '\n2. 检查 Chrome 是否在 /Applications/ 目录下';
      } else {
        errorMessage += '\n\nLinux 系统解决方案：';
        errorMessage += '\n1. 安装 Chrome: sudo apt-get install google-chrome-stable';
        errorMessage += '\n2. 或者安装 Chromium: sudo apt-get install chromium-browser';
      }
      
      logger.error('浏览器启动失败', { 
        error: error.message, 
        platform,
        url,
        solution: errorMessage
      });
      
      throw new Error(errorMessage);
    } else {
      logger.error('PDF生成过程中出现严重错误', { 
        error: error.message, 
        stack: error.stack,
        url 
      });
      throw error;
    }
  } finally {
    if (browser) {
      logger.info('关闭浏览器');
      await browser.close();
    }
  }
}

module.exports = { generatePDF };
