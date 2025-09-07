# 📚 批量下载试卷PDF工具

一个用于批量下载东方在线教育平台试卷PDF的Node.js工具，支持命令行和编程接口两种使用方式。

## ✨ 功能特性

- 🚀 **批量下载**: 支持批量下载多个试卷PDF文件
- 📝 **双版本生成**: 自动生成原版和带答案版本
- 🎯 **灵活配置**: 支持自定义年级、学期、科目等参数
- 💻 **多种使用方式**: 支持命令行工具和编程接口
- 📊 **详细日志**: 提供完整的执行日志和统计信息
- 🔧 **易于集成**: 可作为npm包集成到其他项目中

## 📦 安装

### 全局安装（推荐）

```bash
npm install -g down-paper
```

### 本地安装

```bash
npm install down-paper
```

### 从源码安装

```bash
git clone https://github.com/yourusername/down-paper.git
cd down-paper
npm install
npm link  # 链接到全局，支持命令行使用
```

## 🚀 使用方法

### ⚠️ 重要提醒

**建议使用 `--output-dir` 参数指定输出目录**，因为：
- 默认会在当前目录创建 `1-download` 文件夹
- 使用 `--output-dir` 可以指定自定义输出位置
- 避免与现有文件冲突，便于管理下载的PDF文件

**服务器环境建议使用 `--headless` 参数**：
- 无头模式不需要图形界面，适合服务器环境
- 减少资源消耗，提高运行效率
- 避免浏览器启动失败的问题

### 1. 命令行使用

#### 基本用法

```bash
# 方式1：使用默认输出目录（在当前目录创建 1-download 文件夹）
down-paper --cookie "your-cookie-string"

# 方式2：指定自定义输出目录（推荐）
# Linux/macOS:
down-paper --cookie "your-cookie-string" --output-dir "./my-papers"

# Windows:
down-paper --cookie "your-cookie-string" --output-dir ".\\my-papers"
```

#### 完整参数

```bash
# Linux/macOS - 指定所有参数和自定义输出目录
down-paper \
  --cookie "your-cookie-string" \
  --subject-id 1574 \
  --grade "0557" \
  --quarter 3 \
  --use-scene "khlx" \
  --output-dir "./downloads"

# Windows - 指定所有参数和自定义输出目录
down-paper ^
  --cookie "your-cookie-string" ^
  --subject-id 1574 ^
  --grade "0557" ^
  --quarter 3 ^
  --use-scene "khlx" ^
  --output-dir ".\\downloads"
```

#### 参数说明

| 参数 | 简写 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| `--cookie` | `-c` | ✅ | - | Cookie字符串 |
| `--subject-id` | `-s` | ❌ | 1574 | 科目ID |
| `--grade` | `-g` | ❌ | 0557 | 年级代码 |
| `--quarter` | `-q` | ❌ | 3 | 学期 |
| `--use-scene` | `-u` | ❌ | khlx | 使用场景 |
| `--output-dir` | `-o` | ❌ | ./1-download | 输出目录 |
| `--headless` | - | ❌ | false | 使用无头模式运行浏览器（适合服务器环境） |
| `--help` | `-h` | ❌ | - | 显示帮助信息 |
| `--version` | `-v` | ❌ | - | 显示版本号 |

#### 年级代码对照表

| 代码 | 年级 |
|------|------|
| 0555 | S3 |
| 0556 | S4 |
| 0557 | 一年级 |
| 0558 | 二年级 |
| 0559 | 三年级 |
| 0560 | 四年级 |
| 0561 | 五年级 |
| 0562 | 六年级 |
| 0567 | 不区分 |
| 0999 | 小升初 |

#### 使用场景对照表

| 代码 | 场景 |
|------|------|
| gdk | 功底考 |
| jdcp | 阶段测试 |
| khlx | 课后测试 |
| nlcp | 能力测评 |
| syttl | 素养天天练 |

#### 学期对照表

