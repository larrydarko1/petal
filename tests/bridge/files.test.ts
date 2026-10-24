import type { InvokeArgs } from '@tauri-apps/api/core';
import { clearMocks, mockIPC } from '@tauri-apps/api/mocks';
import { afterEach, describe, expect, it } from 'vitest';

import { chooseFileToOpen, chooseFileToSave, readFile, writeFile } from '@/bridge/files';

type Call = { cmd: string; payload: InvokeArgs | undefined };

/** Records every IPC call, answering each command from `replies` and rejecting the rest. */
function recordIpc(replies: Record<string, unknown>): Call[] {
    const calls: Call[] = [];
    mockIPC((cmd, payload) => {
        calls.push({ cmd, payload });
        if (cmd === 'plugin:log|log') return null;
        if (cmd in replies) return replies[cmd];
        return Promise.reject(new Error(`forbidden path: /Users/someone/${cmd}`));
    });
    return calls;
}

afterEach(() => {
    clearMocks();
});

describe('readFile', () => {
    it('reads the file through the fs plugin', async () => {
        const calls = recordIpc({ 'plugin:fs|read_text_file': [...new TextEncoder().encode('hello')] });
        expect(await readFile('/notes/todo.txt')).toEqual({ success: true, data: 'hello' });
        expect(calls[0]?.payload).toMatchObject({ path: '/notes/todo.txt' });
    });

    it('logs the plugin’s rejection and returns a code instead of its English', async () => {
        const calls = recordIpc({});
        expect(await readFile('/notes/todo.txt')).toEqual({ success: false, error: 'FILE_READ_FAILED' });
        expect(calls.find((call) => call.cmd === 'plugin:log|log')?.payload).toMatchObject({
            message: 'File read failed',
        });
    });
});

describe('writeFile', () => {
    it('writes the text through the fs plugin', async () => {
        const calls = recordIpc({ 'plugin:fs|write_text_file': null });
        expect(await writeFile('/notes/todo.txt', 'hello')).toEqual({ success: true, data: null });
        expect(calls[0]?.cmd).toBe('plugin:fs|write_text_file');
    });

    it('returns FILE_WRITE_FAILED when the plugin rejects', async () => {
        recordIpc({});
        expect(await writeFile('/notes/todo.txt', 'hello')).toEqual({ success: false, error: 'FILE_WRITE_FAILED' });
    });
});

describe('file dialogs', () => {
    it('returns the path the user picked, offering text files only', async () => {
        const calls = recordIpc({ 'plugin:dialog|open': '/notes/todo.txt' });
        expect(await chooseFileToOpen()).toEqual({ success: true, data: '/notes/todo.txt' });
        expect(calls[0]?.payload).toMatchObject({
            options: { filters: [{ name: 'Text Files', extensions: ['txt'] }] },
        });
    });

    it('returns null when the user cancels', async () => {
        recordIpc({ 'plugin:dialog|save': null });
        expect(await chooseFileToSave('untitled.txt')).toEqual({ success: true, data: null });
    });

    it('returns DIALOG_FAILED when a dialog cannot open', async () => {
        recordIpc({});
        expect(await chooseFileToOpen()).toEqual({ success: false, error: 'DIALOG_FAILED' });
        expect(await chooseFileToSave('untitled.txt')).toEqual({ success: false, error: 'DIALOG_FAILED' });
    });
});
