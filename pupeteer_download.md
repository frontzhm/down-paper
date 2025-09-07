---
title: pupeteer批量下载试卷
theme: awesome-green
highlight:
---
这两天朋友问我，她手上有个重复性繁琐的工作，能不能帮忙搞个程序干掉？！
简言之，根据查询条件，把搜到相应结果的试卷列表都下载下来。
但是步骤有点多：
1. 点击查询条件，搜出试卷列表
2. 点击第一个试卷，跳到试卷详情页
3. 点击详情页的**打印试卷**按钮
4. 页面状态更新，点击**立即打印**按钮
5. 弹框打印框，将选项设置为“另存为PDF”，文件名改成试卷名
6. 勾选预览页的**答案**和**解析**，点击预览页的**立即打印**按钮
7. 弹框打印框，将选项设置为“另存为PDF”，文件名改成**试卷名-答案**

我一听感觉还行，这不就是pupeteer的活么，我来揽！

结果写的时候，一堆阻碍，但是最后实现了！写下过程和代码，万一之后用到呢！

## 问题1:怎么也找不到预览页的立即打印按钮！

奇怪，写的时候，详情页的打印按钮都能找到，但第4步的**立即打印**按钮找不到，调试了一阵子！
后来才发现，立即打印其实是在一个iframe里，直接的选择器是找不到的，通过iframe找。
好，下次知道了，iframe里的选择器，得通过iframe才行。

## 问题2：点了立即打印按钮，没反应！

嘎？点了为啥没反应，按钮好不容易找到了！
翻来覆去找了阵子，想着也许是和浏览器的默认打印框有关，然后搜搜怎么弹打印框

智能AI的建议是，模拟按键： Command+P，但不好使。
最后使用的是 window.print()

但紧接着更大的坑来了，弹框出现了，但是控制不了上面的选项，也不能控制点击保存键！！

卡了半天！

后来又想了，没必要非得弹框，我的目标是PDF啊，看有没有生成PDF的方法不就是，我真是个大聪明！`page.pdf()`就是这么个方法

但是！保存下来的页面没有全乎，只有可视区域，我又来回试了好几遍，这就要不能揽了么！我不信！我不服啊！

我又灵机一动！！

这不是iframe么，我直接用新页面打开试试！

咦！靠谱！这时候再调用`pdf`，又多了个头部和边上的一点背景！

啊呀呀！没事！难不倒我！设置样式干掉！

靠谱！终于一个满意的pdf生成了！

好，下次知道了，带着iframe的页面pdf生成有问题，单独打开新页面就好了！部分样式有出入的话，设置下就行！


## 问题3：从列表里挨个点，调整到详情页，这个感觉很费劲！

列表项长度也不太一样，页数也不太一样，直接用选择器有点费劲啊！
咋整？  
有了！  
直接用查询条件，请求接口，接口返回列表信息，再把单个项信息参数进行拼接，这样就能得到详情地址数组了！

下次就晓得了！批量详情页，就用列表数据拼接成链接好了！  

## 问题3：朋友可不是开发人员啊，怎么运行代码呢！！

功能都写完了，我电脑运行没问题，但是她可能经常用这个功能，她想自己干呐！

这个头秃的！

嗯。。。。

写个命令吧！发布到npm上！回头电脑执行个命令就行！！

还能把查询条件，写成命令参数！这样换条件，也能灵活下载！

我真是个大聪明！

下次就知道了！让非开发人员快速使用功能，就写成命令发布，这样就能用了！

## 问题4：windows的路径分隔符不支持！

命令写完了！
npm包都发完了！
我试了下windows执行，靠，路径报错了！
因为我的是mac!
这个问题还算小问题，咔咔咔，一顿改，将路径分隔符改成动态获取！

下次知道了！mac和windows的路径分隔符不一样，写通用命令，得写活的！

## 问题5：Chrome的路径不支持！

再次发包！  
再次windows执行！  
靠！失败了！  
找不到Chrome，打不开！  
因为对面是windows啊，啊啊啊啊啊啊啊啊啊啊！

好在也有动态获取安装路径的法子！
这就算搞定了！

## 问题6：怎么也能显示进度和整体情况！

