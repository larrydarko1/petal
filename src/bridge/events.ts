/**
 * One subscribe function per event Rust emits. Each name matches its constant in
 * src-tauri/src/commands/.
 */
import { listen } from '@tauri-apps/api/event';

export type Unlisten = () => void;

/** `file:opened`: the OS opened a file in Petal while it was already running. */
export async function onFileOpened(handler: (path: string) => void): Promise<Unlisten> {
    return await listen<string>('file:opened', (event) => {
        handler(event.payload);
    });
}
