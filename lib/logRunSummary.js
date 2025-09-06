/**
 * 运行完成统计方法
 * 用于记录批量PDF生成任务的完成统计信息
 * 
 * @param {number} total - 总任务数
 * @param {number} success - 成功任务数
 * @param {number} failed - 失败任务数
 * @param {number} duration - 总耗时（毫秒）
 */
function logRunSummary(total, success, failed, duration) {
  // 计算成功率
  const successRate = ((success / total) * 100).toFixed(2);
  
  // 计算耗时（秒）
  const durationSeconds = (duration / 1000).toFixed(2);
  
  // 记录统计信息
  console.log(`\n📊 运行完成统计:`);
  console.log(`   总任务数: ${total}`);
  console.log(`   成功任务: ${success}`);
  console.log(`   失败任务: ${failed}`);
  console.log(`   成功率: ${successRate}%`);
  console.log(`   总耗时: ${durationSeconds}秒`);
  
  // 返回统计对象
  return {
    total,
    success,
    failed,
    successRate: `${successRate}%`,
    duration: `${durationSeconds}秒`
  };
}

// 使用示例
if (require.main === module) {
  // 测试示例
  const stats = logRunSummary(12, 10, 2, 125670);
  console.log('\n返回的统计对象:', stats);
}

module.exports = { logRunSummary };
