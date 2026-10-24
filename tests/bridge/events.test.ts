import { emit } from '@tauri-apps/api/event';
import { clearMocks, mockIPC } from '@tauri-apps/api/mocks';
import { afterEach, describe, expect, it } from 'vitest';

import { onFileOpened } from '@/bridge/events';

afterEach(() => {
    clearMocks();
});

describe('onFileOpened', () => {
    it('hands the handler the path Rust emitted on file:opened', async () => {
        mockIPC(() => null, { shouldMockEvents: true });
        const paths: string[] = [];
        const unlisten = await onFileOpened((path) => paths.push(path));
        await emit('file:opened', '/notes/todo.txt');
        unlisten();
        await emit('file:opened', '/notes/ignored.txt');
        expect(paths).toEqual(['/notes/todo.txt']);
    });
});
