#!/usr/bin/env node
/**
 * Code style — what Prettier and ESLint cannot see: file length, file-name casing,
 * which files owe a header comment, and comment style in templates and stylesheets.
 * The rules live in @larrydarko/lint-config/gates/code-style.
 *
 * Headers follow the standard's table, mapped to this layout: a bridge module is the
 * webview's `api/` module for one Tauri surface, so it opens with a line saying which;
 * a composable owns state or lifecycle, so it says what; a component's contract is its
 * props, so it carries none. Petal's Rust is not scanned — rustdoc and the Rust gates
 * cover it.
 */
import { checkCodeStyle } from '@larrydarko/lint-config/gates/code-style';

checkCodeStyle({
    scan: ['src'],
    casing: [
        { files: /\.vue$/, style: 'pascal' },
        { files: /\.ts$/, style: 'camel' },
    ],
    headers: [
        { files: /^src\/bridge\/.*\.ts$/, require: 'comment' },
        { files: /^src\/composables\/.*\.ts$/, require: 'comment' },
        { files: /\.vue$/, require: 'none' },
    ],
});
