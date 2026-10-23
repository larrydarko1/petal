import { beforeEach, describe, expect, it, vi } from 'vitest';

import { takePendingFiles } from '@/bridge/commands';
import { confirmWarning, showError } from '@/bridge/dialogs';
import { chooseFileToOpen, chooseFileToSave, readFile, writeFile } from '@/bridge/files';
import { useDocument } from '@/composables/useDocument';
import { ERROR_MESSAGES } from '@/consts/errorMessages';

vi.mock('@/bridge/commands');
vi.mock('@/bridge/dialogs');
vi.mock('@/bridge/files');

const NOTE = '/notes/todo.txt';

/** A document that has `NOTE` open and an unsaved edit. */
async function editedDocument(): Promise<ReturnType<typeof useDocument>> {
    const doc = useDocument();
    await doc.openFile();
    doc.content.value = 'edited';
    return doc;
}

beforeEach(() => {
    vi.mocked(chooseFileToOpen).mockResolvedValue({ success: true, data: NOTE });
    vi.mocked(chooseFileToSave).mockResolvedValue({ success: true, data: NOTE });
    vi.mocked(readFile).mockResolvedValue({ success: true, data: 'saved text' });
    vi.mocked(writeFile).mockResolvedValue({ success: true, data: null });
    vi.mocked(confirmWarning).mockResolvedValue(true);
});

describe('a new document', () => {
    it('is Untitled and unmodified', () => {
        const doc = useDocument();
        expect(doc.fileName.value).toBe('Untitled');
        expect(doc.isModified.value).toBe(false);
    });

    it('is modified once text is typed', () => {
        const doc = useDocument();
        doc.content.value = 'hello';
        expect(doc.isModified.value).toBe(true);
    });
});

describe('openFile', () => {
    it('loads the picked file and names the document after it', async () => {
        const doc = useDocument();
        await doc.openFile();
        expect(readFile).toHaveBeenCalledWith(NOTE);
        expect(doc.content.value).toBe('saved text');
        expect(doc.fileName.value).toBe('todo.txt');
        expect(doc.isModified.value).toBe(false);
    });

    it('names a Windows path after its last segment', async () => {
        vi.mocked(chooseFileToOpen).mockResolvedValue({ success: true, data: 'C:\\notes\\todo.txt' });
        const doc = useDocument();
        await doc.openFile();
        expect(doc.fileName.value).toBe('todo.txt');
    });

    it('does nothing when the dialog is cancelled', async () => {
        vi.mocked(chooseFileToOpen).mockResolvedValue({ success: true, data: null });
        await useDocument().openFile();
        expect(readFile).not.toHaveBeenCalled();
    });

    it('keeps unsaved changes when the user declines to discard them', async () => {
        const doc = await editedDocument();
        vi.mocked(confirmWarning).mockResolvedValue(false);
        await doc.openFile();
        expect(chooseFileToOpen).toHaveBeenCalledOnce();
        expect(doc.content.value).toBe('edited');
    });

    it('tells the user when the file cannot be read, and keeps what was there', async () => {
        vi.mocked(readFile).mockResolvedValue({ success: false, error: 'FILE_READ_FAILED' });
        const doc = useDocument();
        doc.content.value = 'draft';
        await doc.openFile();
        expect(showError).toHaveBeenCalledWith(ERROR_MESSAGES.FILE_READ_FAILED);
        expect(doc.content.value).toBe('draft');
    });

    it('tells the user when the dialog cannot open', async () => {
        vi.mocked(chooseFileToOpen).mockResolvedValue({ success: false, error: 'DIALOG_FAILED' });
        await useDocument().openFile();
        expect(showError).toHaveBeenCalledWith(ERROR_MESSAGES.DIALOG_FAILED);
    });
});

