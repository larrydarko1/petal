import { clearMocks, mockIPC } from '@tauri-apps/api/mocks';
import { afterEach, describe, expect, it } from 'vitest';

import { confirmWarning, showError } from '@/bridge/dialogs';

afterEach(() => {
    clearMocks();
});

describe('confirmWarning', () => {
    // `ask` is the message command with Yes/No buttons, so the window needs `dialog:allow-message` alone.
    it('returns whether the user pressed Yes', async () => {
        mockIPC((cmd) => (cmd === 'plugin:dialog|message' ? 'Yes' : null));
        expect(await confirmWarning('Discard?', 'Unsaved Changes')).toBe(true);
        mockIPC((cmd) => (cmd === 'plugin:dialog|message' ? 'No' : null));
        expect(await confirmWarning('Discard?', 'Unsaved Changes')).toBe(false);
    });

    it('counts a dialog that cannot open as no, so nothing is discarded unasked', async () => {
        mockIPC(() => Promise.reject(new Error('denied')));
        expect(await confirmWarning('Discard?', 'Unsaved Changes')).toBe(false);
    });
});

describe('showError', () => {
    it('shows an error message box', async () => {
        const payloads: unknown[] = [];
        mockIPC((cmd, payload) => {
            if (cmd === 'plugin:dialog|message') payloads.push(payload);
            return null;
        });
        await showError('The file could not be opened.');
        expect(payloads).toEqual([expect.objectContaining({ kind: 'error' })]);
    });

    it('resolves even when the message box cannot open', async () => {
        mockIPC((cmd) => (cmd === 'plugin:dialog|message' ? Promise.reject(new Error('denied')) : null));
        await expect(showError('The file could not be opened.')).resolves.toBeUndefined();
    });
});
