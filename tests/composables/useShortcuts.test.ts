import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';

import { useShortcuts, type ShortcutActions } from '@/composables/useShortcuts';

function mountShortcuts(): { actions: ShortcutActions; unmount: () => void } {
    const actions: ShortcutActions = {
        newFile: vi.fn(() => Promise.resolve()),
        openFile: vi.fn(() => Promise.resolve()),
        saveFile: vi.fn(() => Promise.resolve()),
        saveFileAs: vi.fn(() => Promise.resolve()),
    };
    const wrapper = mount(
        defineComponent({
            setup() {
                useShortcuts(actions);
            },
            template: '<div />',
        }),
    );
    return { actions, unmount: () => wrapper.unmount() };
}

const press = (init: KeyboardEventInit): KeyboardEvent => {
    const event = new KeyboardEvent('keydown', { cancelable: true, ...init });
    window.dispatchEvent(event);
    return event;
};

describe('useShortcuts', () => {
    it.each([
        [{ key: 'n', metaKey: true }, 'newFile'],
        [{ key: 'o', ctrlKey: true }, 'openFile'],
        [{ key: 's', metaKey: true }, 'saveFile'],
        [{ key: 'S', metaKey: true, shiftKey: true }, 'saveFileAs'],
    ] as const)('maps %o to %s and keeps the browser from handling it', (init, action) => {
        const { actions, unmount } = mountShortcuts();
        const event = press(init);
        expect(actions[action]).toHaveBeenCalledOnce();
        expect(event.defaultPrevented).toBe(true);
        unmount();
    });

    it('ignores keys without the modifier, and keys that are not shortcuts', () => {
        const { actions, unmount } = mountShortcuts();
        expect(press({ key: 's' }).defaultPrevented).toBe(false);
        expect(press({ key: 'x', metaKey: true }).defaultPrevented).toBe(false);
        expect(actions.saveFile).not.toHaveBeenCalled();
        unmount();
    });

    it('stops listening once the component unmounts', () => {
        const { actions, unmount } = mountShortcuts();
        unmount();
        press({ key: 'n', metaKey: true });
        expect(actions.newFile).not.toHaveBeenCalled();
    });
});
