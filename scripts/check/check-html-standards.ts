#!/usr/bin/env node
/**
 * The document shell. What index.html owes and the global reduced-motion override
 * live in @larrydarko/lint-config/gates/html-standards.
 *
 * Petal is a window, not a page: no description, Open Graph or canonical URL, since
 * nothing crawls it. No CSP meta either — the policy is tauri.conf.json's, which Tauri
 * injects into every page it serves, so a meta tag here would be a second copy.
 */
import { checkHtmlStandards } from '@larrydarko/lint-config/gates/html-standards';

checkHtmlStandards({
    indexHtml: 'index.html',
    baseScss: 'src/styles/_base.scss',
    require: ['lang', 'charset', 'appMount', 'viewport', 'title'],
});
