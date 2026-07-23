[English](./README.md) | [简体中文](./README.zh-CN.md)

# Science Reader · Science 精读助手

一款用于翻译和精读英文学术论文选中文本的极简Chrome扩展。

Science Reader 会在 Science 网页选中文本旁显示一个小型翻译按钮。中文翻译、核心意思、英文原文、语法知识点和学术词汇会显示在使用 Shadow DOM 隔离的可拖动网页内悬浮卡片中。

## 功能

- Science 网页选中文本后的网页内翻译按钮
- 始终限制在可视区域内的可拖动毛玻璃悬浮卡片
- 按中文翻译、核心意思、英文原文组织的清晰阅读顺序
- 按需生成的语法分析、句子主干和无障碍手风琴
- 面向中文学习者的论文语境学术词汇解释
- 翻译与语法分析分开请求，避免不必要的模型消耗
- 可配置 OpenAI-compatible API、模型、密钥和目标语言
- 最多 50 条去重的本地阅读记录，支持 Markdown 导出
- 超时、取消、一次重试及易懂的网络、401、429 和 JSON 错误
- 不含分析追踪、广告、云同步或账号系统

## 技术架构

Science Reader 使用 WXT、React、TypeScript strict、Chrome Manifest V3、Zod、Vitest 和原生 CSS。

- Content Script 只读取用户明确选择的文本，并渲染隔离的悬浮卡片。
- Background Service Worker 负责读取 API 配置、模型请求、右键菜单和响应校验。
- Options Page 负责模型配置、动态 API 域名授权和本地历史。
- `src/lib/llm` 包含 OpenAI-compatible 适配器、提示词和 Zod Schema。
- `src/lib/selection`、`popover`、`drag` 和 `storage` 包含可测试的领域逻辑。

Content Script 永远不会读取 API Key。

## 环境要求

- Node.js 20 或更高版本
- pnpm 10 或更高版本
- Chrome 116 或更高版本

## 安装依赖

```bash
pnpm install
```

## 开发模式

```bash
pnpm dev
```

WXT 会生成开发扩展并监听源文件。

## 测试与构建

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm zip
```

Chrome 未打包扩展生成于 `.output/chrome-mv3/`，ZIP 压缩包生成于 `.output/`。

## 在 Chrome 中加载

1. 打开 `chrome://extensions/`。
2. 开启“开发者模式”。
3. 点击“加载已解压的扩展程序”。
4. 选择 `.output/chrome-mv3/`。
5. 打开 `https://www.science.org/` 下的论文页面。
6. 划选 2 至 5,000 个字符并点击旁边的“译”，或使用选区右键菜单。

## API 配置

在扩展详情页面打开“扩展程序选项”，配置：

- API Base URL，例如 `https://api.openai.com/v1`
- OpenAI-compatible 模型名称
- API Key
- 翻译语言，默认为简体中文
- 自动翻译和本地历史选项

保存设置时，Chrome 只请求所配置 API 域名的访问权限。密钥保存在本机 `chrome.storage.local` 中，不包含在源码内。服务商必须支持 OpenAI-compatible chat completions 格式；部分服务商可能不支持 `response_format: {"type":"json_object"}`。

## 权限

- `storage`：模型设置和本地阅读记录
- `contextMenus`：选中文本翻译命令
- `https://www.science.org/*`：Science 网页的选区交互和网页内悬浮卡片
- `optional_host_permissions`：用户保存配置时请求的 API 域名

扩展不申请 `<all_urls>`。

## 隐私

Science Reader 不收集浏览历史，不读取整篇论文，不上传未选择的网页内容，也不包含广告、分析或第三方追踪。模型请求只包含用户明确选择的文本、当前页面标题和 URL，以及必要提示词。所配置模型服务商的数据处理同时受该服务商隐私政策约束。

## 已知限制

- `0.1.0` 版本仅在 `science.org` 注入阅读界面。
- 真实模型调用需要用户提供兼容 API 和密钥。
- 本地历史不支持云同步或复杂搜索。
- 浏览器重启后不会保留进行中的选区。
- 部分 OpenAI-compatible 服务商可能需要额外适配。
- 站点结构或 Chrome 扩展行为发生变化时可能需要维护。

## 后续路线

1. 显式增加 Nature、PubMed 和 arXiv 支持。
2. 增加更多模型适配器和兼容性选项。
3. 改进引用、公式和表格附近文本的规范化。
4. 在不增加追踪的前提下继续改进无障碍和键盘流程。

## 贡献与安全

提交 Pull Request 前请阅读 [CONTRIBUTING.zh-CN.md](./CONTRIBUTING.zh-CN.md)。请按照 [SECURITY.zh-CN.md](./SECURITY.zh-CN.md) 报告漏洞，不要创建公开 Issue。变更记录见 [CHANGELOG.md](./CHANGELOG.md)。

## 许可证

本项目使用 [MIT License](./LICENSE)。

## 免责声明

本项目是独立开源项目，与Science、AAAS、Nature、OpenAI及任何模型API服务商不存在隶属、授权或官方合作关系。
