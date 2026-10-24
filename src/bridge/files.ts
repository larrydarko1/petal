/**
 * The dialog and fs plugins, for the one kind of file Petal edits. A path the user picks
 * is added to the fs scope by the dialog plugin, so the fs calls reach exactly those files.
 */
import { open, save } from '@tauri-apps/plugin-dialog';
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';

import type { CommandResult } from '@/bridge/errors';
import { log } from '@/bridge/log';

const TEXT_FILES = [{ name: 'Text Files', extensions: ['txt'] }];

/** The file the user picked to open, or `null` when they cancelled. */
export async function chooseFileToOpen(): Promise<CommandResult<string | null>> {
    try {
        return { success: true, data: await open({ filters: TEXT_FILES }) };
    } catch (err: unknown) {
        log.error('Open dialog failed', { err });
        return { success: false, error: 'DIALOG_FAILED' };
    }
}

/** Where the user chose to save, or `null` when they cancelled. */
export async function chooseFileToSave(defaultPath: string): Promise<CommandResult<string | null>> {
    try {
        return { success: true, data: await save({ filters: TEXT_FILES, defaultPath }) };
    } catch (err: unknown) {
        log.error('Save dialog failed', { err });
        return { success: false, error: 'DIALOG_FAILED' };
    }
}

export async function readFile(path: string): Promise<CommandResult<string>> {
    try {
        return { success: true, data: await readTextFile(path) };
    } catch (err: unknown) {
        log.error('File read failed', { err });
        return { success: false, error: 'FILE_READ_FAILED' };
    }
}

export async function writeFile(path: string, content: string): Promise<CommandResult<null>> {
    try {
        await writeTextFile(path, content);
        return { success: true, data: null };
    } catch (err: unknown) {
        log.error('File write failed', { err });
        return { success: false, error: 'FILE_WRITE_FAILED' };
    }
}
