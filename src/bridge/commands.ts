/**
 * One typed function per Rust command. The name in `invoke` is the command's own, and the
 * type argument is a promise about what it returns: keep both in step with src-tauri/src/commands/.
 */
import { invoke } from '@tauri-apps/api/core';

import { toErrorCode, type CommandResult } from '@/bridge/errors';

/** The files the OS asked the app to open before the window was ready to listen. */
export async function takePendingFiles(): Promise<CommandResult<string[]>> {
    try {
        return { success: true, data: await invoke<string[]>('take_pending_files') };
    } catch (err: unknown) {
        // Rust logged it where it failed.
        return { success: false, error: toErrorCode(err) };
    }
}
