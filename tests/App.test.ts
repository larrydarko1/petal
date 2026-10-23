import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import App from '@/App.vue';
import { takePendingFiles } from '@/bridge/commands';
import { confirmWarning } from '@/bridge/dialogs';
import { onFileOpened } from '@/bridge/events';
import { chooseFileToOpen, chooseFileToSave, readFile } from '@/bridge/files';
import { guardWindowClose } from '@/bridge/window';

vi.mock('@/bridge/commands');
vi.mock('@/bridge/dialogs');
vi.mock('@/bridge/events');
vi.mock('@/bridge/files');
vi.mock('@/bridge/window');

const unlistenFileOpened = vi.fn();
const unlistenClose = vi.fn();

beforeEach(() => {
    vi.mocked(takePendingFiles).mockResolvedValue({ success: true, data: [] });
    vi.mocked(onFileOpened).mockResolvedValue(unlistenFileOpened);
    vi.mocked(guardWindowClose).mockResolvedValue(unlistenClose);
    vi.mocked(readFile).mockResolvedValue({ success: true, data: 'saved text' });
});

const editor = (wrapper: ReturnType<typeof mount>): HTMLTextAreaElement =>
    wrapper.find('textarea').element as HTMLTextAreaElement;

describe('App', () => {
    it('shows Untitled and no modified dot on a clean slate', async () => {
        const wrapper = mount(App);
        await flushPromises();
        expect(wrapper.find('.file-name').text()).toBe('Untitled');
        expect(wrapper.find('.modified-dot').exists()).toBe(false);
    });

    it('shows the modified dot once text is typed', async () => {
        const wrapper = mount(App);
        await wrapper.find('textarea').setValue('hello');
        expect(wrapper.find('.modified-dot').exists()).toBe(true);
    });

    it('opens the file the OS queued before the window was ready', async () => {
        vi.mocked(takePendingFiles).mockResolvedValue({ success: true, data: ['/notes/todo.txt'] });
        const wrapper = mount(App);
        await flushPromises();
        expect(wrapper.find('.file-name').text()).toBe('todo.txt');
        expect(editor(wrapper).value).toBe('saved text');
    });

    it('opens a file the OS hands over while running', async () => {
        const wrapper = mount(App);
        await flushPromises();
        const handler = vi.mocked(onFileOpened).mock.calls[0]?.[0];
        handler?.('/notes/later.txt');
        await flushPromises();
        expect(wrapper.find('.file-name').text()).toBe('later.txt');
    });

    it('guards the window close with the unsaved-changes question', async () => {
        vi.mocked(confirmWarning).mockResolvedValue(false);
        const wrapper = mount(App);
        await flushPromises();
        await wrapper.find('textarea').setValue('unsaved');
        const shouldClose = vi.mocked(guardWindowClose).mock.calls[0]?.[0];
        expect(await shouldClose?.()).toBe(false);
        expect(confirmWarning).toHaveBeenCalledOnce();
    });

    it('wires each toolbar button to its action', async () => {
        vi.mocked(chooseFileToOpen).mockResolvedValue({ success: true, data: null });
        vi.mocked(chooseFileToSave).mockResolvedValue({ success: true, data: null });
        const wrapper = mount(App);
        await flushPromises();
        await wrapper.find('[title="Open file (⌘O)"]').trigger('click');
        await wrapper.find('[title="Save as (⌘⇧S)"]').trigger('click');
        await wrapper.find('[title="Save file (⌘S)"]').trigger('click');
        await flushPromises();
        expect(chooseFileToOpen).toHaveBeenCalledOnce();
        // An Untitled document's save is a save-as.
        expect(chooseFileToSave).toHaveBeenCalledTimes(2);
        await wrapper.find('textarea').setValue('draft');
        vi.mocked(confirmWarning).mockResolvedValue(true);
        await wrapper.find('[title="New file (⌘N)"]').trigger('click');
        await flushPromises();
        expect(editor(wrapper).value).toBe('');
    });

    it('stops listening when it unmounts', async () => {
        const wrapper = mount(App);
        await flushPromises();
        wrapper.unmount();
        expect(unlistenFileOpened).toHaveBeenCalledOnce();
        expect(unlistenClose).toHaveBeenCalledOnce();
    });
});
