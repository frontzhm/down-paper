const path = require('path');
const fs = require('fs');

// 测试跨平台路径兼容性
function testCrossPlatformPaths() {
  console.log('🧪 测试跨平台路径兼容性...\n');
  
  // 测试不同的路径格式
  const testPaths = [
    './test-output',
    './test-output/',
    'test-output',
    'test-output/',
    './test-output\\',  // Windows 风格
    'test-output\\',    // Windows 风格
    './test-output/subdir',
    './test-output/subdir/',
    './test-output\\subdir',  // Windows 风格
    './test-output\\subdir\\' // Windows 风格
  ];
  
  console.log('当前平台:', process.platform);
  console.log('路径分隔符:', path.sep);
  console.log('');
  
  testPaths.forEach((testPath, index) => {
    console.log(`测试 ${index + 1}: "${testPath}"`);
    
    try {
      // 模拟 pdfGenerator.js 中的路径处理逻辑
      let normalizedPath = path.normalize(testPath);
      if (!normalizedPath.endsWith(path.sep)) {
        normalizedPath += path.sep;
      }
      console.log(`  标准化后: "${normalizedPath}"`);
      
      // 测试路径解析
      const resolvedPath = path.resolve(normalizedPath);
      console.log(`  解析后: "${resolvedPath}"`);
      
      // 测试目录创建（不实际创建）
      const dirName = path.dirname(normalizedPath);
      console.log(`  目录名: "${dirName}"`);
      
      console.log('  ✅ 路径处理正常\n');
      
    } catch (error) {
      console.log(`  ❌ 路径处理失败: ${error.message}\n`);
    }
  });
  
  // 测试文件路径拼接
  console.log('📁 测试文件路径拼接:');
  const outputDir = './test-output/';
  const fileName = 'test-file';
  
  const filePath1 = path.join(outputDir, `${fileName}.pdf`);
  const filePath2 = path.join(outputDir, `${fileName}-答案.pdf`);
  
  console.log(`  文件1: "${filePath1}"`);
  console.log(`  文件2: "${filePath2}"`);
  console.log('  ✅ 文件路径拼接正常\n');
  
  // 测试实际目录创建和清理
  console.log('🗂️  测试实际目录操作:');
  const testDir = './cross-platform-test/';
  let normalizedTestDir = path.normalize(testDir);
  if (!normalizedTestDir.endsWith(path.sep)) {
    normalizedTestDir += path.sep;
  }
  
  try {
    if (!fs.existsSync(normalizedTestDir)) {
      fs.mkdirSync(normalizedTestDir, { recursive: true });
      console.log(`  ✅ 目录创建成功: "${normalizedTestDir}"`);
    }
    
    // 创建测试文件
    const testFile = path.join(normalizedTestDir, 'test.txt');
    fs.writeFileSync(testFile, 'test content');
    console.log(`  ✅ 文件创建成功: "${testFile}"`);
    
    // 清理
    fs.rmSync(normalizedTestDir, { recursive: true, force: true });
    console.log('  🧹 测试目录已清理');
    
  } catch (error) {
    console.log(`  ❌ 目录操作失败: ${error.message}`);
  }
}

testCrossPlatformPaths();
