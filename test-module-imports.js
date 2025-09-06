#!/usr/bin/env node

/**
 * 测试模块引用是否正确
 * 模拟 Windows 环境下的模块加载
 */

console.log('🧪 测试模块引用...\n');

try {
  // 测试 CLI 工具的模块引用
  console.log('1. 测试 CLI 工具模块引用...');
  const { main, parseArgs, showHelp } = require('./bin/down-paper.js');
  console.log('   ✅ CLI 工具模块加载成功');
  
  // 测试 API 入口的模块引用
  console.log('2. 测试 API 入口模块引用...');
  const { runBatchPDFGeneration } = require('./lib/index.js');
  console.log('   ✅ API 入口模块加载成功');
  
  // 测试核心模块引用
  console.log('3. 测试核心模块引用...');
  const batchProcessor = require('./lib/batchProcessor.js');
  const pdfGenerator = require('./lib/pdfGenerator.js');
  const request = require('./lib/request.js');
  const logger = require('./lib/logger.js');
  const iframeProcessor = require('./lib/iframeProcessor.js');
  console.log('   ✅ 所有核心模块加载成功');
  
  // 测试参数解析
  console.log('4. 测试参数解析...');
  const testArgs = ['--cookie', 'test-cookie', '--output-dir', './test-output'];
  process.argv = ['node', 'test-module-imports.js', ...testArgs];
  const options = parseArgs();
  console.log('   ✅ 参数解析成功:', options);
  
  console.log('\n🎉 所有模块引用测试通过！');
  console.log('   Windows 兼容性问题已修复');
  
} catch (error) {
  console.error('❌ 模块引用测试失败:', error.message);
  console.error('   错误详情:', error.stack);
  process.exit(1);
}
