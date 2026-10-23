import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.ts';

/** The app's own Vite config, so tests resolve `@/` and compile SFCs exactly as the build does. */
export default mergeConfig(
    viteConfig,
    defineConfig({
        test: {
            environment: 'jsdom',
            include: ['tests/**/*.test.ts'],
            restoreMocks: true,
            coverage: {
                provider: 'v8',
                include: ['src/**/*.{ts,vue}'],
                exclude: [
                    'src/**/*.d.ts',
                    // The bootstrap: it mounts the app on a real #app, which the suites never have.
                    'src/main.ts',
                ],
                reporter: ['text', 'json-summary'],
                thresholds: { statements: 80, branches: 80, functions: 80, lines: 80 },
            },
        },
    }),
);
