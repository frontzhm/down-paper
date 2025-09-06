/**
 * 批量下载试卷PDF工具 - API接口
 * 
 * 这个模块提供了批量下载试卷PDF的编程接口
 * 支持通过函数调用的方式使用所有功能
 */

const { runBatchPDFGeneration } = require('./batchProcessor');
const { getPapersList, createLinkArr } = require('./request');
const { processIframeAndGeneratePDF } = require('./iframeProcessor');
const { generatePDF } = require('./pdfGenerator');
const logger = require('./logger');

/**
 * 批量生成PDF文件
 * @param {Object} options - 配置选项
 * @param {string} options.cookie - Cookie字符串 (必需)
 * @param {Object} options.queryParams - 查询参数
 * @param {number} options.queryParams.subjectId - 科目ID (默认: 1574)
 * @param {string} options.queryParams.useScene - 使用场景 (默认: 'khlx')
 * @param {string} options.queryParams.grade - 年级 (默认: '0557')
 * @param {number} options.queryParams.quarter - 学期 (默认: 3)
 * @param {string} options.downloadSelector - 下载按钮选择器
 * @param {string} options.printSelector - 打印按钮选择器
 * @param {string} options.textSelector - 文本选择器
 * @param {string} options.checkboxSelector - 复选框选择器
 * @param {Array} options.checkboxIndexes - 复选框索引数组
 * @param {string} options.outputDir - 输出目录
 * @returns {Promise<Object>} 返回执行结果统计
 * 
 * @example
 * const downPaper = require('down-paper');
 * 
 * const result = await downPaper.generateBatchPDFs({
 *   cookie: 'your-cookie-string',
 *   queryParams: {
 *     subjectId: 1574,
 *     grade: '0557',
 *     quarter: 3
 *   },
 *   outputDir: './downloads'
 * });
 */
async function generateBatchPDFs(options) {
  return await runBatchPDFGeneration(options);
}

/**
 * 获取试卷列表
 * @param {Object} params - 查询参数
 * @param {string} cookies - Cookie字符串
 * @returns {Promise<Array>} 返回试卷列表数据
 * 
 * @example
 * const papers = await downPaper.getPapersList({
 *   subjectId: 1574,
 *   grade: '0557'
 * }, 'your-cookie-string');
 */
async function getPapers(params, cookies) {
  return await getPapersList(params, cookies);
}

/**
 * 从试卷数据生成链接数组
 * @param {Array} papersData - 试卷数据数组
 * @returns {Array} 返回链接数组
 * 
 * @example
 * const links = downPaper.createLinks(papersData);
 */
function createLinks(papersData) {
  return createLinkArr(papersData);
}

/**
 * 处理单个iframe并生成PDF
 * @param {Object} options - 配置选项
 * @param {string} options.url - 要处理的URL
 * @param {string} options.cookies - Cookie字符串
 * @param {string} options.outputDir - 输出目录
 * @returns {Promise<Object>} 返回处理结果
 * 
 * @example
 * const result = await downPaper.processSinglePDF({
 *   url: 'https://example.com/paper',
 *   cookies: 'your-cookie-string',
 *   outputDir: './downloads'
 * });
 */
async function processSinglePDF(options) {
  return await processIframeAndGeneratePDF(options);
}

/**
 * 生成单个PDF文件
 * @param {Object} options - 配置选项
 * @param {string} options.url - 要访问的URL
 * @param {Array} options.cookies - Cookie数组
 * @param {string} options.outputDir - 输出目录
 * @returns {Promise<Object>} 返回生成结果
 * 
 * @example
 * const result = await downPaper.generatePDF({
 *   url: 'https://example.com/paper',
 *   cookies: cookieArray,
 *   outputDir: './downloads'
 * });
 */
async function generateSinglePDF(options) {
  return await generatePDF(options);
}

/**
 * 获取日志记录器
 * @returns {Object} 返回日志记录器实例
 * 
 * @example
 * const logger = downPaper.getLogger();
 * logger.info('开始处理');
 */
function getLogger() {
  return logger;
}

// 导出所有API
module.exports = {
  // 主要功能
  generateBatchPDFs,
  getPapers,
  createLinks,
  processSinglePDF,
  generateSinglePDF,
  
  // 工具函数
  getLogger,
  
  // 版本信息
  version: require('../package.json').version
};
