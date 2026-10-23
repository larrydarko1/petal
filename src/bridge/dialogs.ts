/**
 * The native message boxes: a question before losing work, and the error the user is told about.
 */
import { ask, message } from '@tauri-apps/plugin-dialog';

import { log } from '@/bridge/log';

/** Whether the user agreed. A dialog that fails to open counts as no, so nothing is lost unasked. */
export async function confirmWarning(text: string, title: string): Promise<boolean> {
    try {
        return await ask(text, { title, kind: 'warning' });
    } catch (err: unknown) {
        log.error('Confirm dialog failed', { err });
        return false;
    }
}

export async function showError(text: string): Promise<void> {
    try {
        await message(text, { title: 'Petal', kind: 'error' });
    } catch (err: unknown) {
        // The failure itself was logged where it happened; this only loses the notice of it.
        log.error('Error dialog failed', { err });
    }
}
