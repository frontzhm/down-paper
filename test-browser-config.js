#!/usr/bin/env node

/**
 * 测试跨平台浏览器配置
 */

const { getChromeExecutablePath, getBrowserOptions, isChromeAvailable, getPlatformInfo } = require('./src/browserConfig');

console.log('🧪 测试跨平台浏览器配置...\n');

try {
  // 获取平台信息
  const platformInfo = getPlatformInfo();
  console.log('📊 平台信息:');
  console.log(`   操作系统: ${platformInfo.platform}`);
  console.log(`   架构: ${platformInfo.arch}`);
  console.log(`   Chrome 路径: ${platformInfo.chromePath || '未找到'}`);
  console.log(`   Chrome 可用: ${platformInfo.chromeAvailable ? '✅' : '❌'}`);
  console.log('');

  // 测试 Chrome 路径检测
  console.log('🔍 Chrome 路径检测:');
  const chromePath = getChromeExecutablePath();
  if (chromePath) {
    console.log(`   ✅ 找到 Chrome: ${chromePath}`);
  } else {
    console.log('   ❌ 未找到 Chrome，将使用 Puppeteer 默认路径');
  }
  console.log('');

  // 测试浏览器配置
  console.log('⚙️  浏览器配置测试:');
  
  // 测试无头模式配置
  const headlessOptions = getBrowserOptions({ headless: true });
  console.log('   无头模式配置:');
  console.log(`     headless: ${headlessOptions.headless}`);
  console.log(`     executablePath: ${headlessOptions.executablePath || '使用默认'}`);
  console.log(`     args: ${headlessOptions.args.length} 个参数`);
  
  // 测试有头模式配置
  const headedOptions = getBrowserOptions({ 
    headless: false,
    args: ['--window-size=1920,1080']
  });
  console.log('   有头模式配置:');
  console.log(`     headless: ${headedOptions.headless}`);
  console.log(`     executablePath: ${headedOptions.executablePath || '使用默认'}`);
  console.log(`     args: ${headedOptions.args.length} 个参数`);
  console.log('');

  // 测试 Chrome 可用性
  console.log('✅ Chrome 可用性检查:');
  if (isChromeAvailable()) {
    console.log('   ✅ Chrome 可用，可以正常启动浏览器');
  } else {
    console.log('   ⚠️  Chrome 不可用，可能需要安装 Chrome 或使用 Puppeteer 默认浏览器');
  }
  console.log('');

  console.log('🎉 跨平台浏览器配置测试完成！');
  
  // 提供安装建议
  if (!isChromeAvailable()) {
    console.log('\n💡 安装建议:');
    if (platformInfo.platform === 'win32') {
      console.log('   Windows: 请安装 Google Chrome 浏览器');
      console.log('   下载地址: https://www.google.com/chrome/');
    } else if (platformInfo.platform === 'darwin') {
      console.log('   macOS: 请安装 Google Chrome 浏览器');
      console.log('   下载地址: https://www.google.com/chrome/');
    } else if (platformInfo.platform === 'linux') {
      console.log('   Linux: 请安装 Google Chrome 或 Chromium');
      console.log('   Ubuntu/Debian: sudo apt-get install google-chrome-stable');
      console.log('   或者: sudo apt-get install chromium-browser');
    }
  }
  
} catch (error) {
  console.error('❌ 浏览器配置测试失败:', error.message);
  console.error('   错误详情:', error.stack);
  process.exit(1);
}