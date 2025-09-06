const puppeteer = require('puppeteer');
const fs = require('fs');
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
async function generatePDF(options = {}) {
  const {
    url,
    cookies = [],
    textSelector = '.x-text',
    checkboxSelector = '.el-checkbox',
    checkboxIndexes = [1, 2],
    outputDir = ''
  } = options;

  if (!url) {
    throw new Error('URL参数是必需的');
  }

  let browser;
  try {
    // 启动浏览器
    browser = await puppeteer.launch({
      headless: false,
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // 监听页面控制台消息
    page.on('console', msg => {
      console.log('页面控制台:', msg.text());
    });

    // 设置窗口大小
    await page.setViewport({ width: 1500, height: 1200 });

    // 设置cookie
    if (cookies.length > 0) {
      await page.setCookie(...cookies);
    }

    // 访问页面
    await page.goto(url);
    await sleep(1000);
    console.log('✅ 已访问页面');

    // 等待页面加载
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 移除.preview-breadcrumb元素
    try {
      await page.waitForSelector('.preview-breadcrumb', { timeout: 10000 });
      console.log('✅ 找到.preview-breadcrumb元素');
      
      await page.evaluate(() => {
        const elements = document.querySelectorAll('.preview-breadcrumb');
        elements.forEach(el => {
          el.remove();
        });
      });
      console.log('✅ 已移除.preview-breadcrumb元素');
    } catch (error) {
      console.log('⚠️ 未找到.preview-breadcrumb元素:', error.message);
    }

    // 设置.down-preview-container-left的padding为0
    try {
      await page.waitForSelector('.down-preview-container-left', { timeout: 10000 });
      console.log('✅ 找到.down-preview-container-left元素');
      
      await page.evaluate(() => {
        const elements = document.querySelectorAll('.down-preview-container-left');
        elements.forEach(el => {
          el.style.padding = '0';
        });
      });
      console.log('✅ 已设置.down-preview-container-left的padding为0');
    } catch (error) {
      console.log('⚠️ 未找到.down-preview-container-left元素:', error.message);
    }

    // 查找文本元素并生成文件名
    let fileName = 'default';
    try {
      console.log(`正在查找${textSelector}元素...`);
      await page.waitForSelector(textSelector, { timeout: 10000 });
      
      const textContent = await page.evaluate((selector) => {
        const element = document.querySelector(selector);
        return element ? element.textContent : null;
      }, textSelector);
      
      if (textContent) {
        console.log('✅ 找到文本元素，内容:', textContent);
        
        // 以-分割，取第二、三、四项，再用-拼接
        const parts = textContent.split('-');
        if (parts.length >= 4) {
          const result = `${parts[1]}-${parts[2]}-${parts[3]}`;
          fileName = result;
          console.log('✅ 处理后的字符串:', result);
        } else {
          console.log('⚠️ 文本内容分割后项数不足4项');
        }
      } else {
        console.log('⚠️ 未找到文本元素或无文本内容');
      }
    } catch (error) {
      console.log('❌ 处理文本元素时出现错误:', error.message);
    }

    const result = {
      files: [],
      fileName: fileName
    };

    // 生成第一个PDF（未点击复选框）
    try {
      console.log('开始生成第一个PDF...');
      await page.emulateMediaType('screen');
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: false,
        displayHeaderFooter: false
      });

      const filePath1 = `${outputDir}${fileName}.pdf`;
      fs.writeFileSync(filePath1, pdfBuffer);
      console.log(`✅ PDF文件已保存为 ${filePath1}`);
      result.files.push(filePath1);
    } catch (error) {
      console.log('❌ 生成第一个PDF时出现错误:', error.message);
    }

    // 点击复选框并生成第二个PDF
    try {
      console.log(`正在查找${checkboxSelector}元素...`);
      await page.waitForSelector(checkboxSelector, { timeout: 10000 });
      
      const checkboxes = await page.$$(checkboxSelector);
      console.log(`✅ 找到 ${checkboxes.length} 个复选框元素`);
      
      if (checkboxes.length >= Math.max(...checkboxIndexes) + 1) {
        // 点击指定的复选框
        for (const index of checkboxIndexes) {
          await checkboxes[index].click();
          console.log(`✅ 已点击第${index + 1}个复选框`);
        }
        
        // 等待5秒
        console.log('等待5秒...');
        await sleep(5000);
        
        // 生成第二个PDF
        console.log('开始生成第二个PDF...');
        await page.emulateMediaType('screen');
        const pdfBuffer2 = await page.pdf({
          format: 'A4',
          printBackground: false,
          displayHeaderFooter: false
        });
        
        const filePath2 = `${outputDir}${fileName}-答案.pdf`;
        fs.writeFileSync(filePath2, pdfBuffer2);
        console.log(`✅ PDF文件已保存为 ${filePath2}`);
        result.files.push(filePath2);
      } else {
        console.log('⚠️ 未找到足够的复选框元素');
      }
    } catch (error) {
      console.log('❌ 处理复选框时出现错误:', error.message);
    }

    return result;

  } catch (error) {
    console.error('❌ 生成PDF过程中出现错误:', error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = { generatePDF };
