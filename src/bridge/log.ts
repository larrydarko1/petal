/**
 * The webview's logger. tauri-plugin-log writes it to the same file as Rust's `log::`
 * macros, with the fields as key-values: `log.warn('File not found', { path })`.
 */
import { error, info, warn } from '@tauri-apps/plugin-log';

type Fields = Record<string, unknown>;
type Write = typeof info;

export const log = {
    info: (message: string, fields: Fields = {}): void => send(info, message, fields),
    warn: (message: string, fields: Fields = {}): void => send(warn, message, fields),
    error: (message: string, fields: Fields = {}): void => send(error, message, fields),
};

/** The plugin takes strings. An Error becomes its stack, so the line says where it came from. */
function describe(value: unknown): string {
    if (value instanceof Error) return value.stack ?? String(value);
    if (typeof value !== 'object' || value === null) return String(value);
    try {
        return JSON.stringify(value);
    } catch {
        // A cycle or a BigInt: the line is still written, with the field marked.
        return '[unserialisable]';
    }
}

function send(write: Write, message: string, fields: Fields): void {
    const keyValues = Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, describe(value)]));
    write(message, { keyValues }).catch(() => {
        // The log is the channel that failed, and the webview has no console: nowhere is left to say so.
    });
}
