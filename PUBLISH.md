# 📦 发布指南

## 发布前准备

### 1. 更新版本号

```bash
# 更新 package.json 中的版本号
npm version patch  # 补丁版本 (1.0.0 -> 1.0.1)
npm version minor  # 次要版本 (1.0.0 -> 1.1.0)
npm version major  # 主要版本 (1.0.0 -> 2.0.0)
```

### 2. 构建项目

```bash
npm run build
```

### 3. 测试功能

```bash
# 测试 CLI 工具
node bin/down-paper.js --help
node bin/down-paper.js --version

# 测试 API
node -e "const downPaper = require('./lib/index.js'); console.log('版本:', downPaper.version);"
```

## 发布到 npm

### 1. 登录 npm

```bash
npm login
```

### 2. 发布包

```bash
npm publish
```

### 3. 验证发布

```bash
# 全局安装测试
npm install -g down-paper

# 测试命令
down-paper --help
down-paper --version
```

## 本地测试

### 1. 链接到全局

```bash
npm link
```

### 2. 测试命令

```bash
down-paper --help
down-paper --version
```

### 3. 取消链接

```bash
npm unlink -g down-paper
```

## 更新包

### 1. 更新代码

### 2. 更新版本号

```bash
npm version patch
```

### 3. 重新发布

```bash
npm publish
```

## 注意事项

1. **包名唯一性**: 确保包名在 npm 上是唯一的
2. **版本号**: 遵循语义化版本规范
3. **依赖管理**: 确保所有依赖都正确声明
4. **文档更新**: 发布前更新 README.md
5. **测试充分**: 确保所有功能都经过测试

## 包信息

- **包名**: down-paper
- **版本**: 1.0.0
- **许可证**: MIT
- **Node.js 版本要求**: >=14.0.0
