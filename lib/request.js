const https = require('https');
const logger = require('./logger');

/**
 * 使用Node.js原生模块发送HTTP请求
 * @param {string} url - 请求URL
 * @param {Object} options - 请求选项
 * @returns {Promise<Object>} 返回响应数据
 */
async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);

    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'origin': 'https://iteach-cloudwps.xdf.cn',
        'referer': 'https://iteach-cloudwps.xdf.cn/',
        'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        ...options.headers
      }
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          reject(new Error(`JSON解析失败: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

/**
 * 获取试卷列表
 * @param {Object} params - 查询参数
 * @param {string|Array} cookies - Cookie字符串或数组
 * @returns {Promise<Object>} 返回试卷列表数据
 */
async function getPapersList(params = {}, cookies) {
  console.log('getPapersList cookies', cookies);
  const defaultParams = {
    subjectId: 1574,
    useScene: null,
    grade: null,
    quarter: null,
    year: '',
    semester: '',
    useType: '',
    asc: 'time',
    desc: '',
    ownerType: 3,
    schoolId: -1,
    keywords: '',
    pageNo: 1,
    pageSize: 300,
    ...params
  };

  // 构建查询字符串
  const queryString = new URLSearchParams(defaultParams).toString();
  const url = `https://iteach-content-management-api.xdf.cn/api/papers?${queryString}`;

  // 检查cookies参数
  if (!cookies) {
    throw new Error('cookies参数是必需的');
  }

  // 处理cookies参数
  let cookieString;
  let e2mfValue = 'your-e2mf-value-here'; // 默认值

  // 如果传入的是对象数组格式，转换为字符串
  if (Array.isArray(cookies) && cookies.length > 0 && typeof cookies[0] === 'object' && cookies[0].name) {
    cookieString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
    // 从cookies中查找e2mf的值
    const e2mfCookie = cookies.find(cookie => cookie.name === 'e2mf');
    if (e2mfCookie) {
      e2mfValue = e2mfCookie.value;
    }
  } else if (Array.isArray(cookies) && cookies.length > 0) {
    // 如果传入的是字符串数组，直接拼接
    cookieString = cookies.join('; ');
    // 从字符串中提取e2mf的值
    const e2mfMatch = cookieString.match(/e2mf=([^;]+)/);
    if (e2mfMatch) {
      e2mfValue = e2mfMatch[1];
    }
  } else if (typeof cookies === 'string' && cookies.length > 0) {
    // 如果传入的是字符串，直接使用
    cookieString = cookies;
    // 从字符串中提取e2mf的值
    const e2mfMatch = cookieString.match(/e2mf=([^;]+)/);
    if (e2mfMatch) {
      e2mfValue = e2mfMatch[1];
    }
  } else {
    throw new Error('无效的cookies参数格式');
  }

  const options = {
    headers: {
      'cookie': cookieString,
      'e2mf': e2mfValue
    }
  };

  try {
    logger.info('开始请求试卷列表API', { url, params: defaultParams });
    const response = await makeRequest(url, options);

    if (response.statusCode === 200) {
      logger.success('试卷列表API请求成功', {
        statusCode: response.statusCode,
        dataCount: response.data?.data?.length || 0
      });
      return response.data.object.list;
    } else {
      throw new Error(`HTTP错误: ${response.statusCode}`);
    }
  } catch (error) {
    logger.error('试卷列表API请求失败', {
      error: error.message,
      url
    });
    throw error;
  }
}
const editLink = (item) => {
  const params = new URLSearchParams({
    paperId: item.paperId,
    questionBankHubPaperId: item.questionBankHubPaperId,
    updateTime: item.updateTime.replace(' ', '+'),
  });
}
const createEditLink = item => {
  const params = new URLSearchParams({
    paperId: item.paperId,
    questionBankHubPaperId: item.questionBankHubPaperId,
    updateTime: item.updateTime.replace(' ', '+'),
    subjectName: item.subjectName,
    subjectId: item.subjectId.toString(),
    name: item.name,
    schoolName: item.schoolName,
    ownerType: item.ownerType.toString(),
    useScene: item.useScene,
    showMode: 'edit'
  });
  return `https://iteach-cloudwps.xdf.cn/paperEditor?${params.toString()}`;
}
const createPrintLink = (item) => {
  const params = new URLSearchParams({
    tenantId: '1001',
    jwSubject: item.subjectId,
    stage: item.stage,
    businessId: item.questionBankHubPaperId,
    pageSource: 'PaperCenter'
  });
  return `https://tiji.xdf.cn/downloadPreView?${params.toString()}`;
}
const createLinkArrPrint = (papersData) => {
  return papersData.map(createPrintLink);
}
const createLinkArr = (papersData) => {
  return papersData.map(createEditLink);
}
// https://tiji.xdf.cn/downloadPreView?tenantId=1001&jwSubject=1574&stage=2&businessId=CL166c0f5a4a19412685836b42c6621184&pageSource=PaperCenter
// tenantId 1001 pageSource PaperCenter

// 使用示例
async function main() {
  try {
    // 示例1: 使用默认cookies（不需要传入cookies参数）
    console.log('=== 使用默认cookies ===');
    const papersData1 = await getPapersList({
      subjectId: 1574,
      useScene: null,
      grade: null,
      quarter: null
    }, 'your-cookie-string-here');

    const links1 = createLinkArr(papersData1);
    console.log('使用默认cookies生成的链接数量:', links1.length);

    // 示例2: 传入自定义cookies字符串
    console.log('\n=== 使用自定义cookies字符串 ===');
    const customCookies = 'your-cookie-string-here';
    const papersData2 = await getPapersList({
      subjectId: 1574,
      useScene: null,
      grade: null,
      quarter: null
    }, customCookies);

    const links2 = createLinkArr(papersData2);
    console.log('使用自定义cookies字符串生成的链接数量:', links2.length);

    // 示例3: 传入对象数组格式的cookies
    console.log('\n=== 使用对象数组格式cookies ===');
    const cookies = [
      { name: 'gr_user_id', value: 'your-gr-user-id', domain: '.xdf.cn' },
      { name: 'XDFUUID', value: 'your-xdf-uuid', domain: '.xdf.cn' },
      { name: 'e2mf', value: 'your-e2mf-value', domain: '.xdf.cn' }
    ];
    const papersData3 = await getPapersList({
      subjectId: 1574,
      useScene: null,
      grade: null,
      quarter: null
    }, cookies);

    const links3 = createLinkArr(papersData3);
    console.log('使用对象数组格式cookies生成的链接数量:', links3.length);

    console.log('\n=== 测试完成 ===');
    // // 二年级 0558
    // const papersData2 = await getPapersList({
    //   subjectId: 1574,
    //   useScene: null,
    //   grade: '0558',
    //   quarter: null
    // });
    // const links2 = createLinkArr(papersData2);
    // console.log(links2);
    // console.log('试卷列表:', JSON.stringify(papersData2, null, 2));
    // // 三年级 0559
    // const papersData3 = await getPapersList({
    //   subjectId: 1574,
    //   useScene: null,
    //   grade: '0559',
    //   quarter: null
    // });
    // const links3 = createLinkArr(papersData3);
    // console.log(links3);
    // console.log('试卷列表:', JSON.stringify(papersData3, null, 2));
    // // 四年级 0560
    // const papersData4 = await getPapersList({
    //   subjectId: 1574,
    //   useScene: null,
    //   grade: '0560',
    //   quarter: null
    // });
    // const links4 = createLinkArr(papersData4);
    // console.log(links4);
    // console.log('试卷列表:', JSON.stringify(papersData4, null, 2));
  } catch (error) {
    console.error('请求失败:', error.message);
  }
}

// 如果直接运行此文件，则执行main函数
if (require.main === module) {
  main();
}

module.exports = {
  makeRequest,
  getPapersList,
  createLinkArr,
  createLinkArrPrint
};