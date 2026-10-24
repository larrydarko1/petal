#!/usr/bin/env node
/**
 * Refactoring markers. A `TODO` in the code is work nobody tracks; deferred work goes
 * in todo.md. ESLint covers the scripts and components, so this reads what it cannot: the
 * templates, the stylesheets, the configs and the Rust. The rules live in
 * @larrydarko/lint-config/gates/refactoring.
 */
import { checkRefactoring } from '@larrydarko/lint-config/gates/refactoring';

checkRefactoring();
