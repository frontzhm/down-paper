# 贡献指南

感谢您对 down-paper 项目的关注！我们欢迎各种形式的贡献。

## 🚀 如何贡献

### 报告问题
如果您发现了bug或有功能建议，请：
1. 检查 [Issues](https://github.com/frontzhm/down-paper/issues) 中是否已有相关问题
2. 如果没有，请创建新的 Issue
3. 使用相应的模板（Bug Report 或 Feature Request）

### 提交代码
1. Fork 这个仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 📝 开发环境设置

### 前置要求
- Node.js >= 14.0.0
- npm 或 yarn
- Git

### 安装步骤
```bash
# 克隆仓库
git clone https://github.com/frontzhm/down-paper.git
cd down-paper

# 安装依赖
npm install

# 构建项目
npm run build
```

### 测试
```bash
# 运行测试
npm test

# 检查代码风格
npm run lint
```

## 📋 代码规范

### JavaScript 代码风格
- 使用 2 个空格缩进
- 使用单引号
- 使用分号
- 函数和变量使用驼峰命名法
- 常量使用大写字母和下划线

### 提交信息规范
使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

类型包括：
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

### 示例
```
feat: 添加新的PDF生成选项
fix: 修复Windows路径处理问题
docs: 更新README中的安装说明
```

## 🐛 报告Bug

请使用 [Bug Report 模板](https://github.com/frontzhm/down-paper/issues/new?template=bug_report.md) 并提供以下信息：

- 操作系统和版本
- Node.js 版本
- down-paper 版本
- 重现步骤
- 期望行为
- 实际行为
- 错误日志（如果有）

## 💡 功能建议

请使用 [Feature Request 模板](https://github.com/frontzhm/down-paper/issues/new?template=feature_request.md) 并描述：

- 您希望添加的功能
- 为什么需要这个功能
- 可能的实现方案

## 📄 许可证

通过贡献代码，您同意您的贡献将在 MIT 许可证下发布。

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

---

如果您有任何问题，请随时在 [Issues](https://github.com/frontzhm/down-paper/issues) 中提出。
