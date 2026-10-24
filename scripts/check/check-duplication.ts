#!/usr/bin/env node
/**
 * Duplication. jscpd counts copied token runs per format; the ceilings, the clone
 * size cap and the reasoning behind each live in
 * @larrydarko/lint-config/gates/duplication.
 *
 * The ceilings are slate's: a copied branch is how a fixed bug comes back, a copied
 * style block makes something look wrong rather than behave wrong. Petal is small
 * enough that it sits at zero today, so every ceiling is headroom, not a backlog.
 */
import { checkDuplication } from '@larrydarko/lint-config/gates/duplication';

checkDuplication({
    scan: ['src'],
    ceilings: {
        typescript: { limit: 4, note: 'logic — two copies of a branch is how a fixed bug comes back.' },
        scss: { limit: 8, note: 'presentation — a stale copy makes something look wrong rather than behave wrong.' },
        html: { limit: 6, note: 'SFC markup — structural repetition is often cheaper than another component.' },
    },
    maxCloneTokens: 160,
});
