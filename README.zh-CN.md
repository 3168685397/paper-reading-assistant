[English](./README.md) | [简体中文](./README.zh-CN.md)

# Paper Reading Assistant / 论文精读助手

一款用于翻译和精读网页选中英文文本的极简 Chrome 扩展。

## 截图

<!-- 请将经过隐私检查的真实产品截图以 1280×640 保存为 docs/images/hero.png，然后将本注释替换为：![论文精读助手翻译悬浮卡片](./docs/images/hero.png) -->

## 快速开始

1. 从 GitHub Releases 下载 Chrome ZIP。
2. 解压 ZIP；不能把 ZIP 直接拖入 Chrome 安装。
3. 打开 `chrome://extensions/`，开启**开发者模式**并点击**加载已解压的扩展程序**。
4. 选择解压后的扩展目录。
5. 打开扩展设置，配置自己的 OpenAI-compatible API。
6. 点击**启用所有网站**并同意访问普通 HTTP/HTTPS 网页。

项目不包含公共 API Key，当前尚未发布到 Chrome Web Store。

## 核心功能

- 在普通 HTTP 和 HTTPS 网站翻译选中的英文文本
- 支持普通 DOM 文本、开放 Shadow DOM、contenteditable、textarea 和文本 input
- 提供显示按钮、自动翻译和完全禁用三种模式；默认显示按钮
- 使用 Shadow DOM 隔离、可拖动且不会移出视口的悬浮卡片
- 提供中文翻译、核心意思、英文原文、句子主干、语法和学术词汇
- 只保存域名的网站排除列表
- 可配置 OpenAI-compatible API，并保存最多 50 条本地阅读记录

## API 设置

在扩展设置中配置 API Base URL、模型、API Key 和目标语言。服务商需要兼容 OpenAI chat completions。API Key 保存在受信任的扩展存储中，模型请求只由 Background Service Worker 执行。

默认模型请求只包含用户明确选中的文本和必要提示词。发送页面标题和 URL 是一个默认关闭、必须显式开启的选项。

## 开发

需要 Node.js 20+、pnpm 10+ 和 Chrome 116+。

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm test
pnpm build
pnpm zip
```

未打包扩展生成于 `.output/chrome-mv3/`，正式安装包为 `.output/paper-reading-assistant-0.2.0-chrome.zip`。

## 隐私与权限

论文精读助手只读取用户明确选中的文本，不读取整页、表单或密码输入框，不收集浏览历史，不注入广告，不含统计代码或公共 API Key。

- `storage`：受信任的模型设置、域名排除项和本地阅读记录
- `contextMenus`：选中文本右键入口
- `scripting`：授权后动态注册内容脚本
- 可选的 `http://*/*` 与 `https://*/*`：仅在用户启用网站访问时请求
- API 域名：保存 API 配置时请求

Content Script 无法读取 API Key。排除列表只保存域名，不保存完整 URL。撤销网站访问权限后会取消内容脚本注册。

## 已知限制

- 不支持浏览器内部页面、扩展页面、Chrome Web Store、`file://`、FTP、`view-source:` 和其他受保护页面。
- 图片或 canvas 中的文字需要未来 OCR 支持。
- 浏览器 PDF 阅读器可能限制注入或选区行为。
- 跨域 iframe 中的悬浮卡片只能显示在该 iframe 的视口内。
- 无法观察封闭 Shadow DOM 内的选区。
- 用户必须自行提供兼容的模型 API。

## 公开测试

`v0.2.0` 当前只在功能分支开发，尚未发布。人工测试应覆盖学术网站、新闻、博客、表格、SPA、多列布局、表单控件、iframe、深色页面和超长选区。提交报告前请删除 API Key、私人文本和个人信息。

## 路线图

候选方向包括改进 PDF 流程、OCR、界面语言切换、词汇复习、导出和更好的错误诊断，不承诺具体完成时间。

## 贡献

请阅读 [CONTRIBUTING.zh-CN.md](./CONTRIBUTING.zh-CN.md)。安全漏洞请按 [SECURITY.zh-CN.md](./SECURITY.zh-CN.md) 私下报告。

## 许可证与免责声明

项目使用 [MIT License](./LICENSE)，变更记录见 [CHANGELOG.md](./CHANGELOG.md)。

本项目是独立开源项目，与 Science、AAAS、Nature、OpenAI 及任何模型 API 服务商不存在隶属、授权或官方合作关系。
