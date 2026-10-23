import type { InvokeArgs } from '@tauri-apps/api/core';
import { clearMocks, mockIPC } from '@tauri-apps/api/mocks';
import { afterEach, describe, expect, it } from 'vitest';

import { log } from '@/bridge/log';

/** The payload of every `plugin:log|log` call. */
function recordLogs(): (InvokeArgs | undefined)[] {
    const logs: (InvokeArgs | undefined)[] = [];
    mockIPC((cmd, payload) => {
        if (cmd === 'plugin:log|log') logs.push(payload);
        return null;
    });
    return logs;
}

afterEach(() => {
    clearMocks();
});

describe('log', () => {
    it('sends a constant message with its fields as string key-values', async () => {
        const logs = recordLogs();
        log.warn('File not found', { path: '/notes/todo.txt', attempt: 2, options: { retry: true } });
        await Promise.resolve();
        expect(logs[0]).toMatchObject({
            message: 'File not found',
            keyValues: { path: '/notes/todo.txt', attempt: '2', options: '{"retry":true}' },
        });
    });

    it('writes an Error as its stack, so the line says where it was thrown', async () => {
        const logs = recordLogs();
        const err = new Error('boom');
        log.error('Save failed', { err });
        await Promise.resolve();
        expect(logs[0]).toMatchObject({ keyValues: { err: err.stack } });
    });

    it('marks a field it cannot serialise instead of dropping the line', async () => {
        const logs = recordLogs();
        const cyclic: Record<string, unknown> = {};
        cyclic['self'] = cyclic;
        log.info('Loaded', { cyclic });
        await Promise.resolve();
        expect(logs[0]).toMatchObject({ keyValues: { cyclic: '[unserialisable]' } });
    });

    it('swallows a failure of the log itself', async () => {
        mockIPC(() => Promise.reject(new Error('log plugin missing')));
        expect(() => {
            log.error('Anything');
        }).not.toThrow();
        await Promise.resolve();
    });
});
