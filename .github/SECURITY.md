# Security Policy

## Security Architecture

Petal is a **local-first desktop application** for Linux (with macOS and Windows supported from source) and a fully offline architecture:

- ✅ **No server-side code** — no backend, no accounts, no sign-in, no attack surface behind an API
- ✅ **No network requests** — no data transmission, no telemetry, no tracking, no auto-update
- ✅ **Local-only storage** — documents are plain `.txt` files saved wherever you choose; Petal keeps no copy of them
- ✅ **Content Security Policy** — `default-src 'self'`, so scripts, styles and fonts come from the app bundle alone, and `connect-src` admits nothing but Tauri's IPC
- ✅ **No HTML rendering** — a document is edited in a plain `<textarea>`, so its contents are only ever text, never markup or script
- ✅ **Frozen prototype, no global API** — `freezePrototype` is on and `withGlobalTauri` is off, so the webview reaches Rust only through the plugin modules it imports
- ✅ **One window, one capability** — the [capability](../src-tauri/capabilities/main.json) grants the main window exactly what a text editor needs: read and write a text file, the open, save and message dialogs, the log, and Petal's one command. Nothing that runs programs is granted
- ✅ **Path containment** — the fs permissions carry no scope of their own; the only files the webview can read or write are the ones you picked in a dialog or opened through the OS
- ✅ **Errors without paths** — a Rust error crosses to the webview as a code; the OS message, which names a path on your disk, stays in the local log
- ✅ **Enforced in CI** — the invariants above are not conventions. The `tauri-security` gate in [larry.config.ts](../larry.config.ts) asserts the CSP, the frozen prototype, the absent global API and every capability and permission; `tauri-commands` follows each command from Rust to the bridge. Both run on every push
- ✅ **Open source** — fully auditable code

## Data Privacy

Petal has no application data directory of its own and no database. Your documents live only where
you save them, as `.txt` files you can read, move, back up or delete with any file manager.

The one thing Petal writes on its own is a rotating diagnostic log, capped at 1 MB with a single
backup:

- **Linux:** `~/.local/share/dev.larrydarko.petal/logs/`
- **macOS** (self-built): `~/Library/Logs/dev.larrydarko.petal/`
- **Windows** (self-built): `%LOCALAPPDATA%\dev.larrydarko.petal\logs\`

Your document contents never leave your device and are never written to the log.

## Reporting a Vulnerability

**Do not open a public issue.** Petal has no auto-update — installed copies stay on whatever version
the user downloaded until they choose to replace it. A public report is therefore a working
disclosure against every existing install, and unlike a web app there is no way to push the fix out.

Email the maintainer at <hello@larrydarko.dev> instead. Private reporting on GitHub is not enabled,
so email is the only private channel — reports sent any other way risk being public.

Please include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if applicable)

Expect an acknowledgement within a week. Petal is maintained by one person, so a fix timeline
depends on severity; you will be told which release carries the fix, and credited in it unless you
ask not to be.

## Scope

**A `.txt` file is untrusted input.** People share text files, and Petal opens them by double-click
via the OS file association. Anything a crafted file can do beyond putting text in the editor is in
scope — that is the primary threat model here.

In scope:

- Renderer code execution, including CSP bypass and any path from file contents to script execution
- Reaching a Tauri command, plugin or permission the capability does not grant
- Reading or writing a file outside what the user selected in a dialog or opened through the OS — a
  way to widen the fs scope, or a path that escapes it
- A file name or path passed on the command line that the app acts on beyond opening it
- Any navigation that lands the app window on a remote origin with IPC access

Out of scope: findings that require an attacker to already have the user's filesystem or OS account.
Documents are plain text under the user's own permissions by design, so "another local process can
read a document" is the threat model working as intended, not a vulnerability. Petal has no accounts
and no encryption-at-rest, and does not claim either.

Also out of scope: the missing code-signing certificate. Releases are unsigned, the OS warning on
first launch is expected, and the workaround is documented on the release page.

Dependency advisories with no reachable path in Petal's code are tracked in the audit gate's
allowlist ([larry.config.ts](../larry.config.ts)) rather than reported as vulnerabilities. Each
entry carries the reason it cannot be fixed here, and CI fails once the advisory stops being
reported — upstream shipped a fix, so the waiver has to go.

## Supported Versions

Security issues are fixed in the latest release only. There are no backports — upgrade is the
remediation path.

## Security Best Practices for Users

- Keep the app updated to the latest version — nothing will prompt you, so check the releases page
- Only download Petal from the official releases page
- Back up documents that matter; Petal keeps no version history of its own
- Use OS-level disk encryption if your documents are sensitive
