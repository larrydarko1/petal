#!/usr/bin/env node
/**
 * Tauri security — the settings the app's security is made of, none of which shows
 * when it is wrong: the CSP, the security flags, the capability list, one capability
 * per window, and what each grants. The rules live in
 * @larrydarko/lint-config/gates/tauri-security. Petal is the standard's own layout,
 * one `main` window under `src-tauri/`, so nothing stays here but the call.
 */
import { checkTauriSecurity } from '@larrydarko/lint-config/gates/tauri-security';

checkTauriSecurity();
