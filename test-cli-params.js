const { parseArgs } = require('./bin/down-paper.js');

// 测试CLI参数解析
function testCLIParams() {
  console.log('🧪 测试CLI参数解析...\n');
  
  // 模拟命令行参数
  const testArgs = [
    '--cookie', 'test-cookie',
    '--output-dir', './custom-output',
    '--grade', '0558',
    '--quarter', '1'
  ];
  
  // 临时设置 process.argv
  const originalArgv = process.argv;
  process.argv = ['node', 'down-paper.js', ...testArgs];
  
  try {
    const options = parseArgs();
    console.log('✅ 参数解析成功:');
    console.log('  cookie:', options.cookie);
    console.log('  outputDir:', options.outputDir);
    console.log('  grade:', options.grade);
    console.log('  quarter:', options.quarter);
    
    // 验证 outputDir 参数
    if (options.outputDir === './custom-output') {
      console.log('✅ --output-dir 参数解析正确');
    } else {
      console.log('❌ --output-dir 参数解析错误:', options.outputDir);
    }
    
  } catch (error) {
    console.log('❌ 参数解析失败:', error.message);
  } finally {
    // 恢复原始 argv
    process.argv = originalArgv;
  }
}

testCLIParams();
