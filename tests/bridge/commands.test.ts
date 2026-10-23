import { clearMocks, mockIPC } from '@tauri-apps/api/mocks';
import { afterEach, describe, expect, it } from 'vitest';

import { takePendingFiles } from '@/bridge/commands';

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
        mockIPC(() => Promise.reject(new Error('INTERNAL')));
        expect(await takePendingFiles()).toEqual({ success: false, error: 'INTERNAL' });
    });
});
