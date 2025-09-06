# Windows 使用指南

## 🖥️ Windows 系统使用说明

### 系统要求

- **操作系统**: Windows 10 或更高版本
- **Node.js**: 14.0.0 或更高版本
- **Chrome 浏览器**: 建议安装 Google Chrome

### 安装步骤

#### 1. 安装 Node.js

1. 访问 [Node.js 官网](https://nodejs.org/)
2. 下载 Windows 版本的 LTS 版本
3. 运行安装程序，按默认设置安装
4. 打开命令提示符（CMD）或 PowerShell，验证安装：
   ```cmd
   node --version
   npm --version
   ```

#### 2. 安装 down-paper 工具

```cmd
npm install -g down-paper
```

#### 3. 安装 Chrome 浏览器（如果未安装）

1. 访问 [Chrome 官网](https://www.google.com/chrome/)
2. 下载并安装 Chrome 浏览器
3. 工具会自动检测 Chrome 安装路径

### 使用方法

#### 基本用法

```cmd
# 使用默认输出目录
down-paper --cookie "your-cookie-string"

# 指定自定义输出目录（推荐）
down-paper --cookie "your-cookie-string" --output-dir ".\\my-papers"
```

#### 完整参数示例

```cmd
down-paper ^
  --cookie "your-cookie-string" ^
  --subject-id 1574 ^
  --grade "0557" ^
  --quarter 3 ^
  --use-scene "khlx" ^
  --output-dir ".\\downloads"
```

### 常见问题解决

#### 1. Chrome 浏览器启动失败

**错误信息**: `Failed to launch the browser process!`

**解决方案**:
1. 确保已安装 Google Chrome 浏览器
2. 检查 Chrome 是否在以下路径之一：
   - `C:\Program Files\Google\Chrome\Application\chrome.exe`
   - `C:\Program Files (x86)\Google\Chrome\Application\chrome.exe`
   - `%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe`

3. 如果 Chrome 安装在其他位置，可以设置环境变量：
   ```cmd
   set CHROME_BIN="你的Chrome路径"
   ```

#### 2. 模块引用错误

**错误信息**: `cannot find module ../src/batchProcessor`

**解决方案**: 这个问题已在 v2.3.1 版本中修复，请确保使用最新版本：
```cmd
npm update -g down-paper
```

#### 3. 路径分隔符问题

**问题**: Windows 使用反斜杠 `\` 作为路径分隔符

**解决方案**: 工具已自动处理跨平台路径，支持以下格式：
```cmd
# 这些格式都可以正常工作
--output-dir ".\\my-papers"
--output-dir "./my-papers"
--output-dir "my-papers"
```

#### 4. 权限问题

**问题**: 无法创建输出目录或写入文件

**解决方案**:
1. 以管理员身份运行命令提示符
2. 或者选择有写入权限的目录作为输出目录

### 性能优化建议

#### 1. 使用无头模式（服务器环境）

```cmd
down-paper --cookie "your-cookie" --headless
```

#### 2. 调整并发数量

```cmd
# 减少并发数量，避免系统负载过高
down-paper --cookie "your-cookie" --concurrent 2
```

#### 3. 使用 SSD 硬盘

将输出目录设置在 SSD 硬盘上，提高文件写入速度。

### 故障排除

#### 检查工具状态

```cmd
# 检查版本
down-paper --version

# 查看帮助
down-paper --help
```

#### 查看详细日志

```cmd
# 启用调试模式
set DEBUG=1
down-paper --cookie "your-cookie"
```

#### 重新安装工具

```cmd
# 卸载
npm uninstall -g down-paper

# 重新安装
npm install -g down-paper
```

### 联系支持

如果遇到其他问题：

1. 查看 [GitHub Issues](https://github.com/yourusername/down-paper/issues)
2. 提交新的 Issue
3. 提供以下信息：
   - Windows 版本
   - Node.js 版本
   - 错误信息截图
   - 使用的命令

### 更新日志

- **v2.3.3**: 修复了 Windows 下 Chrome 浏览器启动失败的问题
- **v2.3.1**: 修复了模块引用错误
- **v2.3.0**: 添加了跨平台路径支持
