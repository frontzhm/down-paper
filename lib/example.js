const { runBatchPDFGeneration } = require('./batchProcessor');

/**
 * 使用示例：调用批量PDF生成方法
 */
async function example() {
  try {
    console.log('🚀 开始调用批量PDF生成方法...\n');

    // 示例1: 使用默认配置
    console.log('=== 示例1: 使用默认配置 ===');
    const result1 = await runBatchPDFGeneration();
    console.log('默认配置执行结果:', result1);

    console.log('\n' + '='.repeat(50) + '\n');

    // 示例2: 自定义配置 - 二年级
    console.log('=== 示例2: 自定义配置 - 二年级 ===');
    const result2 = await runBatchPDFGeneration({
      queryParams: {
        subjectId: 1574,
        useScene: 'khlx',
        grade: '0558',  // 二年级
        quarter: 3
      }
    });
    console.log('二年级执行结果:', result2);

    console.log('\n' + '='.repeat(50) + '\n');

    // 示例3: 自定义配置 - 三年级
    console.log('=== 示例3: 自定义配置 - 三年级 ===');
    const result3 = await runBatchPDFGeneration({
      queryParams: {
        subjectId: 1574,
        useScene: 'khlx',
        grade: '0559',  // 三年级
        quarter: 3
      },
      outputDir: './output/',  // 自定义输出目录
      checkboxIndexes: [0, 1]  // 自定义复选框索引
    });
    console.log('三年级执行结果:', result3);

  } catch (error) {
    console.error('❌ 执行失败:', error.message);
  }
}

// 运行示例
if (require.main === module) {
  example();
}

module.exports = { example };