describe('newFile', () => {
    it('clears the document without asking when nothing is unsaved', async () => {
        const doc = useDocument();
        await doc.openFile();
        await doc.newFile();
        expect(confirmWarning).not.toHaveBeenCalled();
        expect(doc.content.value).toBe('');
        expect(doc.fileName.value).toBe('Untitled');
    });

    it('asks before discarding, and keeps the text on no', async () => {
        const doc = await editedDocument();
        vi.mocked(confirmWarning).mockResolvedValue(false);
        await doc.newFile();
        expect(confirmWarning).toHaveBeenCalledOnce();
        expect(doc.content.value).toBe('edited');
    });
});

describe('saveFile', () => {
    it('writes to the open file without a dialog', async () => {
        const doc = await editedDocument();
        await doc.saveFile();
        expect(chooseFileToSave).not.toHaveBeenCalled();
        expect(writeFile).toHaveBeenCalledWith(NOTE, 'edited');
        expect(doc.isModified.value).toBe(false);
    });

    it('asks where to save an Untitled document', async () => {
        const doc = useDocument();
        doc.content.value = 'hello';
        await doc.saveFile();
        expect(chooseFileToSave).toHaveBeenCalledWith('untitled.txt');
        expect(doc.fileName.value).toBe('todo.txt');
    });

    it('keeps text typed during the write unsaved', async () => {
        const doc = await editedDocument();
        vi.mocked(writeFile).mockImplementation(() => {
            doc.content.value = 'typed meanwhile';
            return Promise.resolve({ success: true, data: null });
        });
        await doc.saveFile();
        expect(doc.isModified.value).toBe(true);
    });

    it('tells the user when the write fails, and leaves the document modified', async () => {
        vi.mocked(writeFile).mockResolvedValue({ success: false, error: 'FILE_WRITE_FAILED' });
        const doc = await editedDocument();
        await doc.saveFile();
        expect(showError).toHaveBeenCalledWith(ERROR_MESSAGES.FILE_WRITE_FAILED);
        expect(doc.isModified.value).toBe(true);
    });
});

describe('saveFileAs', () => {
    it('offers the current file’s path', async () => {
        const doc = await editedDocument();
        await doc.saveFileAs();
        expect(chooseFileToSave).toHaveBeenCalledWith(NOTE);
    });

    it('writes nothing when the dialog is cancelled', async () => {
        vi.mocked(chooseFileToSave).mockResolvedValue({ success: true, data: null });
        await useDocument().saveFileAs();
        expect(writeFile).not.toHaveBeenCalled();
    });

    it('tells the user when the dialog cannot open', async () => {
        vi.mocked(chooseFileToSave).mockResolvedValue({ success: false, error: 'DIALOG_FAILED' });
        await useDocument().saveFileAs();
        expect(showError).toHaveBeenCalledWith(ERROR_MESSAGES.DIALOG_FAILED);
    });
});

describe('openPendingFile', () => {
    it('opens the first file the OS queued', async () => {
        vi.mocked(takePendingFiles).mockResolvedValue({ success: true, data: [NOTE, '/notes/other.txt'] });
        await useDocument().openPendingFile();
        expect(readFile).toHaveBeenCalledExactlyOnceWith(NOTE);
    });

    it('does nothing when the queue is empty', async () => {
        vi.mocked(takePendingFiles).mockResolvedValue({ success: true, data: [] });
        await useDocument().openPendingFile();
        expect(readFile).not.toHaveBeenCalled();
    });

    it('tells the user when the queue cannot be read', async () => {
        vi.mocked(takePendingFiles).mockResolvedValue({ success: false, error: 'INTERNAL' });
        await useDocument().openPendingFile();
        expect(showError).toHaveBeenCalledWith(ERROR_MESSAGES.INTERNAL);
    });
});

describe('confirmClose', () => {
    it('allows closing without asking when nothing is unsaved', async () => {
        expect(await useDocument().confirmClose()).toBe(true);
        expect(confirmWarning).not.toHaveBeenCalled();
    });

    it('asks when there are unsaved changes', async () => {
        const doc = await editedDocument();
        vi.mocked(confirmWarning).mockResolvedValue(false);
        expect(await doc.confirmClose()).toBe(false);
    });
});
