#!/usr/bin/env node
/**
 * Testing standards gate — the mechanically checkable half of the shared testing
 * standard. The rules live in @larrydarko/lint-config/gates/testing; what stays here
 * is this repo's answers.
 *
 * `layout: mirrored` — tests mirror `src/` under `tests/`, one directory per `src/`
 * directory that has logic. `consts/` and `assets/` hold data, so nothing mirrors them.
 *
 * `e2e: false` — a decision, not a gap. Driving the real window means WebDriver
 * through tauri-driver, which has no macOS support, and macOS is where Petal is
 * built. The bridge is tested against Tauri's own IPC mocks instead, the
 * composables and App against a mocked bridge. Adding E2E is raised first rather
 * than done.
 *
 * `excludes` carry the reason each path is not a coverage gap. The thresholds and
 * the exclude list only ever ratchet: up, and shorter.
 */
import { checkTesting } from '@larrydarko/lint-config/gates/testing';

checkTesting({
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
});
