const fs = require('fs');
const path = require('path');
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

class Logger {
  constructor() {
    this.logDir = './logs';
    this.ensureLogDir();
    this.logFile = path.join(this.logDir, `pdf-generator-${this.getDateString()}.log`);
  }

  ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  getDateString() {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  getTimestamp() {
    const now = new Date();
    return now.toISOString().replace('T', ' ').substring(0, 19);
  }

  writeLog(level, message, data = null) {
    const timestamp = this.getTimestamp();
    const logEntry = {
      timestamp,
      level,
      message,
      data
    };

    const logLine = `[${timestamp}] [${level}] ${message}${data ? '\n' + JSON.stringify(data, null, 2) : ''}\n`;
    
    // 写入文件
    fs.appendFileSync(this.logFile, logLine);
    
    // 控制台输出
    const consoleMessage = `[${timestamp}] [${level}] ${message}`;
    switch (level) {
      case 'ERROR':
        console.error(consoleMessage);
        if (data) console.error(data);
        break;
      case 'WARN':
        console.warn(consoleMessage);
        if (data) console.warn(data);
        break;
      case 'INFO':
        console.log(consoleMessage);
        if (data) console.log(data);
        break;
      default:
        console.log(consoleMessage);
        if (data) console.log(data);
    }
  }

  info(message, data) {
    this.writeLog('INFO', message, data);
  }

  warn(message, data) {
    this.writeLog('WARN', message, data);
  }

  error(message, data) {
    this.writeLog('ERROR', message, data);
  }

  success(message, data) {
    this.writeLog('SUCCESS', message, data);
  }

  // 记录PDF生成开始
  logPDFStart(url, fileName) {
    this.info(`开始生成PDF`, {
      url,
      fileName,
      timestamp: new Date().toISOString()
    });
  }

  // 记录PDF生成成功
  logPDFSuccess(fileName, filePath, fileSize) {
    this.success(`PDF生成成功`, {
      fileName,
      filePath,
      fileSize: fileSize ? `${(fileSize / 1024).toFixed(2)} KB` : 'unknown'
    });
  }

  // 记录PDF生成失败
  logPDFError(fileName, error, context = {}) {
    this.error(`PDF生成失败`, {
      fileName,
      error: error.message,
      stack: error.stack,
      context
    });
  }

  // 记录链接处理开始
  logLinkStart(index, total, url) {
    this.info(`开始处理链接 ${index}/${total}`, { url });
  }

  // 记录链接处理完成
  logLinkComplete(index, total, result) {
    this.success(`链接处理完成 ${index}/${total}`, {
      fileName: result.fileName,
      files: result.files,
      fileCount: result.files.length
    });
  }

  // 记录链接处理失败
  logLinkError(index, total, url, error) {
    this.error(`链接处理失败 ${index}/${total}`, {
      url,
      error: error.message,
      stack: error.stack
    });
  }

  // 记录整体运行统计
  logRunSummary(total, success, failed, duration) {
    this.info(`运行完成统计`, {
      total,
      success,
      failed,
      successRate: `${((success / total) * 100).toFixed(2)}%`,
      duration: `${(duration / 1000).toFixed(2)}秒`
    });
  }
}

// 创建全局日志实例
const logger = new Logger();

module.exports = logger;
