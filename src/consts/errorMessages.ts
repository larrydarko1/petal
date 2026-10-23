import type { ErrorCode } from '@/bridge/errors';

/**
 * What the user reads for each code. Petal ships in English only, so this map is its one
 * locale, and typing it over `ErrorCode` is its parity test: a code without a message fails to compile.
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
    INTERNAL: 'Something went wrong. Try again, or restart Petal if it keeps happening.',
    FILE_READ_FAILED: 'The file could not be opened.',
    FILE_WRITE_FAILED: 'The file could not be saved. Your text is still here.',
    DIALOG_FAILED: 'The file dialog could not be opened.',
};
