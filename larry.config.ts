// The gates `larry check` runs, and each one's options. The editor lists every option a gate takes.
import { defineConfig } from '@larrydarko/lint-config/config';

export default defineConfig({
    family: 'tauri',
    gates: {
        // Only what ships is audited: the webview's dependencies end up in the bundle, the dev tools never
        // leave this machine or CI. The Rust crates are not npm's to audit.
        'audit': {
            allowlist: [
                // Each entry: { id, package, reason, expires }. The reason must say BOTH
                // why it cannot be fixed here and why it is unreachable in Petal's code.
            ],
        },
        // Headers, mapped to this layout: a bridge module is the webview's `api/` module for one Tauri
        // surface and says which; a composable owns state or lifecycle and says what; a component's contract
        // is its props, so it carries none. In the crate, `lib.rs` opens with `//!`, a command domain says
        // what it owns, and `commands.rs` only declares its children.
        'code-style': {
            scan: ['src', 'src-tauri/src', 'src-tauri/build.rs'],
            casing: [
                { files: /\.vue$/, style: 'pascal' },
                { files: /\.ts$/, style: 'camel' },
            ],
            headers: [
                { files: /^src\/bridge\/.*\.ts$/, require: 'comment' },
                { files: /^src\/composables\/.*\.ts$/, require: 'comment' },
                { files: /\.vue$/, require: 'none' },
                { files: /^src-tauri\/src\/commands\/.*\.rs$/, require: 'rustdoc' },
            ],
        },
        // Text is the three text tokens on the two surfaces. The accent only fills shapes and the translucent
        // hover and selection washes sit under text already measured, so none of them is measured here.
        'contrast': {
            themes: {
                source: 'scss-maps',
                file: 'src/styles/_variables.scss',
                reference: 'default',
                emitFile: 'src/styles/_theme.scss',
                mixinFile: 'src/styles/_theme.scss',
            },
            text: ['text', 'text-muted', 'placeholder'],
            backgrounds: ['bg', 'surface'],
            scan: ['src'],
        },
        // knip sees only the webview. A Rust command nothing invokes is the Tauri gates' job, and a plugin
        // only loaded from Rust belongs under `ignoreDependencies` in knip.config.js with a reason, never in
        // a raised budget. Budgets are all zero and stay there.
        'dead-code': {
            notMachineChecked:
                'code reachable from an entry point but never reached at RUNTIME — a bridge function no component calls on any path the user can take, a shortcut no key reaches.',
        },
        // Petal is one package with no path into the repo besides `@/`, so imports get three groups: builtin,
        // external, local. The crate's `.rs` files get the Rust table; `build.rs` is named on its own so the
        // walk never enters `src-tauri/target/`. Rust's imports are rustfmt's to sort.
        'declaration-order': { sourceRoots: ['src', 'tests', 'src-tauri/src', 'src-tauri/build.rs'] },
        // Slate's ceilings: a copied branch is how a fixed bug comes back, a copied style block makes
        // something look wrong. Petal sits at zero, so every ceiling is headroom, not a backlog.
        'duplication': {
            scan: ['src'],
            ceilings: {
                typescript: { limit: 4, note: 'logic — two copies of a branch is how a fixed bug comes back.' },
                scss: {
                    limit: 8,
                    note: 'presentation — a stale copy makes something look wrong rather than behave wrong.',
                },
                html: { limit: 6, note: 'SFC markup — structural repetition is often cheaper than another component.' },
            },
            maxCloneTokens: 160,
        },
        // Petal is a window, not a page: nothing crawls it, so no description, Open Graph or canonical URL.
        // No CSP meta: the policy is tauri.conf.json's, which Tauri injects into every page it serves.
        'html-standards': {
            indexHtml: 'index.html',
            baseScss: 'src/styles/_base.scss',
            require: ['lang', 'charset', 'appMount', 'viewport', 'title'],
        },
        'i18n': { skip: 'English only: the UI is four button labels and a handful of dialog messages.' },
        // The source is public under MIT, so the shipped webview's dependencies need only be open-licensed.
        'licenses': { distribution: 'open' },
        // A Tauri app has no `main`, `os` or `build`: the entry point, the targets and the bundle are
        // tauri.conf.json's. `version` is still owed: the app reads it from here.
        'package-json': {
            rootRequired: [
                'name',
                'version',
                'description',
                'keywords',
                'homepage',
                'bugs',
                'license',
                'author',
                'repository',
                'type',
                'engines',
                'private',
                'packageManager',
            ],
            tildeAllowed: {
                typescript:
                    'Its minor releases introduce new type errors, so a minor bump is a code change, not a dependency bump.',
            },
        },
        'pipeline': {},
        'refactoring': {},
        // One palette, `default`, as a map in _variables.scss that _theme.scss emits. The theme machinery
        // waits for a second palette and costs one selector until then.
        'scss-standards': {
            styles: 'src/styles',
            src: 'src',
            mainScript: 'src/main.ts',
            viteConfigs: ['vite.config.ts'],
            injectedSpecifier: '@/styles/variables',
            emitters: [
                {
                    module: 'theme',
                    why: 'The palette is CSS custom properties. Un-@used, every `$color-*` in the app resolves to nothing.',
                },
                {
                    module: 'base',
                    why: '_base.scss carries the reset, the document shell and the reduced-motion override. Un-@used, none of it reaches the bundle.',
                },
            ],
            themes: {
                source: 'scss-maps',
                file: 'src/styles/_variables.scss',
                reference: 'default',
                emitFile: 'src/styles/_theme.scss',
                mixinFile: 'src/styles/_theme.scss',
            },
            html: ['index.html'],
        },
        'secrets': {},
        // `e2e: false` is a decision, not a gap: driving the real window means WebDriver through
        // tauri-driver, which has no macOS support, and macOS is where Petal is built. The bridge is tested
        // against Tauri's IPC mocks, the composables and App against a mocked bridge. Raise adding E2E before
        // doing it. Thresholds and excludes only ratchet: up, and shorter.
        'testing': {
            config: 'vitest.config.ts',
            layout: { kind: 'mirrored', root: 'tests', areas: ['bridge', 'composables'] },
            e2e: false,
            thresholds: { statements: 80, branches: 80, functions: 80, lines: 80 },
            excludes: {
                'src/main.ts': 'the bootstrap — mounts the app on a real #app, which the suites never have',
                'src/**/*.d.ts': 'declarations, no runtime',
            },
            domEnvironment: { name: 'jsdom', config: 'vitest.config.ts' },
            vmBaseline: 0,
        },
        // The webview is a browser program: nothing in src/ may reach for Node, because nothing in the window
        // provides it.
        'tsconfigs': {
            nodeTyped: ['tsconfig.node.json'],
            browserProjects: ['tsconfig.app.json'],
            browserSources: ['src'],
        },
        'tauri-security': {},
        'tauri-commands': {},
        'error-handling/tauri': {},
    },
});
