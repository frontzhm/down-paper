const { processIframeAndGeneratePDF } = require('./iframeProcessor');
const { getPapersList, createLinkArr } = require('./request');
const logger = require('./logger');

async function run() {
  const startTime = Date.now();
  let successCount = 0;
  let failedCount = 0;
  const failedLinks = [];
  
  logger.info('开始批量PDF生成任务', { 
    startTime: new Date().toISOString()
  });
  
  // 配置cookies字符串
  const cookie = 'gr_user_id=f5bbcce9-7b86-48d5-b270-67c04aaa6621; XDFUUID=db0b0bd2-6407-b293-514e-fc4984c6c284; email=zhanghuimin61%40xdf.cn; nickname=%E5%BC%A0%E6%85%A7%E6%95%8F; staffToken=emhhbmdodWltaW42MWVmMjEwYjJlLTM0Y2YtNDcxZS1hZDU3LTIzZTYyOWUyNzJjMw==; jsessionid=227c68cc-95fe-42c3-a0cb-92dda0fcb18e; rem=on; e2e=DCB2A892933AF3582BA5A72F10828894; e2mf=068a62e2555c4d62b08d3603302acfe8; wpsUserInfo={%22useId%22:%22408aea3f921d4edf9e14dcacf3537bf6%22%2C%22nickName%22:%22%E5%88%98%E4%B8%B9%E5%A6%AE%22%2C%22name%22:%22%E5%88%98%E4%B8%B9%E5%A6%AE%22%2C%22email%22:%22liudanni7@xdf.cn%22}; ac5caea5d6c36013_gr_session_id=66842db4-b247-42a1-842d-6eb9cbf90187; ac5caea5d6c36013_gr_session_id_sent_vst=66842db4-b247-42a1-842d-6eb9cbf90187';
  
  try {
    // 动态获取试卷列表并生成链接
    logger.info('开始获取试卷列表');
    const papersData = await getPapersList({
      // 脑力与思维
      subjectId: 1574,
      // 课后测试
      useScene: 'khlx',
      // 一年级 0557 二年级 0558 三年级 0559 四年级 0560
      grade: '0558',
      // 秋季
      quarter: 3,
      // 每页300条
      pageSize: 300
    }, cookie);
    
    const linkArr = createLinkArr(papersData);
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
          cookies: cookie,
          downloadSelector: '#app .source_main_box .title .title-right .top-name-div .print-btn',
          printSelector: '.down-info .down-info-btn .print-btn',
          textSelector: '.x-text',
          checkboxSelector: '.down-type-container-info .el-checkbox',
          checkboxIndexes: [1, 2],
          outputDir: ''
        };

        // 调用方法处理iframe并生成PDF
        const result = await processIframeAndGeneratePDF(options);
        
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
    
    logger.success('批量PDF生成任务完成', {
      total: linkArr.length,
      success: successCount,
      failed: failedCount,
      duration: `${(duration / 1000).toFixed(2)}秒`
    });

  } catch (error) {
    logger.error('批量PDF生成任务执行失败', { 
      error: error.message, 
      stack: error.stack,
      successCount,
      failedCount 
    });
  }
}

run();

