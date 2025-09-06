# PDF批量生成工具

这是一个自动化的PDF生成工具，可以批量处理多个链接，生成对应的PDF文件（包含答案版本和无答案版本）。

## 功能特性

- 批量处理多个链接
- 自动处理iframe内容
- 生成两个版本的PDF：原版和答案版
- 详细的日志记录系统
- 错误处理和重试机制

## 文件结构

```
├── index.js              # 主入口文件，处理批量链接
├── iframeProcessor.js    # iframe处理模块
├── pdfGenerator.js       # PDF生成模块
├── logger.js             # 日志系统模块
├── logs/                 # 日志文件目录
│   └── pdf-generator-YYYY-MM-DD.log
└── README.md             # 说明文档
```

## 日志系统

### 日志文件位置
- 日志文件保存在 `./logs/` 目录下
- 文件名格式：`pdf-generator-YYYY-MM-DD.log`
- 每天生成一个新的日志文件

### 日志级别
- **INFO**: 一般信息，如流程开始、页面访问等
- **SUCCESS**: 成功操作，如PDF生成成功、元素找到等
- **WARN**: 警告信息，如元素未找到但不影响主流程
- **ERROR**: 错误信息，如PDF生成失败、严重错误等

### 日志内容
日志记录包含以下重要信息：

#### 整体运行日志
- 批量任务开始时间
- 每个链接的处理状态
- 成功/失败统计
- 总耗时

#### PDF生成日志
- PDF生成开始时间
- 文件名和保存路径
- 文件大小
- 生成失败的详细错误信息

#### 错误详情
当PDF生成失败时，日志会记录：
- 错误消息
- 错误堆栈
- 失败的URL
- 失败的步骤（如：复选框点击、元素查找等）
- 相关的选择器和参数

### 日志示例

```
[2024-01-15 10:30:15] [INFO] 开始批量PDF生成任务
[2024-01-15 10:30:15] [INFO] 开始处理链接 1/12
[2024-01-15 10:30:20] [SUCCESS] 启动浏览器
[2024-01-15 10:30:25] [SUCCESS] 页面访问成功
[2024-01-15 10:30:30] [SUCCESS] 找到文本元素
[2024-01-15 10:30:35] [SUCCESS] PDF生成成功
[2024-01-15 10:30:40] [ERROR] PDF生成失败
{
  "fileName": "苏教版-4年级-第5讲",
  "error": "Node is either not clickable or not an HTMLElement",
  "context": {
    "type": "second_pdf",
    "step": "generate_with_answers",
    "selector": ".el-checkbox",
    "indexes": [1, 2]
  }
}
```

## 使用方法

1. 确保已安装依赖：
   ```bash
   npm install puppeteer
   ```

2. 运行批量生成：
   ```bash
   node index.js
   ```

3. 查看日志：
   ```bash
   # 查看今天的日志
   cat logs/pdf-generator-$(date +%Y-%m-%d).log
   
   # 实时监控日志
   tail -f logs/pdf-generator-$(date +%Y-%m-%d).log
   ```

## 错误排查

### 常见错误及解决方案

1. **"Node is either not clickable or not an HTMLElement"**
   - 原因：复选框元素不可点击或不存在
   - 解决：检查页面加载是否完成，或调整等待时间

2. **"未找到iframe"**
   - 原因：页面iframe未加载完成
   - 解决：增加等待时间或检查页面结构

3. **"PDF生成失败"**
   - 原因：页面内容未完全加载或网络问题
   - 解决：检查网络连接，增加超时时间

### 调试模式
- 浏览器以非无头模式运行，可以看到实际操作过程
- 所有操作都有详细的日志记录
- 错误时会保留错误现场信息

## 配置说明

### 主要配置项
- `linkArr`: 要处理的URL列表
- `cookies`: 认证cookie信息
- `checkboxSelector`: 复选框选择器
- `checkboxIndexes`: 要点击的复选框索引
- `outputDir`: PDF输出目录

### 超时设置
- 页面加载超时：60秒
- 元素等待超时：30秒
- iframe加载超时：60秒

## 注意事项

1. 确保Chrome浏览器已安装在默认路径
2. 确保有足够的磁盘空间存储PDF文件和日志
3. 网络连接稳定，避免超时错误
4. 定期清理旧的日志文件
