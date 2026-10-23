# Petal

![License](https://img.shields.io/github/license/larrydarko1/Petal)
![Issues](https://img.shields.io/github/issues/larrydarko1/Petal)
![Pull Requests](https://img.shields.io/github/issues-pr/larrydarko1/Petal)

If you find Petal useful, consider [giving it a star ⭐](https://github.com/larrydarko1/Petal) — thank you!

Petal is a **minimal plain-text editor** for desktop, built with [Tauri 2](https://v2.tauri.app/), [Vue 3](https://vuejs.org/), and **TypeScript**. Open, edit, and save `.txt` files — nothing more. No tabs, no plugins, no bloat.

# Demo

![Petal Demo](src/assets/demo.png)

## Features

- **New / Open / Save / Save As** — standard file operations via native OS dialogs
- **Unsaved changes prompt** — warns before discarding edits
- **Keyboard shortcuts** — `⌘/Ctrl+N`, `⌘/Ctrl+O`, `⌘/Ctrl+S`, `⌘/Ctrl+Shift+S`
- **Dark mode** — follows system preference automatically
- **Draggable toolbar** — native window drag region
- **Cross-platform** — macOS, Windows, Linux

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS)
- [Rust](https://www.rust-lang.org/tools/install)
- [Tauri v2 prerequisites](https://v2.tauri.app/start/prerequisites/) for your OS

## Getting Started

1. **Clone the repository**

```sh
git clone https://github.com/larrydarko1/Petal.git
cd Petal
```

2. **Install dependencies**

```sh
npm install
```

3. **Run in development mode**

```sh
npm run dev
```

## Testing & Code Quality

```sh
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint source code
npm run lint

# Auto-fix lint issues
npm run lint:fix

# Check formatting
npm run format:check

# Auto-format source code
npm run format

# Lint styles
npm run stylelint

# Rust: format check, Clippy, tests
npm run rust:fmt
npm run rust:lint
npm run rust:test
```

Tests live in `tests/`, mirroring `src/`. The standards ESLint cannot see — dead code, declaration order, duplication, the SCSS architecture, the CI pipeline itself and more — are checked by the gates in `scripts/check/`, each with a `<domain>:check` script (`npm run dead:check`, `npm run scss:check`, …). Three are Tauri's: `security:check` reads the CSP and the capabilities, `commands:check` follows each command from Rust to the bridge, and `error:check` covers failures on both sides. The order and code-style gates read the Rust too.

The CI pipeline runs the audit, lint, format check, stylelint, every gate, type-check, tests with coverage, the webview build, and then the Rust checks — use `npm run ci:check` to run the full sequence locally.

## Building for Production

```sh
# Build for your current platform
npm run tauri:build
```

Built installers are output to `src-tauri/target/release/bundle/`:

- **macOS:** `.dmg` installer + `.app` bundle
- **Windows:** `.exe` installer (NSIS) + `.msi`
- **Linux:** `.deb`, `.AppImage`

## Tech Stack

- **Desktop:** Tauri 2 (native macOS, Windows, Linux app)
- **Frontend:** Vue 3, TypeScript, SCSS
- **Backend:** Rust — the official fs, dialog and log plugins, and one command for files the OS opens
- **Build tool:** [Vite](https://vitejs.dev)
- **Testing:** [Vitest](https://vitest.dev) + [Vue Test Utils](https://test-utils.vuejs.org)
- **Linting:** [@larrydarko/lint-config](https://www.npmjs.com/package/@larrydarko/lint-config) (ESLint's Tauri family, Prettier, commitlint) + Clippy and rustfmt

## Project Structure

```
petal/
├── src/                        # Vue 3 webview
│   ├── bridge/                 # The only code that imports @tauri-apps/*
│   │   ├── commands.ts         # One typed function per Rust command
│   │   ├── dialogs.ts          # Confirm and error message boxes
│   │   ├── errors.ts           # ERROR_CODES and CommandResult
│   │   ├── events.ts           # One subscribe function per event Rust emits
│   │   ├── files.ts            # File pickers, read and write
│   │   ├── log.ts              # The webview's logger (same file as Rust's)
│   │   └── window.ts           # The unsaved-changes guard on close
│   ├── composables/
│   │   ├── useDocument.ts      # The open document and its file operations
│   │   └── useShortcuts.ts     # ⌘N, ⌘O, ⌘S, ⌘⇧S
│   ├── consts/
│   │   └── errorMessages.ts    # What the user reads for each error code
│   ├── App.vue                 # The editor window
│   ├── main.ts                 # Vue app entry point
│   ├── styles/
│   │   ├── index.scss          # The global stylesheet, imported once by main.ts
│   │   ├── _variables.scss     # Tokens and the palette; injected into every SFC, emits nothing
│   │   ├── _theme.scss         # The palette as CSS custom properties
│   │   └── _base.scss          # Reset, document shell, scrollbar, reduced motion
│   └── assets/
│       ├── demo.png            # Demo screenshot
│       └── icon.svg            # App icon source (npm run icons:generate)
├── src-tauri/                  # Tauri / Rust
│   ├── src/
│   │   ├── main.rs             # Calls petal_lib::run()
│   │   ├── lib.rs              # The builder: plugins, state, commands, files opened by the OS
│   │   ├── error.rs            # The Error every command returns, sent as a code
│   │   ├── logger.rs           # tauri-plugin-log, with structured fields
│   │   └── commands/file.rs    # take_pending_files
│   ├── capabilities/
│   │   └── main.json           # What the main window may call
│   ├── icons/                  # App icons for all platforms
│   ├── build.rs                # The command allowlist
│   ├── Cargo.toml              # Rust dependencies and Clippy lints
│   └── tauri.conf.json         # Tauri configuration, CSP included
├── tests/                      # Vitest suites, mirroring src/
├── scripts/check/              # The standards gates, from @larrydarko/lint-config
├── .github/
│   └── workflows/
│       ├── ci.yml              # CI pipeline (lint, type-check, test, build, Rust checks)
│       └── release.yml         # Release / distribution workflow
├── .husky/                     # Git hooks (pre-commit, commit-msg)
├── eslint.config.js            # ESLint, from @larrydarko/lint-config
├── stylelint.config.js         # Stylelint, from @larrydarko/lint-config
├── knip.config.js              # What the dead-code gate treats as an entry point
├── vite.config.ts              # Vite build configuration
├── vitest.config.ts            # Vitest test configuration
└── tsconfig.*.json             # TypeScript projects: app, node (tool configs), test, scripts
```

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