| 代码 | 学期 |
|------|------|
| 1 | 春季 |
| 2 | 暑假 |
| 3 | 秋季 |
| 4 | 寒假 |
| 9 | 不区分 |

#### 学年对照表

| 代码 | 学年 |
|------|------|
| 929 | 上学期 |
| 930 | 下学期 |
| 931 | 全学年 |

#### 年份对照表

| 代码 | 年份 |
|------|------|
| 2023 | 2023年 |
| 2024 | 2024年 |
| 2025 | 2025年 |
| 2026 | 2026年 |

#### 使用类型对照表

| 代码 | 类型 |
|------|------|
| 1 | 线上 |
| 2 | 线下 |

### 2. 编程接口使用

#### 基本用法

```javascript
const downPaper = require('down-paper');

async function downloadPapers() {
  try {
    const result = await downPaper.generateBatchPDFs({
      cookie: 'your-cookie-string',
      queryParams: {
        subjectId: 1574,
        grade: '0557',
        quarter: 3
      },
      outputDir: './downloads'  // 指定输出目录，避免文件冲突
    });
    
    console.log('下载完成:', result);
  } catch (error) {
    console.error('下载失败:', error.message);
  }
}

downloadPapers();
```

#### API 参考

##### `generateBatchPDFs(options)`

批量生成PDF文件的主要方法。

**参数:**

- `options.cookie` (string, 必需): Cookie字符串
- `options.queryParams` (object): 查询参数
  - `subjectId` (number): 科目ID，默认 1574
  - `useScene` (string): 使用场景，默认 'khlx'
  - `grade` (string): 年级，默认 '0557'
  - `quarter` (number): 学期，默认 3
- `options.outputDir` (string): 输出目录，默认 './1-download'

**返回值:**

```javascript
{
  total: 10,        // 总任务数
  success: 8,       // 成功任务数
  failed: 2,        // 失败任务数
  duration: 120000, // 总耗时（毫秒）
  failedLinks: [    // 失败的链接详情
    {
      index: 1,
      url: 'https://example.com/paper1',
      error: 'Error message'
    }
  ]
}
```

##### `getPapers(params, cookies)`

获取试卷列表。

```javascript
const papers = await downPaper.getPapers({
  subjectId: 1574,
  grade: '0557'
}, 'your-cookie-string');
```

##### `createLinks(papersData)`

从试卷数据生成链接数组。

```javascript
const links = downPaper.createLinks(papersData);
```

##### `processSinglePDF(options)`

处理单个iframe并生成PDF。

```javascript
const result = await downPaper.processSinglePDF({
  url: 'https://example.com/paper',
  cookies: 'your-cookie-string',
  outputDir: './downloads'
});
```

##### `generateSinglePDF(options)`

生成单个PDF文件。

```javascript
const result = await downPaper.generateSinglePDF({
  url: 'https://example.com/paper',
  cookies: cookieArray,
  outputDir: './downloads'
});
```

##### `getLogger()`

获取日志记录器实例。

```javascript
const logger = downPaper.getLogger();
logger.info('开始处理');
```

## 🔧 配置说明

### Cookie 获取方法

1. 登录东方在线教育平台
2. 打开浏览器开发者工具 (F12)
3. 切换到 Network 标签页
4. 刷新页面或进行任何操作
5. 在请求头中找到 `Cookie` 字段
6. 复制完整的 Cookie 字符串

### 输出文件结构

```
downloads/
├── 1年级/
│   ├── 思维B-1年级-第1讲.pdf
│   ├── 思维B-1年级-第1讲-答案.pdf
│   ├── 思维B-1年级-第2讲.pdf
│   └── 思维B-1年级-第2讲-答案.pdf
├── 2年级/
│   ├── 人教版-2年级-第4讲.pdf
│   └── 人教版-2年级-第4讲-答案.pdf
└── ...
```

## 📝 日志系统

工具提供完整的日志记录功能：

