/**
 * The app window. Closing goes through `shouldClose`: Rust holds every close until the
 * webview answers, and the API destroys the window unless the answer kept it open.
 */
import { getCurrentWindow } from '@tauri-apps/api/window';

import type { Unlisten } from '@/bridge/events';

export async function guardWindowClose(shouldClose: () => Promise<boolean>): Promise<Unlisten> {
    return await getCurrentWindow().onCloseRequested(async (event) => {
        if (!(await shouldClose())) event.preventDefault();
    });
}
