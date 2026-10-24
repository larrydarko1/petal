#!/usr/bin/env node
/**
 * Dead-code gate — the reachability half of "unused", which ESLint cannot see: it
 * reasons inside one file, and this asks knip whether anything in the repository
 * reaches a module at all. The passes, the categories and the reasoning behind each
 * live in @larrydarko/lint-config/gates/dead-code. Budgets are all zero and stay there.
 *
 * knip sees only the webview. A Rust command nothing invokes is the Tauri gates'
 * job, and a plugin that is only loaded from Rust — the JS half of a plugin the
 * window never calls — belongs under `ignoreDependencies` in knip.config.js with a
 * reason, not in a raised budget.
 */
import { checkDeadCode } from '@larrydarko/lint-config/gates/dead-code';

checkDeadCode({
    checksDir: 'scripts/check',
    notMachineChecked:
        'code reachable from an entry point but never reached at RUNTIME — a bridge function no component calls on any path the user can take, a shortcut no key reaches.',
});
