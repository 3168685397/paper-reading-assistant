[English](./README.md) | [简体中文](./README.zh-CN.md)

# Science Reader

A minimalist Chrome extension for translating and studying selected text in academic papers.

Science Reader adds a small translation trigger beside selected text on Science pages. Translation, the core meaning, the original English, grammar notes, and academic vocabulary appear in a draggable in-page popover isolated with Shadow DOM.

## Features

- In-page translation trigger for selected text on Science
- Draggable frosted-glass popover constrained to the visible viewport
- Chinese translation, core meaning, and original English in a clear reading order
- On-demand grammar analysis with sentence structure and accessible accordions
- Context-aware academic vocabulary explanations for Chinese learners
- Separate translation and grammar requests to avoid unnecessary model usage
- Configurable OpenAI-compatible API, model, key, and target language
- Up to 50 deduplicated local reading records with Markdown export
- Timeout, cancellation, one retry, and readable network, 401, 429, and JSON errors
- No analytics, advertising, cloud sync, or account system

## Architecture

Science Reader uses WXT, React, strict TypeScript, Chrome Manifest V3, Zod, Vitest, and native CSS.

- The Content Script reads only explicitly selected text and renders the isolated popover.
- The Background Service Worker owns API configuration access, model requests, context menus, and response validation.
- The Options Page manages model configuration, dynamic API-origin permission, and local history.
- `src/lib/llm` contains the OpenAI-compatible adapter, prompts, and Zod schemas.
- `src/lib/selection`, `popover`, `drag`, and `storage` contain testable domain logic.

The Content Script never reads the API key.

## Requirements

- Node.js 20 or later
- pnpm 10 or later
- Chrome 116 or later

## Install dependencies

```bash
pnpm install
```

## Development

```bash
pnpm dev
```

WXT generates a development extension and watches source files.

## Test and build

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm zip
```

The unpacked Chrome extension is generated at `.output/chrome-mv3/`. The ZIP package is generated in `.output/`.

## Load in Chrome

1. Open `chrome://extensions/`.
2. Enable **Developer mode**.
3. Select **Load unpacked**.
4. Choose `.output/chrome-mv3/`.
5. Open a paper under `https://www.science.org/`.
6. Select between 2 and 5,000 characters and click the nearby **译** button, or use the selection context menu.

## API configuration

Open **Extension options** from the extension details page and configure:

- API Base URL, for example `https://api.openai.com/v1`
- OpenAI-compatible model name
- API key
- Translation language, Simplified Chinese by default
- Automatic translation and local-history preferences

Chrome requests access only to the configured API origin when settings are saved. The key is stored locally in `chrome.storage.local` and is not included in the source. The provider must support the OpenAI-compatible chat completions format; some providers may not support `response_format: {"type":"json_object"}`.

## Permissions

- `storage`: model settings and local reading records
- `contextMenus`: selection translation command
- `https://www.science.org/*`: selection interaction and the in-page popover on Science
- `optional_host_permissions`: the API origin requested when the user saves configuration

The extension does not request `<all_urls>`.

## Privacy

Science Reader does not collect browsing history, read entire papers, upload unselected page content, or include advertising, analytics, or third-party tracking. Model requests contain only the text explicitly selected by the user, the current page title and URL, and the required prompt. Processing by the configured model provider is also subject to that provider's privacy policy.

## Known limitations

- Version `0.1.0` injects the reading interface only on `science.org`.
- A user-provided compatible API and key are required for real model calls.
- Local history has no cloud sync or advanced search.
- In-progress selections are not preserved across browser restarts.
- Some OpenAI-compatible providers may require adapter changes.
- Site markup or Chrome extension behavior changes may require maintenance.

## Roadmap

1. Add explicit support for Nature, PubMed, and arXiv.
2. Add more model adapters and compatibility controls.
3. Improve normalization around citations, formulas, and tables.
4. Continue accessibility and keyboard-flow improvements without adding tracking.

## Contributing and security

See [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request. Report vulnerabilities according to [SECURITY.md](./SECURITY.md), not in a public issue. Changes are documented in [CHANGELOG.md](./CHANGELOG.md).

## License

Released under the [MIT License](./LICENSE).

## Disclaimer

This is an independent open-source project and is not affiliated with, endorsed by, or officially connected to Science, AAAS, Nature, OpenAI, or any model API provider.
