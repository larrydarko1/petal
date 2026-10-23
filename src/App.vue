<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

import { onFileOpened, type Unlisten } from '@/bridge/events';
import { guardWindowClose } from '@/bridge/window';
import { useDocument } from '@/composables/useDocument';
import { useShortcuts } from '@/composables/useShortcuts';

const unlisteners: Unlisten[] = [];

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
.notepad {
    display: flex;
    flex-direction: column;
    height: 100vh;

    .toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 $space-5;
        height: $toolbar-height;
        min-height: $toolbar-height;
        border-bottom: $border-width solid $color-border;
        background: $color-surface;
        user-select: none;
        // stylelint-disable-next-line property-no-vendor-prefix -- WKWebView, the macOS webview, still reads only the prefixed property.
        -webkit-user-select: none;

        .file-info {
            display: flex;
            align-items: center;
            gap: $space-3;
            min-width: 0;

            .modified-dot {
                width: $dot-size;
                height: $dot-size;
                border-radius: $radius-round;
                background: $color-accent;
                flex-shrink: 0;
            }

            .file-name {
                font-family: $font-family-mono;
                font-size: $font-size-sm;
                font-weight: $font-weight-medium;
                letter-spacing: $letter-spacing-normal;
                color: $color-text-muted;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }

        .actions {
            display: flex;
            gap: $space-1;

            button {
                background: none;
                border: none;
                padding: $space-2 $space-4;
                border-radius: $radius-md;
                font-family: $font-family-mono;
                font-size: $font-size-xs;
                font-weight: $font-weight-medium;
                letter-spacing: $letter-spacing-wide;
                color: $color-text-muted;
                cursor: pointer;
                transition:
                    background $transition-base,
                    color $transition-base;

                &:hover {
                    background: $color-accent-hover;
                    color: $color-text;
                }

                &:active {
                    background: $color-accent-active;
                }
            }
        }
    }

    .editor {
        flex: 1;
        padding: $space-6 $space-7;
        border: none;
        outline: none;
        resize: none;
        background: $color-bg;
        color: $color-text;
        font-family: $font-family-mono;
        font-size: $font-size-md;
        line-height: $line-height-relaxed;
        letter-spacing: $letter-spacing-tight;
        tab-size: 4;
        caret-color: $color-accent;

        &::placeholder {
            color: $color-placeholder;
            font-style: italic;
        }

        &::selection {
            background: $color-accent-active;
        }
    }
}
</style>
