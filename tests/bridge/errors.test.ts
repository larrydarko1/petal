import { describe, expect, it } from 'vitest';

import { toErrorCode } from '@/bridge/errors';

describe('toErrorCode', () => {
    it('keeps a code Rust sent', () => {
        expect(toErrorCode('FILE_READ_FAILED')).toBe('FILE_READ_FAILED');
    });

    it('turns anything else into INTERNAL, so no English reaches the UI', () => {
        expect(toErrorCode('No such file or directory (os error 2)')).toBe('INTERNAL');
        expect(toErrorCode(new Error('boom'))).toBe('INTERNAL');
        expect(toErrorCode(undefined)).toBe('INTERNAL');
    });
});
