[English](./CONTRIBUTING.md) | [简体中文](./CONTRIBUTING.zh-CN.md)

# 贡献指南

感谢你为 Paper Reading Assistant 做出贡献。

## 工作流程

1. Fork 本仓库。
2. 创建目标明确的开发分支：

   ```bash
   git switch -c feature/short-description
   ```

3. 安装依赖：

   ```bash
   pnpm install
   ```

4. 完成修改并运行：

   ```bash
   pnpm typecheck
   pnpm test
   pnpm build
   ```

5. 提交清晰且范围集中的变更。
6. 将分支推送到你的 Fork，并创建 Pull Request。
7. 说明问题、解决方式、验证结果和用户可见的限制。

## 代码风格

- 保持 TypeScript strict，避免使用 `any`。
- 模型请求和 API Key 访问必须位于可信扩展上下文。
- Content Script 只能处理用户明确选择的文本。
- 优先使用小型、可测试的模块和原生 CSS。
- 保持 Shadow DOM 隔离和现有极简界面。
- 行为发生变化时增加或更新测试。
- 发布前运行 `pnpm typecheck`、`pnpm test`、`pnpm build` 和 `pnpm zip`。

## 敏感信息

禁止提交 API Key、凭据、Token、私有 URL、个人信息或截取的私密网页内容。提交日志、截图、Issue 和 Pull Request 前必须删除密钥和隐私信息。

## Pull Request

每个 Pull Request 应保持目标集中。条件允许时关联对应 Issue，并确认类型检查、测试和生产构建全部通过。
