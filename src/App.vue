<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

import { onFileOpened, type Unlisten } from '@/bridge/events';
import { guardWindowClose } from '@/bridge/window';
import { useDocument } from '@/composables/useDocument';
import { useShortcuts } from '@/composables/useShortcuts';

const {
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
} = useDocument();
useShortcuts({ newFile, openFile, saveFile, saveFileAs });

const unlisteners: Unlisten[] = [];

onMounted(async () => {
    // Listen before taking the queue, so a file opened in between is announced rather than lost.
    unlisteners.push(
        await onFileOpened((path) => {
            void openPath(path);
        }),
    );
    unlisteners.push(await guardWindowClose(confirmClose));
    await openPendingFile();
});

onUnmounted(() => {
    for (const unlisten of unlisteners) unlisten();
});
</script>

<template>
    <div class="notepad">
        <header
            class="toolbar"
            data-tauri-drag-region>
            <div class="file-info">
                <span
                    v-if="isModified"
                    class="modified-dot" />
                <span class="file-name">{{ fileName }}</span>
            </div>
            <nav class="actions">
                <button
                    title="New file (⌘N)"
                    @click="newFile"
                    >new</button
                >
                <button
                    title="Open file (⌘O)"
                    @click="openFile"
                    >open</button
                >
                <button
                    title="Save file (⌘S)"
                    @click="saveFile"
                    >save</button
                >
                <button
                    title="Save as (⌘⇧S)"
                    @click="saveFileAs"
                    >save as</button
                >
            </nav>
        </header>
        <textarea
            v-model="content"
            class="editor"
            aria-label="Document text"
            placeholder="Start typing..."
            spellcheck="false" />
    </div>
</template>

<style scoped lang="scss">
@use './style.scss' as *;

.notepad {
    display: flex;
    flex-direction: column;
    height: 100vh;

    .toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 14px;
        height: $toolbar-height;
        min-height: $toolbar-height;
        border-bottom: 1px solid var(--border);
        background: var(--bg-toolbar);
        user-select: none;
        -webkit-user-select: none;

        .file-info {
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: 0;

            .modified-dot {
                width: 7px;
                height: 7px;
                border-radius: 50%;
                background: var(--dot-modified);
                flex-shrink: 0;
            }

            .file-name {
                font-family: $font-stack;
                font-size: 12px;
                font-weight: 500;
                letter-spacing: 0.02em;
                color: var(--text-secondary);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }

        .actions {
            display: flex;
            gap: 2px;

            button {
                background: none;
                border: none;
                padding: 4px 10px;
                border-radius: $btn-radius;
                font-family: $font-stack;
                font-size: 11.5px;
                font-weight: 500;
                letter-spacing: 0.03em;
                color: var(--text-secondary);
                cursor: pointer;
                transition:
                    background $transition-speed,
                    color $transition-speed;

                &:hover {
                    background: var(--button-hover);
                    color: var(--text);
                }

                &:active {
                    background: var(--button-active);
                }
            }
        }
    }

    .editor {
        flex: 1;
        padding: 24px 28px;
        border: none;
        outline: none;
        resize: none;
        background: var(--bg);
        color: var(--text);
        font-family: $font-stack;
        font-size: 13.5px;
        line-height: 1.75;
        letter-spacing: 0.01em;
        tab-size: 4;
        caret-color: var(--accent);

        &::placeholder {
            color: var(--placeholder);
            font-style: italic;
        }

        &::selection {
            background: var(--button-active);
        }
    }
}
</style>
