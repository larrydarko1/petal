import { clearMocks, mockIPC } from '@tauri-apps/api/mocks';
import { afterEach, describe, expect, it } from 'vitest';

import { takePendingFiles } from '@/bridge/commands';

/** What `invoke` rejects with when a command fails: its `Error` serialised, a bare code string. */
async function rejectWith(code: string): Promise<never> {
    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- copies Tauri, which rejects with the string
    return await Promise.reject(code);
}

afterEach(() => {
    clearMocks();
});

describe('takePendingFiles', () => {
    it('calls the command by its Rust name and returns its files', async () => {
        const calls: string[] = [];
        mockIPC((cmd) => {
            calls.push(cmd);
            return ['/notes/todo.txt'];
        });
        expect(await takePendingFiles()).toEqual({ success: true, data: ['/notes/todo.txt'] });
        expect(calls).toEqual(['take_pending_files']);
    });

    it('returns the code the command rejected with', async () => {
        // Not INTERNAL, the one code this command sends today: that is also the fallback, so it
        // would pass even if the bridge dropped the code.
        mockIPC(() => rejectWith('FILE_READ_FAILED'));
        expect(await takePendingFiles()).toEqual({ success: false, error: 'FILE_READ_FAILED' });
    });
});
