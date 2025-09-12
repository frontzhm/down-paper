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
      case '--keywords':
      case '-k':
        options.keywords = args[++i];
        break;
      case '--output-dir':
      case '-o':
        options.outputDir = args[++i];
        break;
      case '--headless':
      case '-h':
        options.headless = true;
        break;
      case '--no-headless':
        options.headless = false;
        break;
      case '--help':
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

💡 安装提示: 如果安装时遇到Chrome下载问题，请使用:
   PUPPETEER_SKIP_DOWNLOAD=true npm install -g down-paper

用法:
  down-paper [选项]

选项:
  -c, --cookie <string>        Cookie字符串 (必需)
  -s, --subject-id <number>    科目ID (默认: 1574)
  -g, --grade <string>         年级 (默认: 0557)
  -q, --quarter <number>       学期 (默认: 3)
  -u, --use-scene <string>     使用场景 (默认: khlx)
  -k, --keywords <string>      关键词搜索 (可选)
  -o, --output-dir <string>    输出目录 (默认: ./download)
  -h, --headless               使用无头模式运行浏览器 (适合服务器环境)
  --no-headless                显示浏览器窗口 (默认，用于调试)
  --help                       显示帮助信息
  -v, --version                显示版本号

示例:
  # 基本用法（使用默认输出目录）
  down-paper -u "nlcp" -g "0560" -q "4" -c "xxxx"

  # 使用关键词搜索
  down-paper -u "khlx" -g "0557" -q "3" -k "思维" -c "xxxx"

  # 使用无头模式（适合服务器环境）
  down-paper -u "nlcp" -g "0560" -q "4" -c "xxxx" -h
  
  # 显示浏览器窗口（默认，用于调试）
  down-paper -u "nlcp" -g "0560" -q "4" -c "xxxx"

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
    const options = parseArgs();
    
    // 如果没有提供任何参数，直接显示帮助信息
    if (process.argv.length === 2) {
      showHelp();
      return;
    }
    
    console.log('🚀 批量下载试卷PDF工具启动中...\n');
    
    validateOptions(options);
    
    // 构建配置对象
    const config = {
      cookie: options.cookie,
      queryParams: {
        subjectId: options.subjectId || 1574,
        useScene: options.useScene || 'khlx',
        grade: options.grade || '0557',
        quarter: options.quarter || 3,
        keywords: options.keywords || ''
      },
      outputDir: options.outputDir || './download',
      headless: options.headless !== undefined ? options.headless : false
    };
    
    console.log('📋 配置信息:');
    console.log(`   科目ID: ${config.queryParams.subjectId}`);
    console.log(`   年级: ${config.queryParams.grade}`);
    console.log(`   学期: ${config.queryParams.quarter}`);
    console.log(`   使用场景: ${config.queryParams.useScene}`);
    if (config.queryParams.keywords) {
      console.log(`   关键词: ${config.queryParams.keywords}`);
    }
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
