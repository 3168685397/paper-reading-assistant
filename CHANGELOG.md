# Changelog / 变更记录

## 0.3.0

### English

- Added an extension-hosted PDF reader for remote and local text-based PDFs.
- Added bundled PDF.js Canvas rendering, selectable Text Layers, viewport-near lazy rendering, zoom, rotation, page navigation, and a collapsible page sidebar.
- Reused the existing selected-text trigger, draggable translation popover, model requests, grammar analysis, vocabulary, copy, cancellation, and local history.
- Added password, damaged-file, remote-access, loading-progress, and scanned-PDF states.
- Added English and Simplified Chinese PDF reader UI.
- Kept complete PDF files, local paths, and passwords out of model requests and persistent storage.

### 简体中文

- 新增扩展内部的远程与本地文本型 PDF 阅读器。
- 新增内置 PDF.js Canvas 渲染、可选择 Text Layer、视口附近按需渲染、缩放、旋转、页码跳转和可折叠页面侧栏。
- 复用现有划词按钮、可拖动翻译卡片、模型请求、语法分析、词汇、复制、取消和本地历史。
- 新增密码、损坏文件、远程访问、加载进度和扫描版 PDF 状态。
- 新增英文和简体中文 PDF 阅读器界面。
- 完整 PDF、本地路径和密码不会进入模型请求或持久化存储。

## 0.2.0

### English

- Expanded selected-English-text translation from a single site to ordinary HTTP and HTTPS websites.
- Added privacy-friendly optional website access and runtime Content Script registration with revocation handling.
- Added selection support for standard DOM text, open Shadow DOM, contenteditable, textarea, and text inputs; password inputs are always ignored.
- Added button, automatic, and disabled selection modes, with button mode as the default.
- Added domain-only website exclusions and clear permission status controls.
- Changed model payloads to exclude page title and URL by default; page context now requires explicit opt-in.
- Added multi-frame injection safeguards and documented protected-page, PDF, closed-Shadow-DOM, and cross-origin-iframe limitations.

### 简体中文

- 将划词翻译从单一网站扩展到普通 HTTP 和 HTTPS 网页。
- 新增隐私友好的可选网站权限、运行时内容脚本注册和权限撤销处理。
- 新增普通 DOM 文本、开放 Shadow DOM、contenteditable、textarea 和文本 input 选区支持；始终忽略密码输入框。
- 新增显示按钮、自动翻译和完全禁用三种划词模式，默认显示按钮。
- 新增只保存域名的网站排除列表和清晰的权限状态控制。
- 模型请求默认不再包含页面标题和 URL；页面上下文必须由用户显式开启。
- 新增多 frame 注入防重复措施，并记录受保护页面、PDF、封闭 Shadow DOM 和跨域 iframe 限制。

## 0.1.0

### English

- Added in-page selected-text translation for Science pages.
- Added a draggable frosted-glass translation popover.
- Added Chinese translation, core meaning, original English, grammar, and academic vocabulary analysis.
- Added configurable OpenAI-compatible API support and local reading history.

### 简体中文

- 新增 Science 网页划词翻译。
- 新增可拖动毛玻璃翻译悬浮卡片。
- 新增中文翻译、核心意思、英文原文、语法和学术词汇分析。
- 新增可配置 OpenAI-compatible API 和本地阅读记录。