朋友说，我这不知道总共几个链接，也不晓得成功和失败几个啊！
啊！
是！
再加个日志管理器！
这样，每到一个步骤，控制台输出，最终还给一个总的，如果失败的话，是哪个链接失败了，这样手动下载，也是不错的！
下次知道了！命令尽量也加个日志系统，输出也酷，有错误也不怕！

## 下面说代码了

### bin/down-paper.js

首先是支持命令，项目里建个`bin/down-paper.js`，参数和支持选项

![down_paper4.png](https://blog-huahua.oss-cn-beijing.aliyuncs.com/blog/code/down_paper4.png)

![down_paper5.png](https://blog-huahua.oss-cn-beijing.aliyuncs.com/blog/code/down_paper4.png)

```js
#!/usr/bin/env node

const { runBatchPDFGeneration } = require('../lib/batchProcessor');
const path = require('path');

/**
 * CLI 命令行工具
 * 支持通过命令行参数配置和运行批量PDF生成任务
 */

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--cookie':
      case '-c':
        options.cookie = args[++i];
        break;
      case '--subject-id':
      case '-s':
        options.subjectId = parseInt(args[++i]);
        break;
      case '--grade':
      case '-g':
        options.grade = args[++i];
        break;
      case '--quarter':
      case '-q':
        options.quarter = parseInt(args[++i]);
        break;
      case '--use-scene':
      case '-u':
        options.useScene = args[++i];
        break;
      case '--output-dir':
      case '-o':
        options.outputDir = args[++i];
        break;
      case '--headless':
        options.headless = true;
        break;
      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
        break;
      case '--version':
      case '-v':
        console.log(require('../package.json').version);
        process.exit(0);
        break;
      default:
        if (arg.startsWith('--')) {
          console.error(`未知参数: ${arg}`);
          showHelp();
          process.exit(1);
        }
        break;
    }
  }
  
  return options;
}

// 显示帮助信息
function showHelp() {
  console.log(`
📚 批量下载试卷PDF工具

用法:
  down-paper [选项]

选项:
  -c, --cookie <string>        Cookie字符串 (必需)
  -s, --subject-id <number>    科目ID (默认: 1574)
  -g, --grade <string>         年级 (默认: 0557)
  -q, --quarter <number>       学期 (默认: 3)
  -u, --use-scene <string>     使用场景 (默认: khlx)
  -o, --output-dir <string>    输出目录 (默认: ./1-download)
  --headless                   使用无头模式运行浏览器 (适合服务器环境)
  -h, --help                   显示帮助信息
  -v, --version                显示版本号

示例:
  # 基本用法（使用默认输出目录）
  down-paper --cookie "your-cookie-string"

  # 指定自定义输出目录（推荐）
  # Linux/macOS:
  down-paper --cookie "your-cookie-string" --output-dir "./my-papers"
  # Windows:
  down-paper --cookie "your-cookie-string" --output-dir ".\\my-papers"

  # 指定年级和输出目录
  down-paper --cookie "your-cookie-string" --grade "0558" --output-dir "./downloads"

  # 指定所有参数
  down-paper --cookie "your-cookie-string" --subject-id 1574 --grade "0557" --quarter 3 --use-scene "khlx" --output-dir "./downloads"

  # 使用无头模式（适合服务器环境）
  down-paper --cookie "your-cookie-string" --headless --output-dir "./downloads"

年级代码:
  0555 - S3          0556 - S4          0557 - 一年级
  0558 - 二年级      0559 - 三年级      0560 - 四年级
  0561 - 五年级      0562 - 六年级      0567 - 不区分
  0999 - 小升初

使用场景:
  gdk   - 功底考      jdcp  - 阶段测试      khlx  - 课后测试
  nlcp  - 能力测评    syttl - 素养天天练

学期代码:
  1 - 春季           2 - 暑假           3 - 秋季
  4 - 寒假           9 - 不区分
`);
}

// 验证必需参数
function validateOptions(options) {
  if (!options.cookie) {
    console.error('❌ 错误: 必须提供 --cookie 参数');
    console.log('使用 --help 查看帮助信息');
    process.exit(1);
  }
}

// 主函数
async function main() {
  try {
    console.log('🚀 批量下载试卷PDF工具启动中...\n');
    
    // 显示重要提醒
    console.log('⚠️  重要提醒:');
    console.log('   建议使用 --output-dir 参数指定输出目录');
    console.log('   默认会在当前目录创建 1-download 文件夹\n');
    
    const options = parseArgs();
    validateOptions(options);
    
    // 构建配置对象
    const config = {
      cookie: options.cookie,
      queryParams: {
        subjectId: options.subjectId || 1574,
        useScene: options.useScene || 'khlx',
        grade: options.grade || '0557',
        quarter: options.quarter || 3
      },
      outputDir: options.outputDir || './1-download',
      headless: options.headless || false
    };
    
    console.log('📋 配置信息:');
    console.log(`   科目ID: ${config.queryParams.subjectId}`);
    console.log(`   年级: ${config.queryParams.grade}`);
    console.log(`   学期: ${config.queryParams.quarter}`);
    console.log(`   使用场景: ${config.queryParams.useScene}`);
    console.log(`   输出目录: ${config.outputDir}`);
    console.log(`   无头模式: ${config.headless ? '是' : '否'}`);
    console.log(`   Cookie: ${config.cookie.substring(0, 50)}...`);
    console.log('');
    
    // 执行批量PDF生成
    const result = await runBatchPDFGeneration(config);
    
    console.log('\n🎉 任务完成!');
    console.log(`   总计: ${result.total} 个任务`);
    console.log(`   成功: ${result.success} 个`);
    console.log(`   失败: ${result.failed} 个`);
    console.log(`   耗时: ${(result.duration / 1000).toFixed(2)} 秒`);
    
    if (result.failed > 0) {
      console.log('\n❌ 失败的链接:');
      result.failedLinks.forEach(link => {
        console.log(`   ${link.index}. ${link.url}`);
        console.log(`      错误: ${link.error}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 执行失败:', error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// 如果直接运行此文件，则执行主函数
if (require.main === module) {
  main();
}

module.exports = { main, parseArgs, showHelp };

```

## 📁 lib/ 目录代码逻辑详解

lib目录包含了发布到npm包中的核心代码，这些文件是从src目录构建而来的。下面详细分析每个文件的逻辑：

### 1. lib/index.js - API入口文件

这是npm包的API入口文件，提供了程序化调用的接口：

```javascript
/**
 * 批量下载试卷PDF工具 - 主入口文件
 * 
 * 这个文件提供了两种使用方式：
 * 1. 作为CLI工具直接运行
 * 2. 作为模块被其他文件引用
 */

const { runBatchPDFGeneration } = require('./batchProcessor');

// 如果直接运行此文件，则执行默认配置
if (require.main === module) {
  console.log('🚀 批量下载试卷PDF工具');
  console.log('📝 使用默认配置运行...\n');
  
  console.log('⚠️  重要提醒:');
  console.log('   工具会在当前目录创建 1-download 文件夹');
  console.log('   建议使用 --output-dir 参数指定自定义输出目录\n');
  
  const params = {
    
    queryParams: {
      // 脑力与思维
      subjectId: 1574,
      // 课后测试
      useScene: 'khlx',
      // 一年级 0557 二年级 0558 三年级 0559 四年级 0560
      grade: '0559',
      // 秋季
      quarter: 3,
      // 每页300条
      pageSize: 300
    },
  }
  
  runBatchPDFGeneration(params)
    .then(result => {
      console.log('\n🎉 任务完成!');
      console.log(`   总计: ${result.total} 个任务`);
      console.log(`   成功: ${result.success} 个`);
      console.log(`   失败: ${result.failed} 个`);
      console.log(`   耗时: ${(result.duration / 1000).toFixed(2)} 秒`);
    })
    .catch(error => {
      console.error('❌ 执行失败:', error.message);
      process.exit(1);
    });
}

// 导出方法供其他文件调用
module.exports = { runBatchPDFGeneration };
```

**功能说明：**
- 作为npm包的API入口点
- 提供`runBatchPDFGeneration`函数的导出
- 支持直接运行（使用默认配置）
- 支持作为模块被其他项目引用

### 2. lib/batchProcessor.js - 批量处理核心逻辑

这是整个工具的核心文件，负责协调整个批量下载流程：

```javascript
const { processIframeAndGeneratePDF } = require('./iframeProcessor');
const { getPapersList, createLinkArr } = require('./request');
const logger = require('./logger');

/**
 * 批量PDF生成任务
 * @param {Object} options - 配置选项
 * @param {string} options.cookie - Cookie字符串
 * @param {Object} options.queryParams - 查询参数
 * @param {number} options.queryParams.subjectId - 科目ID（默认：1574）
 * @param {string} options.queryParams.useScene - 使用场景（默认：'khlx'）
 * @param {string} options.queryParams.grade - 年级（默认：'0557'）
 * @param {number} options.queryParams.quarter - 学期（默认：3）
 * @param {string} options.downloadSelector - 下载按钮选择器
 * @param {string} options.printSelector - 打印按钮选择器
 * @param {string} options.textSelector - 文本选择器
 * @param {string} options.checkboxSelector - 复选框选择器
 * @param {Array} options.checkboxIndexes - 复选框索引数组
 * @param {string} options.outputDir - 输出目录
 * @returns {Promise<Object>} 返回执行结果统计
 */
async function runBatchPDFGeneration(options = {}) {
  const startTime = Date.now();
  let successCount = 0;
  let failedCount = 0;
  const failedLinks = [];
  
  // 默认配置
  const defaultOptions = {
    queryParams: {
      subjectId: 1574,
      useScene: 'khlx',
      grade: '0557',
      quarter: 3
    },
    downloadSelector: '#app .source_main_box .title .title-right .top-name-div .print-btn',
    printSelector: '.down-info .down-info-btn .print-btn',
    textSelector: '.x-text',
    checkboxSelector: '.down-type-container-info .el-checkbox',
    checkboxIndexes: [1, 2],
    outputDir: ''
  };

  // 合并配置
  const config = { ...defaultOptions, ...options };
  const { cookie, queryParams, ...otherOptions } = config;
  
  logger.info('开始批量PDF生成任务', { 
    startTime: new Date().toISOString(),
    config: {
      ...config,
      cookie: cookie ? '***已设置***' : '未设置'
    }
  });

  try {
    // 1. 获取试卷列表
    logger.info('正在获取试卷列表...');
    const papersList = await getPapersList(queryParams, cookie);
    logger.info(`成功获取到 ${papersList.length} 个试卷`);

    // 2. 创建下载链接数组
    const linkArr = createLinkArr(papersList);
    logger.info(`创建了 ${linkArr.length} 个下载链接`);

    // 3. 批量处理PDF生成
    logger.info('开始批量处理PDF生成...');
    
    for (let i = 0; i < linkArr.length; i++) {
      const link = linkArr[i];
      const index = i + 1;
      
      logger.info(`处理第 ${index}/${linkArr.length} 个链接`, { 
        url: link.url,
        title: link.title 
      });

      try {
        await processIframeAndGeneratePDF({
          ...link,
          ...otherOptions,
          index
        });
        
        successCount++;
        logger.success(`第 ${index} 个链接处理成功`, { url: link.url });
        
      } catch (error) {
        failedCount++;
        failedLinks.push({
          index,
          url: link.url,
          title: link.title,
          error: error.message
        });
        logger.error(`第 ${index} 个链接处理失败`, { 
          url: link.url,
          error: error.message 
        });
      }
      
      // 添加延迟避免请求过于频繁
      if (i < linkArr.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // 4. 生成执行结果
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    const result = {
      total: linkArr.length,
      success: successCount,
      failed: failedCount,
      duration,
      failedLinks,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString()
    };

    logger.info('批量PDF生成任务完成', result);
    return result;

  } catch (error) {
    logger.error('批量PDF生成任务失败', { error: error.message });
    throw error;
  }
}

module.exports = { runBatchPDFGeneration };
```

**功能说明：**
- 协调整个批量下载流程
- 管理试卷列表获取和链接创建
- 控制并发处理和错误处理
- 生成详细的执行报告和统计信息

### 3. lib/pdfGenerator.js - PDF生成核心逻辑

负责单个PDF文件的生成，包括页面操作和PDF导出：

```javascript
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const { getBrowserOptions, getPlatformInfo } = require('./browserConfig');
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 生成PDF文件的方法
 * @param {Object} options - 配置选项
 * @param {string} options.url - 要访问的URL
 * @param {Array} options.cookies - Cookie数组
 * @param {string} options.textSelector - 用于生成文件名的文本选择器
 * @param {string} options.checkboxSelector - 复选框选择器
 * @param {Array} options.checkboxIndexes - 要点击的复选框索引数组
 * @param {string} options.outputDir - 输出目录
 * @param {boolean} options.headless - 是否无头模式
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
    headless = false
  } = options;

  // 参数验证
  if (!url) {
    const error = new Error('URL参数是必需的');
    logger.error('generatePDF参数验证失败', { error: error.message });
    throw error;
  }

  // 确保输出目录存在并格式化路径
  if (outputDir) {
    let normalizedOutputDir = path.normalize(outputDir);
    if (!normalizedOutputDir.endsWith(path.sep)) {
      normalizedOutputDir += path.sep;
    }
    
    if (!fs.existsSync(normalizedOutputDir)) {
      fs.mkdirSync(normalizedOutputDir, { recursive: true });
      logger.info('创建输出目录', { outputDir: normalizedOutputDir });
    }
    
    outputDir = normalizedOutputDir;
  }

  logger.info('开始PDF生成流程', { url, textSelector, checkboxSelector, checkboxIndexes });

  let browser;
  try {
    // 启动浏览器
    logger.info('启动浏览器');
    
    // 获取跨平台浏览器配置
    const browserOptions = getBrowserOptions({ headless });
    const platformInfo = getPlatformInfo();
    
    // 记录浏览器配置信息
    logger.info('浏览器配置', { 
      platform: platformInfo.platform,
      arch: platformInfo.arch,
      executablePath: browserOptions.executablePath || '使用默认路径',
      headless: browserOptions.headless,
      chromeAvailable: platformInfo.chromeAvailable
    });
    
    browser = await puppeteer.launch(browserOptions);
    logger.success('浏览器启动成功');

    const page = await browser.newPage();
    
    // 设置Cookie
    if (cookies && cookies.length > 0) {
      logger.info('设置Cookie', { count: cookies.length });
      await page.setCookie(...cookies);
    }

    // 访问页面
    logger.info('访问页面', { url });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // 等待页面加载
    await sleep(2000);
    
    // 查找文本元素
    const textElement = await page.$(textSelector);
    if (!textElement) {
      throw new Error(`未找到文本元素: ${textSelector}`);
    }
    
    // 获取文件名
    const fileName = await textElement.evaluate(el => el.textContent.trim());
    logger.info('获取到文件名', { fileName });
    
    // 查找复选框
    const checkboxes = await page.$$(checkboxSelector);
    if (checkboxes.length === 0) {
      throw new Error(`未找到复选框: ${checkboxSelector}`);
    }
    
    logger.info('找到复选框', { count: checkboxes.length });
    
    // 生成第一个PDF（不包含答案）
    const result = { files: [] };
    
    try {
      // 取消选择所有复选框
      for (let i = 0; i < checkboxes.length; i++) {
        const isChecked = await checkboxes[i].evaluate(el => el.checked);
        if (isChecked) {
          await checkboxes[i].click();
          await sleep(500);
        }
      }
      
      // 生成PDF
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
      logger.error('生成第一个PDF失败', { error: error.message });
    }
    
    // 生成第二个PDF（包含答案）
    if (checkboxIndexes.length > 0) {
      try {
        // 选择指定的复选框
        for (const index of checkboxIndexes) {
          if (index <= checkboxes.length) {
            const checkbox = checkboxes[index - 1];
            const isChecked = await checkbox.evaluate(el => el.checked);
            if (!isChecked) {
              await checkbox.click();
              await sleep(500);
            }
          }
        }
        
        // 等待页面更新
        await sleep(1000);
        
        // 生成包含答案的PDF
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
        logger.warn('未找到答案复选框，跳过答案PDF生成');
      }
    }
    
    logger.success('PDF生成完成', { 
      fileName, 
      files: result.files.length,
      totalSize: result.files.reduce((sum, file) => sum + fs.statSync(file).size, 0)
    });
    
    return result;
    
  } catch (error) {
    logger.error('PDF生成失败', { error: error.message, url });
    throw error;
  } finally {
    if (browser) {
      await browser.close();
      logger.info('浏览器已关闭');
    }
  }
}

module.exports = { generatePDF };
```

**功能说明：**
- 启动和管理Puppeteer浏览器实例
- 处理页面交互（点击复选框）
- 生成PDF文件（包含答案和不包含答案两个版本）
- 跨平台路径处理
- 错误处理和资源清理

### 4. lib/browserConfig.js - 跨平台浏览器配置

提供跨平台的浏览器配置和路径检测：

```javascript
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
```

**功能说明：**
- 跨平台Chrome路径检测（Windows、macOS、Linux）
- 浏览器启动配置生成
- 平台信息获取
- Chrome可用性检查

### 5. lib/request.js - HTTP请求处理

负责与API通信，获取试卷列表：

```javascript
const https = require('https');
const logger = require('./logger');

/**
 * 获取试卷列表
 * @param {Object} params - 查询参数
 * @param {string} cookies - Cookie字符串
 * @returns {Promise<Array>} 试卷列表
 */
async function getPapersList(params = {}, cookies) {
  if (!cookies) {
    throw new Error('cookies参数是必需的');
  }

  const queryParams = new URLSearchParams({
    subjectId: params.subjectId || 1574,
    useScene: params.useScene || 'khlx',
    grade: params.grade || '0557',
    quarter: params.quarter || 3,
    pageSize: params.pageSize || 300,
    pageNum: 1
  });

  const url = `https://api.xdf.cn/paper/list?${queryParams.toString()}`;
  
  logger.info('请求试卷列表', { url, params });

  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      headers: {
        'Cookie': cookies,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Referer': 'https://www.xdf.cn/',
        'Origin': 'https://www.xdf.cn'
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.code === 200 && response.data) {
            logger.info('获取试卷列表成功', { count: response.data.length });
            resolve(response.data);
          } else {
            logger.error('获取试卷列表失败', { response });
            reject(new Error(`API返回错误: ${response.message || '未知错误'}`));
          }
        } catch (error) {
          logger.error('解析试卷列表响应失败', { error: error.message, data });
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      logger.error('请求试卷列表失败', { error: error.message });
      reject(error);
    });

    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('请求超时'));
    });

    req.end();
  });
}

