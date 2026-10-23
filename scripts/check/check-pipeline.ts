#!/usr/bin/env node
/**
 * CI/CD pipeline — timeouts, concurrency, least-privilege permissions, SHA-pinned
 * actions, pinned runners, `npm ci`, every gate wired in, and the rest. The rules live
 * in @larrydarko/lint-config/gates/pipeline; each fires on the step shape it is about
 * and is silent in a repo that has none. All that stays here is where the gates live.
 */
import { checkPipeline } from '@larrydarko/lint-config/gates/pipeline';

checkPipeline({ checksDir: 'scripts/check' });
