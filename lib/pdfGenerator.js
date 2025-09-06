const puppeteer = require('puppeteer');
const fs = require('fs');
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
  const {
    url,
    cookies = [],
    textSelector = '.x-text',
    checkboxSelector = '.down-type-container-info .el-checkbox',
    checkboxIndexes = [1, 2],
    outputDir = ''
  } = options;

  if (!url) {
    const error = new Error('URL参数是必需的');
    logger.error('generatePDF参数验证失败', { error: error.message });
    throw error;
  }

  logger.info('开始PDF生成流程', { url, textSelector, checkboxSelector, checkboxIndexes });

  let browser;
  try {
    // 启动浏览器
    logger.info('启动浏览器');
    browser = await puppeteer.launch({
      headless: false,
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
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

      const filePath1 = `${outputDir}${fileName}.pdf`;
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
        
        const filePath2 = `${outputDir}${fileName}-答案.pdf`;
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
    logger.error('PDF生成过程中出现严重错误', { 
      error: error.message, 
      stack: error.stack,
      url 
    });
    throw error;
  } finally {
    if (browser) {
      logger.info('关闭浏览器');
      await browser.close();
    }
  }
}

module.exports = { generatePDF };