/**
 * 创建下载链接数组
 * @param {Array} papersList - 试卷列表
 * @returns {Array} 链接数组
 */
function createLinkArr(papersList) {
  const linkArr = [];
  
  papersList.forEach(paper => {
    if (paper.id && paper.title) {
      linkArr.push({
        id: paper.id,
        title: paper.title,
        url: `https://www.xdf.cn/paper/detail/${paper.id}`
      });
    }
  });
  
  logger.info('创建下载链接数组', { count: linkArr.length });
  return linkArr;
}

module.exports = { getPapersList, createLinkArr };
```

**功能说明：**
- 与XDF API通信获取试卷列表
- 处理HTTP请求和响应
- 解析JSON数据
- 创建下载链接数组

### 6. lib/logger.js - 日志系统

提供统一的日志记录功能：

```javascript
const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.ensureLogDir();
    this.logFile = path.join(this.logDir, `pdf-generator-${this.getDateString()}.log`);
  }

  ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  getDateString() {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  getTimestamp() {
    return new Date().toISOString();
  }

  formatMessage(level, message, data = {}) {
    const timestamp = this.getTimestamp();
    const dataStr = Object.keys(data).length > 0 ? ` ${JSON.stringify(data)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${dataStr}`;
  }

  writeToFile(message) {
    try {
      fs.appendFileSync(this.logFile, message + '\n');
    } catch (error) {
      console.error('写入日志文件失败:', error.message);
    }
  }

  info(message, data = {}) {
    const formattedMessage = this.formatMessage('info', message, data);
    console.log(`ℹ️  ${message}`, data);
    this.writeToFile(formattedMessage);
  }

  success(message, data = {}) {
    const formattedMessage = this.formatMessage('success', message, data);
    console.log(`✅ ${message}`, data);
    this.writeToFile(formattedMessage);
  }

  warn(message, data = {}) {
    const formattedMessage = this.formatMessage('warn', message, data);
    console.warn(`⚠️  ${message}`, data);
    this.writeToFile(formattedMessage);
  }

  error(message, data = {}) {
    const formattedMessage = this.formatMessage('error', message, data);
    console.error(`❌ ${message}`, data);
    this.writeToFile(formattedMessage);
  }

  logPDFSuccess(fileName, filePath, fileSize) {
    const sizeKB = (fileSize / 1024).toFixed(2);
    const message = `PDF生成成功: ${fileName}`;
    const data = { fileName, filePath, fileSize, sizeKB: `${sizeKB}KB` };
    
    const formattedMessage = this.formatMessage('success', message, data);
    console.log(`📄 ${message} (${sizeKB}KB)`);
    this.writeToFile(formattedMessage);
  }
}

