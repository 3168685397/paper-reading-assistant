[English](./README.md) | [简体中文](./README.zh-CN.md)

# Paper Reading Assistant

A minimalist Chrome extension for translating and studying selected text in academic papers.

## Screenshot

<!-- Product screenshot placeholder: save a real, privacy-reviewed 1280×640 screenshot as docs/images/hero.png, then replace this comment with: ![Paper Reading Assistant in-page translation popover](./docs/images/hero.png) -->

## Quick Start

1. Download the latest Chrome ZIP from [GitHub Releases](https://github.com/3168685397/paper-reading-assistant/releases/latest).
2. Extract the ZIP file. The ZIP cannot be dragged directly into Chrome.
3. Open `chrome://extensions/`.
4. Enable **Developer mode**.
5. Click **Load unpacked**.
6. Select the extracted extension directory.
7. Open the extension settings and configure your own OpenAI-compatible API.

Users must provide their own compatible model API. The project does not include a public API key and is not currently published in the Chrome Web Store.

## Public Beta

Version `v0.1.0` is a public beta. Bug reports and focused feature suggestions are welcome in the [public beta feedback Issue](https://github.com/3168685397/paper-reading-assistant/issues/1).

Before submitting an Issue, remove API keys, private paper content, and personal information. The current version primarily targets `science.org`; Nature, PubMed, and arXiv are not officially supported yet.

## Core Features

- In-page selected-text translation on Science pages
- Draggable frosted-glass popover constrained to the visible viewport
- Chinese translation, core meaning, and original English in a clear reading order
- On-demand sentence structure and grammar analysis
- Context-aware academic vocabulary for Chinese learners
- Separate translation and grammar requests
- Configurable OpenAI-compatible API, model, key, and target language
- Up to 50 deduplicated local reading records with Markdown export
- Timeout, cancellation, retry, and readable network, authentication, rate-limit, and JSON errors

## API Setup

Open **Extension options** from the extension details page and configure:

- API Base URL, for example `https://api.openai.com/v1`
- OpenAI-compatible model name
- API key
- Translation language, Simplified Chinese by default
- Automatic translation and local-history preferences

Chrome requests access only to the configured API origin when settings are saved. The key is stored locally in `chrome.storage.local` and is never available to the Content Script. The provider must support the OpenAI-compatible chat completions format; some providers may not support `response_format: {"type":"json_object"}`.

## Development

Requirements:

- Node.js 20 or later
- pnpm 10 or later
- Chrome 116 or later

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm test
pnpm build
pnpm zip
```

The unpacked extension is generated at `.output/chrome-mv3/`. The package is generated as `.output/paper-reading-assistant-0.1.0-chrome.zip`.

Paper Reading Assistant uses WXT, React, strict TypeScript, Chrome Manifest V3, Zod, Vitest, Shadow DOM, Pointer Events, and native CSS. The Background Service Worker owns API access; the Content Script reads only explicitly selected text and renders the isolated in-page interface.

## Privacy and Permissions

Paper Reading Assistant does not collect browsing history, read entire papers, upload unselected page content, or include advertising, analytics, or third-party tracking. Model requests contain only the text explicitly selected by the user, the current page title and URL, and the required prompt. Processing by the configured provider is also subject to that provider's privacy policy.

Permissions:

- `storage`: model settings and local reading records
- `contextMenus`: selected-text translation command
- `https://www.science.org/*`: selection interaction and the in-page popover
- `optional_host_permissions`: the API origin requested when configuration is saved

The extension does not request `<all_urls>`.

## Known Limitations

- Version `0.1.0` primarily targets `science.org`.
- Nature, PubMed, and arXiv are not officially supported.
- PDF support is limited.
- A user-provided compatible model API and key are required.
- The extension is not available in the Chrome Web Store.
- Local history has no cloud sync or advanced search.
- Site markup or browser behavior changes may require maintenance.

The published `v0.1.0` attachment retains a legacy filename; see the [open-source display follow-up](./docs/OPEN_SOURCE_TODO.md). The artifact remains valid.

## Roadmap

Candidate areas include Nature, PubMed, and arXiv support, a better PDF workflow, interface language switching, vocabulary review, Markdown or Anki export, and improved error diagnostics. These are candidates, not delivery commitments.

See the public [v0.2.0 roadmap Issue](https://github.com/3168685397/paper-reading-assistant/issues/2).

## Contributing

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a Pull Request. Use the bilingual Issue templates for bugs and suggestions. Report security vulnerabilities privately according to [SECURITY.md](./SECURITY.md).

## License and Disclaimer

Released under the [MIT License](./LICENSE). Changes are documented in [CHANGELOG.md](./CHANGELOG.md).

This is an independent open-source project and is not affiliated with, endorsed by, or officially connected to Science, AAAS, Nature, OpenAI, or any model API provider.
