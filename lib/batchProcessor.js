// const { processIframeAndGeneratePDF } = require('./iframeProcessor');
const { generatePDF } = require('./pdfGenerator');
const { getPapersList, createLinkArrPrint } = require('./request');
const logger = require('./logger');

/**
 * 批量PDF生成任务
 * @param {Object} options - 配置选项
 * @param {string} options.cookie - Cookie字符串
 * @param {Object} options.queryParams - 查询参数
 * @param {number} options.queryParams.subjectId - 科目ID（默认：1574）
 * @param {string} options.queryParams.useScene - 使用场景（默认：'khlx'）
 * @param {string} options.queryParams.grade - 年级（默认：'0557'）
 * @param {number} options.queryParams.quarter - 学期（默认：3）
 * @param {string} options.queryParams.keywords - 关键词搜索（可选）
 * @param {string} options.downloadSelector - 下载按钮选择器
 * @param {string} options.printSelector - 打印按钮选择器
 * @param {string} options.textSelector - 文本选择器
 * @param {string} options.checkboxSelector - 复选框选择器
 * @param {Array} options.checkboxIndexes - 复选框索引数组
 * @param {string} options.outputDir - 输出目录
 * @returns {Promise<Object>} 返回执行结果统计
 */
async function runBatchPDFGeneration(options = {}) {
  const startTime = Date.now();
  let successCount = 0;
  let failedCount = 0;
  const failedLinks = [];
  
  // 默认配置
  const defaultOptions = {
    queryParams: {
      subjectId: 1574,
      useScene: 'khlx',
      grade: '0557',
      quarter: 3,
      keywords: ''
    },
    downloadSelector: '#app .source_main_box .title .title-right .top-name-div .print-btn',
    printSelector: '.down-info .down-info-btn .print-btn',
    textSelector: '.x-text',
    checkboxSelector: '.down-type-container-info .el-checkbox',
    checkboxIndexes: [1, 2],
    outputDir: ''
  };

  // 合并配置
  const config = { ...defaultOptions, ...options };
  const { cookie, queryParams, ...otherOptions } = config;
  
  logger.info('开始批量PDF生成任务', { 
    startTime: new Date().toISOString(),
    config: {
      subjectId: queryParams.subjectId,
      useScene: queryParams.useScene,
      grade: queryParams.grade,
      quarter: queryParams.quarter,
      keywords: queryParams.keywords || ''
    }
  });
  
  try {
    // 动态获取试卷列表并生成链接
    logger.info('开始获取试卷列表');
    const papersData = await getPapersList({
      ...queryParams,
      pageSize: 300
    }, cookie);
    
    const linkArr = createLinkArrPrint(papersData);
    logger.success('试卷列表获取完成', { 
      papersCount: papersData.length,
      linksCount: linkArr.length 
    });

    // 挨个执行linkArr中的每个链接
    for (let i = 0; i < linkArr.length; i++) {
      const url = linkArr[i];
      logger.logLinkStart(i + 1, linkArr.length, url);
      
      try {
        const options = {
          url: url,
          cookie: cookie,
          // ...otherOptions
        };

        // 调用方法处理iframe并生成PDF
        // const result = await processIframeAndGeneratePDF(options);
        const result = await generatePDF(options);
        
        logger.logLinkComplete(i + 1, linkArr.length, result);
        successCount++;
        
      } catch (error) {
        logger.logLinkError(i + 1, linkArr.length, url, error);
        failedCount++;
        failedLinks.push({
          index: i + 1,
          url: url,
          error: error.message
        });
      }
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    logger.logRunSummary(linkArr.length, successCount, failedCount, duration);
    
    if (failedLinks.length > 0) {
      logger.warn('失败的链接详情', { failedLinks });
    }
    
    const result = {
      total: linkArr.length,
      success: successCount,
      failed: failedCount,
      duration: duration,
      failedLinks: failedLinks
    };

    logger.success('批量PDF生成任务完成', {
      total: result.total,
      success: result.success,
      failed: result.failed,
      duration: `${(result.duration / 1000).toFixed(2)}秒`
    });

    return result;

  } catch (error) {
    logger.error('批量PDF生成任务执行失败', { 
      error: error.message, 
      stack: error.stack,
      successCount,
      failedCount 
    });
    
    return {
      total: 0,
      success: successCount,
      failed: failedCount,
      duration: Date.now() - startTime,
      failedLinks: failedLinks,
      error: error.message
    };
  }
}

module.exports = { runBatchPDFGeneration };