module.exports = new Logger();
```

**功能说明：**
- 统一的日志记录接口
- 文件和控制台双重输出
- 不同级别的日志（info、success、warn、error）
- 时间戳和格式化输出

### 7. lib/iframeProcessor.js - iframe处理逻辑

处理包含iframe的复杂页面结构：

```javascript
const puppeteer = require('puppeteer');
const { generatePDF } = require('./pdfGenerator');
const logger = require('./logger');
const { getBrowserOptions, getPlatformInfo } = require('./browserConfig');

/**
 * 处理iframe并生成PDF
 * @param {Object} options - 配置选项
 * @param {string} options.url - 页面URL
 * @param {Array} options.cookies - Cookie数组
 * @param {string} options.textSelector - 文本选择器
 * @param {string} options.checkboxSelector - 复选框选择器
 * @param {Array} options.checkboxIndexes - 复选框索引
 * @param {string} options.outputDir - 输出目录
 * @param {boolean} options.headless - 是否无头模式
 * @param {number} options.index - 任务索引
 * @returns {Promise<Object>} 处理结果
 */
async function processIframeAndGeneratePDF(options) {
  const { 
    url, 
    cookies = [], 
    textSelector = '.x-text', 
    checkboxSelector = '.down-type-container-info .el-checkbox', 
    checkboxIndexes = [1, 2], 
    outputDir = '',
    headless = true,
    index = 0
  } = options;

  logger.info('开始处理iframe和PDF生成', { 
    index, 
    url, 
    textSelector, 
    checkboxSelector 
  });

  let browser;
  try {
    // 启动浏览器 窗口最大化
    logger.info('启动浏览器（iframe处理）');
    
    // 获取跨平台浏览器配置
    const browserOptions = getBrowserOptions({ 
      headless: false,
      args: [
        '--window-size=2800,1200',
        '--start-maximized'
      ]
    });
    const platformInfo = getPlatformInfo();
    
    // 记录浏览器配置信息
    logger.info('浏览器配置（iframe处理）', { 
      platform: platformInfo.platform,
      arch: platformInfo.arch,
      executablePath: browserOptions.executablePath || '使用默认路径',
      chromeAvailable: platformInfo.chromeAvailable
    });
    
    browser = await puppeteer.launch(browserOptions);
    logger.success('浏览器启动成功（iframe处理）');
    const page = await browser.newPage();

    // 设置窗口大小
    await page.setViewport({ width: 1500, height: 1200 });

    // 设置Cookie
    if (cookies && cookies.length > 0) {
      logger.info('设置Cookie（iframe处理）', { count: cookies.length });
      await page.setCookie(...cookies);
    }

    // 访问页面
    logger.info('访问页面（iframe处理）', { url });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // 等待页面加载
    await sleep(3000);

    // 查找iframe
    const iframe = await page.$('iframe');
    if (!iframe) {
      logger.warn('未找到iframe，直接处理页面');
      return await generatePDF({
        url,
        cookies,
        textSelector,
        checkboxSelector,
        checkboxIndexes,
        outputDir,
        headless
      });
    }

    logger.info('找到iframe，开始处理');

    // 获取iframe内容
    const frame = await iframe.contentFrame();
    if (!frame) {
      throw new Error('无法获取iframe内容');
    }

    // 等待iframe内容加载
    await sleep(2000);

    // 在iframe中查找文本元素
    const textElement = await frame.$(textSelector);
    if (!textElement) {
      throw new Error(`在iframe中未找到文本元素: ${textSelector}`);
    }

    // 获取文件名
    const fileName = await textElement.evaluate(el => el.textContent.trim());
    logger.info('获取到文件名（iframe）', { fileName });

    // 在iframe中查找复选框
    const checkboxes = await frame.$$(checkboxSelector);
    if (checkboxes.length === 0) {
      throw new Error(`在iframe中未找到复选框: ${checkboxSelector}`);
    }

    logger.info('找到复选框（iframe）', { count: checkboxes.length });

    // 生成PDF
    const result = { files: [] };

    try {
      // 取消选择所有复选框
      for (let i = 0; i < checkboxes.length; i++) {
        const isChecked = await checkboxes[i].evaluate(el => el.checked);
        if (isChecked) {
          await checkboxes[i].click();
          await sleep(500);
        }
      }

      // 生成第一个PDF（不包含答案）
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

      // 生成第二个PDF（包含答案）
      if (checkboxIndexes.length > 0) {
        // 选择指定的复选框
        for (const index of checkboxIndexes) {
          if (index <= checkboxes.length) {
            const checkbox = checkboxes[index - 1];
            const isChecked = await checkbox.evaluate(el => el.checked);
            if (!isChecked) {
              await checkbox.click();
              await sleep(500);
            }
          }
        }

        // 等待页面更新
        await sleep(1000);

        // 生成包含答案的PDF
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
      }

      logger.success('iframe PDF生成完成', { 
        fileName, 
        files: result.files.length,
        totalSize: result.files.reduce((sum, file) => sum + fs.statSync(file).size, 0)
      });

      return result;

    } catch (error) {
      logger.error('iframe PDF生成失败', { error: error.message });
      throw error;
    }

  } catch (error) {
    logger.error('iframe处理失败', { error: error.message, url });
    throw error;
  } finally {
    if (browser) {
      await browser.close();
      logger.info('浏览器已关闭（iframe处理）');
    }
  }
}

