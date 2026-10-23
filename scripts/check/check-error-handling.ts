#!/usr/bin/env node
/**
 * Error handling at the app's boundaries: a failing command logs its own failure and
 * the bridge does not log it twice, a panic hook writes a panic to the log, and every
 * swallowed failure, in Rust or the webview, states its reason. The rules live in
 * @larrydarko/lint-config/gates/error-handling/tauri.
 */
import { checkTauriErrorHandling } from '@larrydarko/lint-config/gates/error-handling/tauri';

checkTauriErrorHandling();
