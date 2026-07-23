[English](./CONTRIBUTING.md) | [简体中文](./CONTRIBUTING.zh-CN.md)

# 贡献指南

感谢你参与 Paper Reading Assistant / 论文精读助手。

## 工作流程

1. Fork 仓库。
2. 创建聚焦的开发分支：`git switch -c feature/short-description`。
3. 运行 `pnpm install` 安装依赖。
4. 完成修改并运行 `pnpm typecheck`、`pnpm test`、`pnpm build`。
5. 创建清晰且范围单一的提交。
6. 推送分支并提交 Pull Request。
7. 说明问题、解决方案、验证结果和用户可见限制。

## 代码风格

- 保持 TypeScript strict，不使用 `any` 绕过检查。
- 模型请求和 API Key 只能位于受信任的扩展上下文。
- Content Script 只处理用户明确选中的文本。
- HTTP/HTTPS 访问必须保持为可选权限并动态注册，不得增加静态的广泛主机权限。
- 保持 Shadow DOM 隔离与现有极简界面。
- 行为变更必须增加或更新测试，覆盖普通网站、表单控件、排除列表、权限撤销和隐私边界。
- 发布前运行 `pnpm typecheck`、`pnpm test`、`pnpm build` 和 `pnpm zip`。

## 敏感信息

禁止提交 API Key、凭证、Token、私人 URL、个人信息或私人网页内容。提交日志、截图、Issue 和 Pull Request 前请删除敏感信息。

## Pull Request

每个 Pull Request 应保持聚焦；如有相关 Issue 请关联，并确认类型检查、测试和生产构建通过。
