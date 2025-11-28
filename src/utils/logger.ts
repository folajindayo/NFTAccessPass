/**
 * Logging utility for consistent logging across the application
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: unknown;
}

interface LoggerConfig {
  enabled: boolean;
  minLevel: LogLevel;
  prefix: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LOG_COLORS: Record<LogLevel, string> = {
  debug: '#9CA3AF',
  info: '#3B82F6',
  warn: '#F59E0B',
  error: '#EF4444',
};

const config: LoggerConfig = {
  enabled: process.env.NODE_ENV !== 'production',
  minLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  prefix: '[NFT Access Pass]',
};

/**
 * Formats the current timestamp
 */
function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Checks if a log level should be logged
 */
function shouldLog(level: LogLevel): boolean {
  if (!config.enabled) return false;
  return LOG_LEVELS[level] >= LOG_LEVELS[config.minLevel];
}

/**
 * Formats a log message for display
 */
function formatMessage(level: LogLevel, message: string): string {
  return `${config.prefix} [${level.toUpperCase()}] ${message}`;
}

/**
 * Logs a message with the specified level
 */
function log(level: LogLevel, message: string, data?: unknown): void {
  if (!shouldLog(level)) return;
  
  const formattedMessage = formatMessage(level, message);
  const color = LOG_COLORS[level];
  
  const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
  
  if (typeof window !== 'undefined') {
    // Browser environment with styling
    console[consoleMethod](
      `%c${formattedMessage}`,
      `color: ${color}; font-weight: ${level === 'error' ? 'bold' : 'normal'}`
    );
  } else {
    // Node environment
    console[consoleMethod](formattedMessage);
  }
  
  if (data !== undefined) {
    console[consoleMethod](data);
  }
}

/**
 * Debug level logging
 */
export function debug(message: string, data?: unknown): void {
  log('debug', message, data);
}

/**
 * Info level logging
 */
export function info(message: string, data?: unknown): void {
  log('info', message, data);
}

/**
 * Warning level logging
 */
export function warn(message: string, data?: unknown): void {
  log('warn', message, data);
}

/**
 * Error level logging
 */
export function error(message: string, data?: unknown): void {
  log('error', message, data);
}

/**
 * Logs a group of related messages
 */
export function group(label: string, fn: () => void): void {
  if (!config.enabled) return;
  
  console.group(formatMessage('info', label));
  fn();
  console.groupEnd();
}

/**
 * Logs a collapsed group
 */
export function groupCollapsed(label: string, fn: () => void): void {
  if (!config.enabled) return;
  
  console.groupCollapsed(formatMessage('info', label));
  fn();
  console.groupEnd();
}

/**
 * Creates a timer for performance logging
 */
export function time(label: string): () => void {
  const start = performance.now();
  
  return () => {
    const duration = performance.now() - start;
    debug(`${label} completed in ${duration.toFixed(2)}ms`);
  };
}

/**
 * Logs a table of data
 */
export function table(data: Record<string, unknown>[] | Record<string, unknown>): void {
  if (!config.enabled) return;
  console.table(data);
}

/**
 * Creates a scoped logger with a custom prefix
 */
export function createLogger(scope: string) {
  const scopedPrefix = `${config.prefix} [${scope}]`;
  
  return {
    debug: (message: string, data?: unknown) => {
      if (!shouldLog('debug')) return;
      console.log(`%c${scopedPrefix} [DEBUG] ${message}`, `color: ${LOG_COLORS.debug}`, data ?? '');
    },
    info: (message: string, data?: unknown) => {
      if (!shouldLog('info')) return;
      console.log(`%c${scopedPrefix} [INFO] ${message}`, `color: ${LOG_COLORS.info}`, data ?? '');
    },
    warn: (message: string, data?: unknown) => {
      if (!shouldLog('warn')) return;
      console.warn(`%c${scopedPrefix} [WARN] ${message}`, `color: ${LOG_COLORS.warn}`, data ?? '');
    },
    error: (message: string, data?: unknown) => {
      if (!shouldLog('error')) return;
      console.error(`%c${scopedPrefix} [ERROR] ${message}`, `color: ${LOG_COLORS.error}; font-weight: bold`, data ?? '');
    },
  };
}

/**
 * Logs contract interactions
 */
export const contractLogger = createLogger('Contract');

/**
 * Logs wallet interactions
 */
export const walletLogger = createLogger('Wallet');

/**
 * Logs API interactions
 */
export const apiLogger = createLogger('API');

/**
 * Configures the logger
 */
export function configure(options: Partial<LoggerConfig>): void {
  Object.assign(config, options);
}

/**
 * Enables or disables logging
 */
export function setEnabled(enabled: boolean): void {
  config.enabled = enabled;
}

/**
 * Sets the minimum log level
 */
export function setMinLevel(level: LogLevel): void {
  config.minLevel = level;
}

/**
 * Creates a log entry object (useful for remote logging)
 */
export function createLogEntry(
  level: LogLevel,
  message: string,
  data?: unknown
): LogEntry {
  return {
    level,
    message,
    timestamp: getTimestamp(),
    data,
  };
}

export default {
  debug,
  info,
  warn,
  error,
  group,
  groupCollapsed,
  time,
  table,
  createLogger,
  contractLogger,
  walletLogger,
  apiLogger,
  configure,
  setEnabled,
  setMinLevel,
  createLogEntry,
};

