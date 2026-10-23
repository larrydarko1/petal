#!/usr/bin/env node
/**
 * package.json. Field order, the fields a manifest owes, and `^` ranges everywhere
 * live in @larrydarko/lint-config/gates/package-json.
 *
 * Petal is a Tauri app, so there is no `main`, `os` or `build` here: the entry point,
 * the targets and the bundle are tauri.conf.json's. `version` is still owed — the
 * app reads it from here.
 */
import { checkPackageJson } from '@larrydarko/lint-config/gates/package-json';

checkPackageJson({
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
});
