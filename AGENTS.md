# Science Reader 开发约定

- TypeScript 保持 strict，不使用 `any` 绕过类型检查。
- Content Script 不得读取 `chrome.storage.local` 中的模型配置或 API Key。
- 模型请求仅由 Background Service Worker 执行；网页内翻译 UI 必须通过 Shadow DOM 隔离。
- 新增站点时显式扩展 match pattern，禁止申请 `<all_urls>`。
- UI 遵循 `entrypoints/shared.css` 中的设计 token；不引入 UI 框架。
- 提交前运行 `pnpm typecheck && pnpm test && pnpm build && pnpm zip`。
