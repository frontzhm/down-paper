const { generatePDF } = require('./src/pdfGenerator');
const path = require('path');

// 测试 outputDir 功能
async function testOutputDir() {
  console.log('🧪 测试 outputDir 功能...\n');
  
  const testOutputDir = './test-output/';
  
  try {
    // 测试创建目录功能
    console.log('1. 测试目录创建功能');
    const result = await generatePDF({
      url: 'https://example.com/test',
      cookies: [],
      outputDir: testOutputDir
    });
    
    console.log('✅ 目录创建测试完成');
    console.log('结果:', result);
    
  } catch (error) {
    console.log('❌ 测试失败（这是预期的，因为URL无效）');
    console.log('错误信息:', error.message);
    
    // 检查目录是否被创建
    const fs = require('fs');
    if (fs.existsSync(testOutputDir)) {
      console.log('✅ 输出目录已成功创建:', testOutputDir);
      
      // 清理测试目录
      fs.rmSync(testOutputDir, { recursive: true, force: true });
      console.log('🧹 测试目录已清理');
    } else {
      console.log('❌ 输出目录未被创建');
    }
  }
}

// 运行测试
testOutputDir();
