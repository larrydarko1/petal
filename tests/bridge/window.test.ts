import { emit } from '@tauri-apps/api/event';
import { clearMocks, mockIPC, mockWindows } from '@tauri-apps/api/mocks';
import { afterEach, describe, expect, it } from 'vitest';

import { guardWindowClose } from '@/bridge/window';

/** Mocks the main window and returns the commands it receives. */
function recordWindow(): string[] {
    const calls: string[] = [];
    mockWindows('main');
    mockIPC(
        (cmd) => {
            calls.push(cmd);
            return null;
        },
        { shouldMockEvents: true },
    );
    return calls;
}

afterEach(() => {
    clearMocks();
});

describe('guardWindowClose', () => {
    it('destroys the window when the guard allows it', async () => {
        const calls = recordWindow();
        await guardWindowClose(() => Promise.resolve(true));
        await emit('tauri://close-requested');
        await expect.poll(() => calls).toContain('plugin:window|destroy');
    });

    it('keeps the window open when the guard refuses', async () => {
        const calls = recordWindow();
        let asked = false;
        await guardWindowClose(() => {
            asked = true;
            return Promise.resolve(false);
        });
        await emit('tauri://close-requested');
        await expect.poll(() => asked).toBe(true);
        expect(calls).not.toContain('plugin:window|destroy');
    });
});
