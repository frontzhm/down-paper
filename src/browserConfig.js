const os = require('os');
const fs = require('fs');
const path = require('path');

/**
 * 获取跨平台的 Chrome 浏览器路径
 * @returns {string|null} Chrome 可执行文件路径，如果未找到则返回 null
 */
function getChromeExecutablePath() {
  const platform = os.platform();
  
  if (platform === 'darwin') {
    // macOS
    const macPath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    if (fs.existsSync(macPath)) {
      return macPath;
    }
  } else if (platform === 'win32') {
    // Windows - 尝试常见的 Chrome 安装路径
    const possiblePaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe'),
      path.join(process.env.PROGRAMFILES || '', 'Google\\Chrome\\Application\\chrome.exe'),
      path.join(process.env['PROGRAMFILES(X86)'] || '', 'Google\\Chrome\\Application\\chrome.exe')
    ];
    
    for (const chromePath of possiblePaths) {
      if (chromePath && fs.existsSync(chromePath)) {
        return chromePath;
      }
    }
  } else if (platform === 'linux') {
    // Linux - 尝试常见的 Chrome 安装路径
    const possiblePaths = [
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
      '/snap/bin/chromium'
    ];
    
    for (const chromePath of possiblePaths) {
      if (fs.existsSync(chromePath)) {
        return chromePath;
      }
    }
  }
  
  return null; // 未找到 Chrome，使用 Puppeteer 默认路径
}

/**
 * 获取跨平台的浏览器启动配置
 * @param {Object} options - 浏览器配置选项
 * @param {boolean} options.headless - 是否无头模式
 * @param {Array} options.args - 额外的启动参数
 * @returns {Object} 浏览器启动配置
 */
function getBrowserOptions(options = {}) {
  const { headless = true, args = [] } = options;
  
  const browserOptions = {
    headless,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      ...args
    ]
  };
  
  // 尝试设置 Chrome 路径
  const chromePath = getChromeExecutablePath();
  if (chromePath) {
    browserOptions.executablePath = chromePath;
  }
  
  return browserOptions;
}

/**
 * 检查 Chrome 是否可用
 * @returns {boolean} Chrome 是否可用
 */
function isChromeAvailable() {
  return getChromeExecutablePath() !== null;
}

/**
 * 获取当前平台信息
 * @returns {Object} 平台信息
 */
function getPlatformInfo() {
  return {
    platform: os.platform(),
    arch: os.arch(),
    chromePath: getChromeExecutablePath(),
    chromeAvailable: isChromeAvailable()
  };
}

module.exports = {
  getChromeExecutablePath,
  getBrowserOptions,
  isChromeAvailable,
  getPlatformInfo
};
