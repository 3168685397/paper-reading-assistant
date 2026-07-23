[English](./README.md) | [简体中文](./README.zh-CN.md)

# Paper Reading Assistant

A minimalist Chrome extension for translating and studying selected English text on websites.

## Screenshot

<!-- Save a real, privacy-reviewed 1280×640 screenshot as docs/images/hero.png, then replace this comment with: ![Paper Reading Assistant translation popover](./docs/images/hero.png) -->

## Quick Start

1. Download the Chrome ZIP from GitHub Releases.
2. Extract the ZIP; it cannot be installed by dragging the ZIP into Chrome.
3. Open `chrome://extensions/`, enable **Developer mode**, and click **Load unpacked**.
4. Select the extracted extension directory.
5. Open extension settings and configure your own OpenAI-compatible API.
6. Click **Enable on all websites** and approve access to normal HTTP/HTTPS pages.

The project includes no public API key and is not currently in the Chrome Web Store.

## Core Features

- Selected-English-text translation on ordinary HTTP and HTTPS websites
- Selection support for standard DOM text, open Shadow DOM, contenteditable, textarea, and text input
- Button, automatic, and disabled selection modes; button mode is the default
- Draggable, viewport-constrained Shadow DOM popover
- Chinese translation, core meaning, original English, sentence structure, grammar, and academic vocabulary
- Domain-only exclusion list
- Configurable OpenAI-compatible API and up to 50 local reading records

## API Setup

Configure the API base URL, model, API key, and target language in extension settings. The provider must support OpenAI-compatible chat completions. API keys stay in trusted extension storage and model requests run only in the Background Service Worker.

By default, model payloads contain only explicitly selected text and the required prompt. Sending the page title and URL is an explicit, off-by-default option.

## Development

Requires Node.js 20+, pnpm 10+, and Chrome 116+.

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm test
pnpm build
pnpm zip
```

The unpacked extension is generated at `.output/chrome-mv3/`. The production package is `.output/paper-reading-assistant-0.2.0-chrome.zip`.

## Privacy and Permissions

Paper Reading Assistant reads only text the user explicitly selects. It does not read entire pages, forms, or password fields; collect browsing history; inject advertising; or include analytics or a public API key.

- `storage`: trusted model settings, domain exclusions, and local reading records
- `contextMenus`: selected-text command
- `scripting`: runtime registration after permission is granted
- optional `http://*/*` and `https://*/*`: requested only when the user enables website access
- an API origin: requested when API configuration is saved

Content Scripts cannot read the API key. Exclusions store hostnames only, not full URLs. Revoking website access unregisters the Content Script.

## Known Limitations

- Browser internal pages, extension pages, the Chrome Web Store, `file://`, FTP, `view-source:`, and other protected pages are unsupported.
- Text rendered only in images or canvas requires future OCR support.
- Browser PDF viewers may restrict injection or selection behavior.
- A cross-origin iframe popover remains inside that iframe's viewport.
- Closed Shadow DOM selections are not observable.
- A user-provided compatible model API is required.

## Public Beta

Version `v0.2.0` is under development on a feature branch and is not released yet. Testing should cover academic sites, news, blogs, tables, SPAs, multi-column layouts, form controls, iframes, dark pages, and long selections. Remove API keys, private text, and personal information before sharing reports.

## Roadmap

Candidates include improved PDF workflows, OCR, interface language switching, vocabulary review, export, and better diagnostics. No delivery date is promised.

## Contributing

Read [CONTRIBUTING.md](./CONTRIBUTING.md). Report vulnerabilities privately according to [SECURITY.md](./SECURITY.md).

## License and Disclaimer

Released under the [MIT License](./LICENSE). See [CHANGELOG.md](./CHANGELOG.md).

This is an independent open-source project and is not affiliated with, endorsed by, or officially connected to Science, AAAS, Nature, OpenAI, or any model API provider.
