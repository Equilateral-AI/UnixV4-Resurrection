/// <reference types="vite/client" />

/**
 * Logger - Structured logging for UnixBox
 *
 * Replaces raw console.log calls with level-aware logging.
 * Debug messages only appear when DEBUG mode is active
 * (import.meta.env.DEV or ?debug=1 URL parameter).
 *
 * warn() and error() always log regardless of debug mode.
 */

const isDebug: boolean = (() => {
  try {
    // Vite dev mode
    if (import.meta.env?.DEV) return true;
    // URL parameter override
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('debug') === '1') return true;
    }
  } catch {
    // SSR or test environment — default to off
  }
  return false;
})();

function formatTag(tag?: string): string {
  return tag ? `[${tag}]` : '';
}

/**
 * Debug-level log — only visible in dev mode or with ?debug=1
 */
export function debug(message: string, ...args: unknown[]): void {
  if (isDebug) {
    console.log(message, ...args);
  }
}

/**
 * Info-level log — only visible in dev mode or with ?debug=1
 * Use for routine operational messages (boot steps, init, etc.)
 */
export function info(message: string, ...args: unknown[]): void {
  if (isDebug) {
    console.log(message, ...args);
  }
}

/**
 * Warning-level log — always visible
 */
export function warn(message: string, ...args: unknown[]): void {
  console.warn(message, ...args);
}

/**
 * Error-level log — always visible
 */
export function error(message: string, ...args: unknown[]): void {
  console.error(message, ...args);
}

/**
 * Create a tagged logger instance for a specific module.
 * All messages are automatically prefixed with [Tag].
 */
export function createLogger(tag: string) {
  const prefix = formatTag(tag);
  return {
    debug: (msg: string, ...args: unknown[]) => debug(`${prefix} ${msg}`, ...args),
    info: (msg: string, ...args: unknown[]) => info(`${prefix} ${msg}`, ...args),
    warn: (msg: string, ...args: unknown[]) => warn(`${prefix} ${msg}`, ...args),
    error: (msg: string, ...args: unknown[]) => error(`${prefix} ${msg}`, ...args),
  };
}

export const logger = { debug, info, warn, error, createLogger };
export default logger;
