/**
 * IdeaSpark AI — Centralized Logger
 *
 * Provides structured, leveled logging across the application.
 * In development, all levels are printed. In production, only
 * WARN and ERROR are emitted.
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

const LOG_LEVEL_LABELS: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
};

const LOG_LEVEL_STYLES: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: 'color: #6b7280; font-weight: normal',
  [LogLevel.INFO]: 'color: #3b82f6; font-weight: bold',
  [LogLevel.WARN]: 'color: #f59e0b; font-weight: bold',
  [LogLevel.ERROR]: 'color: #ef4444; font-weight: bold',
};

const isDev = import.meta.env.DEV;
const minLevel = isDev ? LogLevel.DEBUG : LogLevel.WARN;

function formatTimestamp(): string {
  return new Date().toISOString();
}

function log(level: LogLevel, source: string, message: string, data?: unknown): void {
  if (level < minLevel) return;

  const label = LOG_LEVEL_LABELS[level];
  const style = LOG_LEVEL_STYLES[level];
  const timestamp = formatTimestamp();
  const prefix = `%c[${label}] ${timestamp} [${source}]`;

  if (data !== undefined) {
    console.groupCollapsed(prefix, style, message);
    console.log('Payload:', data);
    console.groupEnd();
  } else {
    if (level === LogLevel.ERROR) {
      console.error(`[${label}] ${timestamp} [${source}]`, message);
    } else if (level === LogLevel.WARN) {
      console.warn(`[${label}] ${timestamp} [${source}]`, message);
    } else {
      console.log(prefix, style, message);
    }
  }
}

/**
 * Creates a scoped logger for a specific module / service.
 *
 * Usage:
 * ```ts
 * const log = createLogger('OpenAIService');
 * log.info('Generating SRS...', { ideaId: '123' });
 * log.error('Failed to generate SRS', error);
 * ```
 */
export function createLogger(source: string) {
  return {
    debug: (message: string, data?: unknown) => log(LogLevel.DEBUG, source, message, data),
    info:  (message: string, data?: unknown) => log(LogLevel.INFO, source, message, data),
    warn:  (message: string, data?: unknown) => log(LogLevel.WARN, source, message, data),
    error: (message: string, data?: unknown) => log(LogLevel.ERROR, source, message, data),
  };
}

