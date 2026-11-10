/**
 * Production-safe logger utility.
 * In development (import.meta.env.DEV), all levels are active.
 * In production builds, all output is suppressed — no data leaks to DevTools.
 */
const isDev = (import.meta as unknown as { env: { DEV: boolean } }).env.DEV;

export const logger = {
  log: (...args: unknown[]) => { if (isDev) console.log(...args); },
  warn: (...args: unknown[]) => { if (isDev) console.warn(...args); },
  error: (...args: unknown[]) => { if (isDev) console.error(...args); },
};
