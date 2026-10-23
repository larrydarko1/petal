import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

/** Set by `tauri dev` when the app runs on a phone, which reaches the dev server over the network. */
const host = process.env['TAURI_DEV_HOST'];

// https://v2.tauri.app/start/frontend/vite/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    css: {
        preprocessorOptions: {
            scss: {
                // The tokens, in every SFC — never the folder, whose index.scss would ship every
                // global rule once per component. Files inside styles/ are exempt: they @use
                // _variables.scss themselves, and index.scss is imported by main.ts.
                additionalData: (source: string, filename: string) =>
                    filename.replaceAll('\\', '/').includes('/src/styles/')
                        ? source
                        : `@use '@/styles/variables' as *;\n${source}`,
            },
        },
    },
    // Keep Rust's compile errors on screen instead of clearing them away.
    clearScreen: false,
    server: {
        // tauri.conf.json's devUrl, and the port devCsp allows a hot-reload socket on.
        port: 1420,
        strictPort: true,
        host: host ?? false,
        ...(host === undefined ? {} : { hmr: { protocol: 'ws', host, port: 1421 } }),
        watch: { ignored: ['**/src-tauri/**'] },
    },
});
