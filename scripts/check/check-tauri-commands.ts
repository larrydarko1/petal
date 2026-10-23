#!/usr/bin/env node
/**
 * Tauri commands — the chain between Rust and the webview, both ways: every command
 * registered, listed in build.rs, granted and invoked by its literal name; every event
 * emitted through a constant and listened for; every error code known to the bridge.
 * The rules live in @larrydarko/lint-config/gates/tauri-commands, whose defaults are
 * Petal's layout.
 */
import { checkTauriCommands } from '@larrydarko/lint-config/gates/tauri-commands';

checkTauriCommands();
