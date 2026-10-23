// The keyboard shortcuts: ⌘ (Ctrl elsewhere) with N, O, S and ⇧S, the same actions as the toolbar.
import { onMounted, onUnmounted } from 'vue';

export type ShortcutActions = {
    newFile: () => Promise<void>;
    openFile: () => Promise<void>;
    saveFile: () => Promise<void>;
    saveFileAs: () => Promise<void>;
};

/** The action a key press asks for, or `null` when it is not a shortcut. */
function actionFor(event: KeyboardEvent): keyof ShortcutActions | null {
    if (!event.metaKey && !event.ctrlKey) return null;
    const key = event.key.toLowerCase();
    if (key === 'n') return 'newFile';
    if (key === 'o') return 'openFile';
    if (key === 's') return event.shiftKey ? 'saveFileAs' : 'saveFile';
    return null;
}

export function useShortcuts(actions: ShortcutActions): void {
    function onKeydown(event: KeyboardEvent): void {
        const action = actionFor(event);
        if (action === null) return;
        event.preventDefault();
        // Each action reports its own failure to the user.
        void actions[action]();
    }

    onMounted(() => {
        window.addEventListener('keydown', onKeydown);
    });
    onUnmounted(() => {
        window.removeEventListener('keydown', onKeydown);
    });
}
