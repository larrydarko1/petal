// The open document: the text in the editor, the file it came from, and whether it has unsaved
// changes. Every file operation asks before it throws changes away, and tells the user when it fails.
import { computed, ref, type ComputedRef, type Ref } from 'vue';

import { takePendingFiles } from '@/bridge/commands';
import { confirmWarning, showError } from '@/bridge/dialogs';
import type { ErrorCode } from '@/bridge/errors';
import { chooseFileToOpen, chooseFileToSave, readFile, writeFile } from '@/bridge/files';
import { ERROR_MESSAGES } from '@/consts/errorMessages';

const UNTITLED = 'Untitled';
const UNSAVED_TITLE = 'Unsaved Changes';

type DocumentState = {
    content: Ref<string>;
    fileName: ComputedRef<string>;
    isModified: ComputedRef<boolean>;
    newFile: () => Promise<void>;
    openFile: () => Promise<void>;
    openPath: (path: string) => Promise<void>;
    openPendingFile: () => Promise<void>;
    saveFile: () => Promise<void>;
    saveFileAs: () => Promise<void>;
    confirmClose: () => Promise<boolean>;
};

/** The last segment of a path, on any OS. */
function baseName(path: string): string {
    const name = path.split(/[\\/]/).at(-1);
    return name === undefined || name === '' ? UNTITLED : name;
}

async function report(code: ErrorCode): Promise<void> {
    await showError(ERROR_MESSAGES[code]);
}

export function useDocument(): DocumentState {
    const content = ref('');
    const filePath = ref<string | null>(null);
    const savedContent = ref('');
    const isModified = computed(() => content.value !== savedContent.value);
    const fileName = computed(() => (filePath.value === null ? UNTITLED : baseName(filePath.value)));

    function replace(text: string, path: string | null): void {
        content.value = text;
        savedContent.value = text;
        filePath.value = path;
    }

    async function confirmDiscard(): Promise<boolean> {
        if (!isModified.value) return true;
        return await confirmWarning('You have unsaved changes. Discard them?', UNSAVED_TITLE);
    }

    async function confirmClose(): Promise<boolean> {
        if (!isModified.value) return true;
        return await confirmWarning(
            'You have unsaved changes. If you close now, all data will be lost. Are you sure?',
            UNSAVED_TITLE,
        );
    }

    async function load(path: string): Promise<void> {
        const result = await readFile(path);
        if (!result.success) {
            await report(result.error);
            return;
        }
        replace(result.data, path);
    }

    // The text is taken before the write starts, so typing during a slow save stays unsaved.
    async function writeTo(path: string): Promise<void> {
        const text = content.value;
        const result = await writeFile(path, text);
        if (!result.success) {
            await report(result.error);
            return;
        }
        filePath.value = path;
        savedContent.value = text;
    }

    async function newFile(): Promise<void> {
        if (await confirmDiscard()) replace('', null);
    }

    async function openPath(path: string): Promise<void> {
        if (await confirmDiscard()) await load(path);
    }

    async function openFile(): Promise<void> {
        if (!(await confirmDiscard())) return;
        const picked = await chooseFileToOpen();
        if (!picked.success) {
            await report(picked.error);
            return;
        }
        if (picked.data !== null) await load(picked.data);
    }

    /** A file the OS opened before the window was listening for `file:opened`. */
    async function openPendingFile(): Promise<void> {
        const pending = await takePendingFiles();
        if (!pending.success) {
            await report(pending.error);
            return;
        }
        const [first] = pending.data;
        if (first !== undefined) await openPath(first);
    }

    async function saveFileAs(): Promise<void> {
        const picked = await chooseFileToSave(filePath.value ?? 'untitled.txt');
        if (!picked.success) {
            await report(picked.error);
            return;
        }
        if (picked.data !== null) await writeTo(picked.data);
    }

    async function saveFile(): Promise<void> {
        await (filePath.value === null ? saveFileAs() : writeTo(filePath.value));
    }

    return {
        content,
        fileName,
        isModified,
        newFile,
        openFile,
        openPath,
        openPendingFile,
        saveFile,
        saveFileAs,
        confirmClose,
    };
}
