[English](./CONTRIBUTING.md) | [简体中文](./CONTRIBUTING.zh-CN.md)

# Contributing

Thank you for contributing to Paper Reading Assistant.

## Workflow

1. Fork the repository.
2. Create a focused branch: `git switch -c feature/short-description`.
3. Install dependencies with `pnpm install`.
4. Make the change and run `pnpm typecheck`, `pnpm test`, and `pnpm build`.
5. Create a clear, focused commit.
6. Push the branch and open a Pull Request.
7. Describe the problem, solution, verification, and user-visible limitations.

## Code style

- Keep TypeScript strict and do not use `any` to bypass checks.
- Keep model requests and API-key access in trusted extension contexts.
- Keep Content Scripts limited to explicitly selected text.
- Keep HTTP/HTTPS access optional and runtime-registered; do not add static broad host access.
- Preserve Shadow DOM isolation and the existing minimalist interface.
- Add tests for behavior changes, including ordinary sites, form controls, exclusions, permission revocation, and privacy boundaries.
- For PDF changes, test local and remote files, Text Layer selection, rendering cancellation, scanned files, passwords, and ensure complete documents never enter model requests.
- Run `pnpm typecheck`, `pnpm test`, `pnpm build`, and `pnpm zip` before release work.

## Sensitive information

Never commit API keys, credentials, tokens, private URLs, personal information, or private page content. Remove sensitive information from logs, screenshots, Issues, and Pull Requests.

## Pull Requests

Keep each Pull Request focused, link related Issues when available, and confirm that type checking, tests, and the production build pass.
