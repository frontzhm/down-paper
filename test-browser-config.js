#!/usr/bin/env node

/**
 * 测试跨平台浏览器配置
 */

const os = require('os');
const fs = require('fs');
const path = require('path');

console.log('🧪 测试跨平台浏览器配置...\n');

const platform = os.platform();
console.log(`当前平台: ${platform}`);

// 模拟浏览器配置逻辑
function getBrowserConfig() {
  const browserOptions = {
    headless: false,
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
  
  if (platform === 'darwin') {
    // macOS
    browserOptions.executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    console.log('🍎 macOS 配置:');
    console.log(`   浏览器路径: ${browserOptions.executablePath}`);
    console.log(`   路径存在: ${fs.existsSync(browserOptions.executablePath) ? '✅' : '❌'}`);
    
  } else if (platform === 'win32') {
    // Windows - 尝试常见的 Chrome 安装路径
    const possiblePaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe'
    ];
    
    console.log('🪟 Windows 配置:');
    console.log('   尝试的路径:');
    
    let foundPath = null;
    for (const chromePath of possiblePaths) {
      const exists = fs.existsSync(chromePath);
      console.log(`   ${exists ? '✅' : '❌'} ${chromePath}`);
      if (exists && !foundPath) {
        foundPath = chromePath;
      }
    }
    
    if (foundPath) {
      browserOptions.executablePath = foundPath;
      console.log(`   ✅ 使用路径: ${foundPath}`);
    } else {
      console.log('   ⚠️  未找到 Chrome，将使用默认路径');
    }
    
  } else {
    // Linux 和其他系统
    console.log('🐧 Linux/其他系统配置:');
    console.log('   使用默认浏览器路径');
  }
  
  return browserOptions;
}

const config = getBrowserConfig();

console.log('\n📋 最终浏览器配置:');
console.log(`   平台: ${platform}`);
console.log(`   无头模式: ${config.headless}`);
console.log(`   浏览器路径: ${config.executablePath || '使用默认路径'}`);
console.log(`   启动参数: ${config.args.length} 个`);

console.log('\n🔧 启动参数详情:');
config.args.forEach((arg, index) => {
  console.log(`   ${index + 1}. ${arg}`);
});

// 测试 Puppeteer 是否能正常导入
console.log('\n📦 测试 Puppeteer 导入:');
try {
  const puppeteer = require('puppeteer');
  console.log('   ✅ Puppeteer 导入成功');
  console.log(`   版本: ${puppeteer.version || '未知'}`);
} catch (error) {
  console.log('   ❌ Puppeteer 导入失败:', error.message);
}

console.log('\n🎯 建议:');
if (platform === 'win32') {
  console.log('   - 确保已安装 Google Chrome 浏览器');
  console.log('   - 如果遇到问题，可以尝试安装 Chromium');
  console.log('   - 或者使用无头模式运行');
} else if (platform === 'darwin') {
  console.log('   - 确保 Chrome 在 /Applications/ 目录下');
  console.log('   - 如果使用 Homebrew 安装的 Chrome，路径可能不同');
} else {
  console.log('   - 确保已安装 Chrome 或 Chromium');
  console.log('   - 在服务器环境中建议使用无头模式');
}

console.log('\n✨ 测试完成！');