module.exports = { processIframeAndGeneratePDF };
```

**功能说明：**
- 处理包含iframe的复杂页面
- 在iframe内部查找和操作元素
- 处理跨框架的DOM操作
- 生成PDF文件

### 8. lib/logRunSummary.js - 运行总结

生成运行结果的总结报告：

```javascript
const logger = require('./logger');

/**
 * 记录运行总结
 * @param {Object} result - 运行结果
 */
function logRunSummary(result) {
  const { total, success, failed, duration, results } = result;
  
  logger.info('=== 运行总结 ===');
  logger.info(`总任务数: ${total}`);
  logger.info(`成功: ${success}`);
  logger.info(`失败: ${failed}`);
  logger.info(`成功率: ${((success / total) * 100).toFixed(2)}%`);
  logger.info(`总耗时: ${(duration / 1000).toFixed(2)} 秒`);
  
  if (failed > 0) {
    logger.warn('失败的任务:');
    results.filter(r => !r.success).forEach(r => {
      logger.warn(`  ${r.index}. ${r.url} - ${r.error}`);
    });
  }
  
  logger.info('=== 总结结束 ===');
}

module.exports = { logRunSummary };
```

**功能说明：**
- 生成运行结果统计
- 计算成功率和耗时
- 记录失败任务详情


## 📊 lib目录架构总结

lib目录的代码架构遵循以下设计原则：

### 🏗️ 架构设计原则

1. **模块化设计**: 每个文件负责特定功能
2. **跨平台兼容**: 支持Windows、macOS、Linux
3. **错误处理**: 完善的错误捕获和处理机制
4. **日志记录**: 统一的日志系统
5. **配置管理**: 灵活的配置选项
6. **资源管理**: 自动清理浏览器资源

### 📁 文件依赖关系

```
lib/index.js (入口)
    ↓
