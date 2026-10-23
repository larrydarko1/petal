#!/usr/bin/env node
/**
 * Dependency audit. `npm audit` alone fails on any high finding and offers no way to
 * waive one; this runs it and lets a reviewed waiver through until it expires. The
 * rules live in @larrydarko/lint-config/gates/audit.
 *
 * Only what ships is audited (`--omit=dev`): the webview's dependencies end up in the
 * bundle, the dev tools never leave this machine or CI. The Rust crates are not npm's
 * to audit.
 */
import { checkAudit } from '@larrydarko/lint-config/gates/audit';

checkAudit({
    allowlist: [
        // Each entry: { id, package, reason, expires }. The reason must say BOTH
        // why it cannot be fixed here and why it is unreachable in Petal's code.
    ],
});
