[English](./README.md) | [简体中文](./README.zh-CN.md)

# Paper Reading Assistant · 论文精读助手

一款用于翻译和精读英文学术论文选中文本的极简Chrome扩展。

## 产品截图

<!-- 产品截图占位：请将经过隐私检查的真实 1280×640 截图保存为 docs/images/hero.png，然后将本注释替换为：![论文精读助手网页内翻译悬浮卡片](./docs/images/hero.png) -->

## 快速安装

1. 从 [GitHub Releases](https://github.com/3168685397/paper-reading-assistant/releases/latest) 下载最新 Chrome ZIP。
2. 解压 ZIP 文件。ZIP 不能直接拖入 Chrome 安装。
3. 打开 `chrome://extensions/`。
4. 启用“开发者模式”。
5. 点击“加载已解压的扩展程序”。
6. 选择解压后的扩展目录。
7. 打开扩展设置，配置你自己的 OpenAI-compatible API。

用户必须自行提供兼容的模型 API。本项目不内置公共 API Key，目前尚未发布到 Chrome Web Store。

## 公开测试

当前 `v0.1.0` 是公开测试版，欢迎在[公开测试反馈 Issue](https://github.com/3168685397/paper-reading-assistant/issues/1)提交 Bug 和目标明确的功能建议。

提交 Issue 前，请删除 API Key、私人论文内容和个人信息。当前版本主要适配 `science.org`；Nature、PubMed 和 arXiv 尚未正式支持。

## 核心功能

- Science 网页内划词翻译
- 始终限制在可视区域内的可拖动毛玻璃悬浮卡片
- 按中文翻译、核心意思、英文原文组织的清晰阅读顺序
- 按需生成的句子结构与语法分析
- 面向中文学习者的论文语境学术词汇
- 翻译与语法分析分开请求
- 可配置 OpenAI-compatible API、模型、密钥和目标语言
- 最多 50 条去重本地阅读记录，支持 Markdown 导出
- 超时、取消、重试以及易懂的网络、认证、限流和 JSON 错误

## API 设置

在扩展详情页面打开“扩展程序选项”，配置：

- API Base URL，例如 `https://api.openai.com/v1`
- OpenAI-compatible 模型名称
- API Key
- 翻译语言，默认为简体中文
- 自动翻译和本地历史选项

保存设置时，Chrome 只请求所配置 API 域名的访问权限。密钥保存在本机 `chrome.storage.local` 中，Content Script 永远无法读取。服务商必须支持 OpenAI-compatible chat completions 格式；部分服务商可能不支持 `response_format: {"type":"json_object"}`。

## 开发说明

环境要求：

- Node.js 20 或更高版本
- pnpm 10 或更高版本
- Chrome 116 或更高版本

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm test
pnpm build
pnpm zip
```

未打包扩展生成于 `.output/chrome-mv3/`，安装包生成于 `.output/paper-reading-assistant-0.1.0-chrome.zip`。

Paper Reading Assistant 使用 WXT、React、TypeScript strict、Chrome Manifest V3、Zod、Vitest、Shadow DOM、Pointer Events 和原生 CSS。Background Service Worker 负责 API 访问；Content Script 只读取用户明确选择的文本并渲染隔离的网页内界面。

## 隐私与权限

Paper Reading Assistant 不收集浏览历史，不读取整篇论文，不上传未选择的网页内容，也不包含广告、分析或第三方追踪。模型请求只包含用户明确选择的文本、当前页面标题和 URL，以及必要提示词。所配置服务商的数据处理同时受该服务商隐私政策约束。

权限：

- `storage`：模型设置和本地阅读记录
- `contextMenus`：选中文本翻译命令
- `https://www.science.org/*`：选区交互和网页内悬浮卡片
- `optional_host_permissions`：保存配置时请求的 API 域名

扩展不申请 `<all_urls>`。

## 已知限制

- `0.1.0` 版本主要适配 `science.org`。
- Nature、PubMed 和 arXiv 尚未正式支持。
- PDF 支持仍然有限。
- 用户必须提供兼容的模型 API 和密钥。
- 扩展尚未发布到 Chrome Web Store。
- 本地历史不支持云同步或复杂搜索。
- 站点结构或浏览器行为发生变化时可能需要维护。

已发布的 `v0.1.0` 附件保留历史文件名，详情见[开源展示待办](./docs/OPEN_SOURCE_TODO.md)。该附件仍然有效。

## 后续路线

候选方向包括 Nature、PubMed 和 arXiv 支持、更好的 PDF 工作流、界面语言切换、词汇复习、Markdown 或 Anki 导出，以及更完善的错误诊断。这些仅为候选项，不构成交付承诺。

查看公开的 [v0.2.0 路线 Issue](https://github.com/3168685397/paper-reading-assistant/issues/2)。

## 参与贡献

创建 Pull Request 前请阅读 [CONTRIBUTING.zh-CN.md](./CONTRIBUTING.zh-CN.md)。Bug 和建议请使用双语 Issue 模板。安全漏洞请按照 [SECURITY.zh-CN.md](./SECURITY.zh-CN.md) 私密报告。

## 许可证与免责声明

本项目使用 [MIT License](./LICENSE)，变更记录见 [CHANGELOG.md](./CHANGELOG.md)。

本项目是独立开源项目，与Science、AAAS、Nature、OpenAI及任何模型API服务商不存在隶属、授权或官方合作关系。
