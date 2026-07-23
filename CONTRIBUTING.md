[English](./CONTRIBUTING.md) | [简体中文](./CONTRIBUTING.zh-CN.md)

# Contributing

Thank you for contributing to Paper Reading Assistant.

## Workflow

1. Fork the repository.
2. Create a focused development branch:

   ```bash
   git switch -c feature/short-description
   ```

3. Install dependencies:

   ```bash
   pnpm install
   ```

4. Make the change and run:

   ```bash
   pnpm typecheck
   pnpm test
   pnpm build
   ```

5. Commit a clear, focused change.
6. Push the branch to your fork and open a Pull Request.
7. Describe the problem, solution, verification, and any user-visible limitations.

## Code style

- Keep TypeScript in strict mode and avoid `any`.
- Keep model requests and API-key access in trusted extension contexts.
- Keep the Content Script limited to explicitly selected text.
- Prefer small, testable modules and native CSS.
- Preserve Shadow DOM isolation and the existing minimalist interface.
- Add or update tests for behavior changes.
- Run `pnpm typecheck`, `pnpm test`, `pnpm build`, and `pnpm zip` before release work.

## Sensitive information

Never commit API keys, credentials, tokens, private URLs, personal information, or captured private page content. Remove secrets and private information from logs, screenshots, issues, and Pull Requests before submitting.

## Pull Requests

Keep each Pull Request focused. Link related issues when available and confirm that type checking, tests, and the production build pass.
