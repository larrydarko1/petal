#!/usr/bin/env node
/**
 * Declaration order. The canonical order of a module's top-level statements, the
 * separate table a test file is read against, and the import-sorting pass behind
 * `--fix` all live in @larrydarko/lint-config/gates/declaration-order.
 *
 * What stays here is the scope: the webview, its tests, the gates and the crate.
 * Petal is a single package with no tsconfig path into the repo besides `@/`, so
 * imports get three groups — builtin → external → local. The crate's `.rs` files get
 * the Rust table and its `use` groups instead; `build.rs` is named on its own, so the
 * walk never enters `src-tauri/target/`.
 *
 * Run `node scripts/check/check-declaration-order.ts --fix` to rewrite the import
 * block in place. That is the only pass with a fixer, because it is the only one
 * whose fix cannot change what a module does. Rust's imports are rustfmt's to sort.
 */
import { checkDeclarationOrder } from '@larrydarko/lint-config/gates/declaration-order';

checkDeclarationOrder({ sourceRoots: ['src', 'tests', 'scripts', 'src-tauri/src', 'src-tauri/build.rs'] });
