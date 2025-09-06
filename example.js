const { generatePDF } = require('./pdfGenerator');

async function run() {
  try {
    // 配置选项
    const options = {
      url: 'https://tiji.xdf.cn/downloadPreView?tenantId=1001&subject=%5Bobject%20Object%5D&jwSubject=1574&stage=2&businessId=CL2ffcf14ad3984eab801a695dfc80dde7&pageSource=PaperCenter',
      cookies: [
        { name: 'gr_user_id', value: 'f5bbcce9-7b86-48d5-b270-67c04aaa6621', domain: '.xdf.cn' },
        { name: 'XDFUUID', value: 'db0b0bd2-6407-b293-514e-fc4984c6c284', domain: '.xdf.cn' },
        { name: 'email', value: 'zhanghuimin61%40xdf.cn', domain: '.xdf.cn' },
        { name: 'nickname', value: '%E5%BC%A0%E6%85%A7%E6%95%8F', domain: '.xdf.cn' },
        { name: 'staffToken', value: 'emhhbmdodWltaW42MWVmMjEwYjJlLTM0Y2YtNDcxZS1hZDU3LTIzZTYyOWUyNzJjMw==', domain: '.xdf.cn' },
        { name: 'jsessionid', value: '227c68cc-95fe-42c3-a0cb-92dda0fcb18e', domain: '.xdf.cn' },
        { name: 'rem', value: 'on', domain: '.xdf.cn' },
        { name: 'e2e', value: 'DCB2A892933AF3582BA5A72F10828894', domain: '.xdf.cn' },
        { name: 'e2mf', value: '068a62e2555c4d62b08d3603302acfe8', domain: '.xdf.cn' },
        { name: 'ac5caea5d6c36013_gr_session_id', value: 'edcf5031-19c4-4a1f-8b20-48e16f578f36', domain: '.xdf.cn' },
        { name: 'ac5caea5d6c36013_gr_session_id_sent_vst', value: 'edcf5031-19c4-4a1f-8b20-48e16f578f36', domain: '.xdf.cn' },
        { name: 'wpsUserInfo', value: '{%22useId%22:%22408aea3f921d4edf9e14dcacf3537bf6%22%2C%22nickName%22:%22%E5%88%98%E4%B8%B9%E5%A6%AE%22%2C%22name%22:%22%E5%88%98%E4%B8%B9%E5%A6%AE%22%2C%22email%22:%22liudanni7@xdf.cn%22}', domain: '.xdf.cn' }
      ],
      textSelector: '.x-text',
      checkboxSelector: '.el-checkbox',
      checkboxIndexes: [1, 2], // 点击第二个和第三个复选框
      outputDir: '' 
    };

    // 调用方法生成PDF
    const result = await generatePDF(options);
    
    console.log('🎉 PDF生成完成！');
    console.log('生成的文件:', result.files);
    console.log('文件名:', result.fileName);

  } catch (error) {
    console.error('❌ 执行失败:', error.message);
  }
}

run();