- **控制台输出**: 实时显示执行进度和结果
- **文件日志**: 自动保存到 `logs/` 目录
- **日志级别**: INFO, WARN, ERROR, SUCCESS
- **详细统计**: 包含成功率、耗时等统计信息

## 🛠️ 开发

### 项目结构

```
down-paper/
├── bin/                    # CLI 入口文件
│   └── down-paper.js
├── lib/                    # 发布后的代码
│   ├── index.js           # API 入口
│   ├── batchProcessor.js  # 批量处理逻辑
│   ├── iframeProcessor.js # iframe 处理
│   ├── pdfGenerator.js    # PDF 生成
│   ├── request.js         # HTTP 请求
│   └── logger.js          # 日志系统
├── src/                   # 源代码
├── logs/                  # 日志文件
├── 1-download/           # 默认下载目录
├── package.json
└── README.md
```

### 构建

```bash
npm run build
```

### 测试

```bash
# 测试 CLI 工具
down-paper --help

# 测试 API
node -e "console.log(require('./lib/index.js').version)"
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 支持

如果您在使用过程中遇到问题，请：

1. 查看 [Issues](https://github.com/yourusername/down-paper/issues)
2. 提交新的 Issue
3. 联系维护者

## 🔄 更新日志

### v2.3.3

- 🖥️ **跨平台浏览器**: 修复了 Windows 下 Chrome 浏览器启动失败的问题
- 🔧 **优化**: 创建了统一的跨平台浏览器配置工具 `browserConfig.js`
- 📦 **完善**: 支持 Windows、macOS、Linux 的 Chrome 自动检测
- 🎯 **改进**: 优化了浏览器启动参数和错误处理

### v2.3.2

- 🖥️ **跨平台浏览器**: 修复了 Windows 下浏览器启动失败的问题
- 🔧 **智能路径检测**: 自动检测 Windows、macOS、Linux 的 Chrome 安装路径
- 🎯 **无头模式**: 新增 `--headless` 参数，适合服务器环境运行
- 📝 **错误处理**: 改进了浏览器启动失败时的错误提示和解决方案
- 🚀 **性能优化**: 添加了更多浏览器启动参数，提高稳定性

### v2.3.1

- 🔧 **修复**: 修复了 Windows 下 "cannot find module ../src/batchProcessor" 错误
- 📦 **构建**: 优化了构建脚本，确保发布包中的模块路径正确
- 🎯 **完善**: 修复了 CLI 工具和 API 入口的模块引用问题

### v2.3.0

- 🖥️ **跨平台**: 添加了 Windows 路径兼容性支持
- 🔧 **修复**: 使用 `path.join()` 和 `path.sep` 确保跨平台路径处理
- 📝 **完善**: 更新了 Windows 和 Linux/macOS 的使用示例
- 🎯 **优化**: 改进了路径标准化逻辑，避免双分隔符问题

### v2.2.0

- 🎯 **优化**: 更新了使用建议，推荐使用 `--output-dir` 参数
- 📝 **改进**: 不再强制要求在空文件夹下运行
- 💡 **完善**: 更新了所有示例和帮助信息
- 🚀 **提升**: 更灵活的使用方式，用户可以在任何目录下运行

### v2.1.0

- 🔧 **修复**: 修复了 `--output-dir` 参数不生效的问题
- 📁 **新增**: 自动创建输出目录功能
- ⚠️ **改进**: 添加了在空文件夹下运行的重要提醒
- 📚 **完善**: 更新了完整的字段字典和对照表
- 🎯 **优化**: 改进了路径处理和目录创建逻辑

### v2.0.0

- 📚 **新增**: 完整的字段字典和对照表
- ⚠️ **改进**: 添加了运行环境提醒
- 📖 **完善**: 更新了帮助信息和示例

### v1.0.0

- ✨ 初始版本发布
- 🚀 支持批量下载试卷PDF
- 💻 提供命令行和编程接口
- 📊 完整的日志系统
- 🎯 灵活的配置选项

---

**注意**: 请确保您有权限访问相关教育资源，并遵守相关使用条款。