/**
 * Petal's ESLint config. The shared base and the Tauri family — the webview reaches Rust
 * only through src/bridge/ — come from @larrydarko/lint-config. What stays here is the
 * composition of the last-match-wins rules over Petal's one source tree.
 */
import { larry } from '@larrydarko/lint-config/eslint';
import {
    tauriStandards,
    bannedCryptoModules,
    loggerCallSelectors,
    errorHandlingSelectors,
    tsSourceSelectors,
    noImportMetaEnv,
    noSingleLetterDeclaration,
    webviewBannedImports,
    noStoreLibraryPatterns,
    noToastLibraryPatterns,
    aliasOnlyImportPatterns,
    functionContractsPlugin,
} from '@larrydarko/lint-config/eslint/tauri';

const SOURCE = ['src/**/*.{ts,vue}'];

export default larry({
    preset: 'tauri',
    rootDir: import.meta.dirname,
    testProject: './tsconfig.test.json',

    // Petal ships in English only: there are no locale files for the i18n rules to read.
    standards: tauriStandards({ i18n: false }),

    overrides: [
        // One block per rule: `no-restricted-syntax` and `no-restricted-imports` are last-match-wins.
        {
            files: SOURCE,
            rules: {
                'no-restricted-syntax': [
                    'error',
                    ...loggerCallSelectors,
                    ...errorHandlingSelectors,
                    noImportMetaEnv,
                    ...tsSourceSelectors,
                    noSingleLetterDeclaration,
                ],
            },
        },
        {
            files: SOURCE,
            rules: {
                'no-restricted-imports': [
                    'error',
                    {
                        paths: bannedCryptoModules,
                        patterns: [
                            ...webviewBannedImports.patterns,
                            ...noStoreLibraryPatterns,
                            ...noToastLibraryPatterns,
                            ...aliasOnlyImportPatterns,
                        ],
                    },
                ],
            },
        },

        // ── Function contracts — the name must match what the signature promises ─
        {
            files: SOURCE,
            plugins: { contracts: functionContractsPlugin },
            rules: {
                'contracts/name-contract': 'error',
                'contracts/one-failure-channel': 'error',
                'contracts/no-undefined-hole': 'error',
                'contracts/no-boolean-flag': 'error',
                'no-nested-ternary': 'error',
            },
        },
    ],
});
