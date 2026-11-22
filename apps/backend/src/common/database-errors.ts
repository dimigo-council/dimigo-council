/** PostgreSQL error codes this API maps to HTTP errors. */
export const PG_UNIQUE_VIOLATION = '23505';
export const PG_FOREIGN_KEY_VIOLATION = '23503';
export const PG_CHECK_VIOLATION = '23514';

/** Drizzle wraps driver errors, so look at the error and its cause. */
export function pgErrorCode(error: unknown): string | undefined {
  for (let current = error, depth = 0; current && depth < 3; depth++) {
    const code = (current as { code?: unknown }).code;
    if (typeof code === 'string') return code;
    current = (current as { cause?: unknown }).cause;
  }
  return undefined;
}
