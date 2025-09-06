const puppeteer = require('puppeteer');
const fs = require('fs');
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
  // 启动浏览器
  const browser = await puppeteer.launch({
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

  await page.goto('https://tiji.xdf.cn/downloadPreView?tenantId=1001&subject=%5Bobject%20Object%5D&jwSubject=1574&stage=2&businessId=CL2ffcf14ad3984eab801a695dfc80dde7&pageSource=PaperCenter');
  await sleep(1000);

  console.log('✅ 已访问试卷预览页');

  // 等待页面加载
  await new Promise(resolve => setTimeout(resolve, 5000));

  // 等待.preview-breadcrumb元素出现并隐藏
  try {
    await page.waitForSelector('.preview-breadcrumb', { timeout: 10000 });
    console.log('✅ 找到.preview-breadcrumb元素');
    
    // 移除元素
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

  // 检查页面状态
  const pageInfo = await page.evaluate(() => {
    return {
      title: document.title,
      url: window.location.href,
      hasPrintFunction: typeof window.print === 'function',
      userAgent: navigator.userAgent
    };
  });
  console.log('页面信息:', pageInfo);

  // 使用JavaScript调用window.print()调起打印弹框
  console.log('正在调起打印弹框...');


  // await page.evaluate(() => {
  //   window.print();

  // });
  try {
    await page.emulateMediaType('screen')
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: false,
      displayHeaderFooter: false
    });

    fs.writeFileSync('hn.pdf', pdfBuffer);
    console.log('✅ PDF文件已保存为 hn.pdf');
  } catch (error) {
    console.log('❌ 打印过程中出现错误:', error.message);
  }


  // 等待打印弹框出现
  // 监听所有对话框事件




  // 不关闭浏览器，方便查看结果
  // await browser.close();
}

run();

/**
 * 
      // 使用Tab键导航到打印机选择区域
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 选择第二项打印机（按一次下箭头键）
      await page.keyboard.press('ArrowDown');
      console.log('✅ 已选择第二项打印机');
      
      // 等待5秒
      console.log('等待5秒后触发保存...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // 触发保存
      console.log('正在触发保存...');
      
      // 使用Tab键导航到保存按钮
      for (let i = 0; i < 6; i++) {
        await page.keyboard.press('Tab');
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // 按回车键点击保存按钮
      await page.keyboard.press('Enter');
      console.log('✅ 已触发保存');
      
 */
