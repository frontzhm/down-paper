/**
 * 批量下载试卷PDF工具 - 主入口文件
 * 
 * 这个文件提供了两种使用方式：
 * 1. 作为CLI工具直接运行
 * 2. 作为模块被其他文件引用
 */

const { runBatchPDFGeneration } = require('./src/batchProcessor');

// 如果直接运行此文件，则执行默认配置
if (require.main === module) {
  console.log('🚀 批量下载试卷PDF工具');
  console.log('📝 使用默认配置运行...\n');
  
  const params = {
    cookie: 'c',
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


