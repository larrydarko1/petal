#!/usr/bin/env node
/**
 * tsconfigs. Strictness lives in tsconfig.base.json and nowhere else; each project
 * config only describes its environment. The rules live in
 * @larrydarko/lint-config/gates/tsconfigs.
 *
 * The webview is a browser program: nothing in src/ may reach for Node, because
 * nothing in the window provides it. The tool configs and the gates run in Node.
 */
import { checkTsconfigs } from '@larrydarko/lint-config/gates/tsconfigs';

checkTsconfigs({
    nodeTyped: ['tsconfig.node.json', 'tsconfig.scripts.json'],
    browserProjects: ['tsconfig.app.json'],
    browserSources: ['src'],
});
