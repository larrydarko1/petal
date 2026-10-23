/**
 * The one shape every bridge function returns. A Rust command rejects with the code its
 * `Error` serialised to (src-tauri/src/error.rs); a plugin rejects with English that can
 * name a path, so its wrapper logs that and returns a code of its own.
 */
export const ERROR_CODES = ['INTERNAL', 'FILE_READ_FAILED', 'FILE_WRITE_FAILED', 'DIALOG_FAILED'] as const;
export type ErrorCode = (typeof ERROR_CODES)[number];

export type CommandResult<T> = { success: true; data: T } | { success: false; error: ErrorCode };

/** What a command rejected with, as a code: its own if Rust sent one, `INTERNAL` otherwise. */
export function toErrorCode(rejection: unknown): ErrorCode {
    return ERROR_CODES.find((code) => code === rejection) ?? 'INTERNAL';
}