lib/batchProcessor.js (核心协调)
    ↓
lib/iframeProcessor.js (iframe处理)
    ↓
lib/pdfGenerator.js (PDF生成)
    ↓
lib/browserConfig.js (浏览器配置)
    ↓
lib/request.js (HTTP请求)
    ↓
lib/logger.js (日志系统)
```

### 🔄 执行流程

1. **入口**: `lib/index.js` 作为API入口点
2. **协调**: `lib/batchProcessor.js` 协调整个流程
3. **数据获取**: `lib/request.js` 获取试卷列表
4. **页面处理**: `lib/iframeProcessor.js` 处理复杂页面
5. **PDF生成**: `lib/pdfGenerator.js` 生成PDF文件
6. **浏览器管理**: `lib/browserConfig.js` 管理浏览器配置
7. **日志记录**: `lib/logger.js` 记录所有操作
8. **结果总结**: `lib/logRunSummary.js` 生成运行报告

### 🎯 核心特性

- **跨平台支持**: 自动检测Chrome路径
- **错误恢复**: 单个任务失败不影响整体流程
- **资源管理**: 自动清理浏览器实例
- **详细日志**: 完整的操作记录
- **灵活配置**: 支持多种参数配置
- **批量处理**: 高效的并发处理机制

这个架构确保了代码的可维护性、可扩展性和跨平台兼容性，为用户提供了稳定可靠的PDF批量下载服务。








