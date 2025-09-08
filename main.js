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
    cookie: 'gr_user_id=f5bbcce9-7b86-48d5-b270-67c04aaa6621; XDFUUID=db0b0bd2-6407-b293-514e-fc4984c6c284; staffToken=emhhbmdodWltaW42MWVmMjEwYjJlLTM0Y2YtNDcxZS1hZDU3LTIzZTYyOWUyNzJjMw==; email=zhanghuimin61%40xdf.cn; nickname=%E5%BC%A0%E6%85%A7%E6%95%8F; jsessionid=0c7df911-f2cf-48e5-9000-2b2b779c0ac3; ac5caea5d6c36013_gr_session_id=36958070-d6b0-48f4-b5aa-8d1a46d98f5a; ac5caea5d6c36013_gr_session_id_sent_vst=36958070-d6b0-48f4-b5aa-8d1a46d98f5a; rem=on; e2e=DCB2A892933AF3582BA5A72F10828894; e2mf=acb00e0e73d4453fbd2b7b529035899f; wpsUserInfo={%22useId%22:%22408aea3f921d4edf9e14dcacf3537bf6%22%2C%22nickName%22:%22%E5%88%98%E4%B8%B9%E5%A6%AE%22%2C%22name%22:%22%E5%88%98%E4%B8%B9%E5%A6%AE%22%2C%22email%22:%22liudanni7@xdf.cn%22}',
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


