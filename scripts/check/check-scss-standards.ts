#!/usr/bin/env node
/**
 * SCSS architecture — the barrel, the injected tokens that emit nothing, the
 * palette, and no remote fonts. The rules live in
 * @larrydarko/lint-config/gates/scss-standards; what stays here is where Petal
 * keeps each piece.
 *
 * One palette, `default`, as a map in _variables.scss that _theme.scss emits. The
 * theme machinery is there for when a second palette arrives, and costs one
 * selector until then.
 */
import { checkScssStandards } from '@larrydarko/lint-config/gates/scss-standards';

checkScssStandards({
    styles: 'src/styles',
    src: 'src',
    mainScript: 'src/main.ts',
    viteConfigs: ['vite.config.ts'],
    injectedSpecifier: '@/styles/variables',
    emitters: [
        {
            module: 'theme',
            why: 'The palette is CSS custom properties. Un-@used, every `$color-*` in the app resolves to nothing.',
        },
        {
            module: 'base',
            why: '_base.scss carries the reset, the document shell and the reduced-motion override. Un-@used, none of it reaches the bundle.',
        },
    ],
    themes: {
        source: 'scss-maps',
        file: 'src/styles/_variables.scss',
        reference: 'default',
        emitFile: 'src/styles/_theme.scss',
        mixinFile: 'src/styles/_theme.scss',
    },
    html: ['index.html'],
});
