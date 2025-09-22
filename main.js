/**
 * 批量下载试卷PDF工具 - 主入口文件
 * 
 * 这个文件提供了两种使用方式：
 * 1. 作为CLI工具直接运行
 * 2. 作为模块被其他文件引用
 */

const { runBatchPDFGeneration } = require('./lib/batchProcessor');
const path = require('path');

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
        console.log(require('./package.json').version);
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
  node main.js [选项]

选项:
  -c, --cookie <string>        Cookie字符串 (必需)
  -s, --subject-id <number>    科目ID (默认: 1574)
  -g, --grade <string>         年级 (默认: 0557)
  -q, --quarter <number>       学期 (默认: 3)
  -u, --use-scene <string>     使用场景 (默认: khlx)
  -o, --output-dir <string>    输出目录 (默认: ./download)
  --headless                   使用无头模式运行浏览器 (适合服务器环境)
  -h, --help                   显示帮助信息
  -v, --version                显示版本号

示例:
  # 基本用法
  node main.js --cookie "your-cookie-string"

  # 指定年级
  node main.js --cookie "your-cookie-string" --grade "0556"

  # 指定所有参数
  node main.js --cookie "your-cookie-string" --subject-id 1574 --grade "0557" --quarter 3 --use-scene "khlx" --output-dir "./downloads"
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

// 如果直接运行此文件，则执行主函数
if (require.main === module) {
  const options = parseArgs();
  
  // 如果没有提供任何参数，直接显示帮助信息
  if (process.argv.length === 2) {
    showHelp();
    process.exit(0);
  }
  
  console.log('🚀 批量下载试卷PDF工具');
  
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
    outputDir: options.outputDir || path.resolve('./download'),
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
  
  runBatchPDFGeneration(config)
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


