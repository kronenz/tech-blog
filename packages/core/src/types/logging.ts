/**
 * Logging types for AnimFlow DSL
 */

/** Log message type */
export type LogMessageType = 'info' | 'success' | 'warning' | 'error';

/** Log entry */
export interface LogEntry {
  timestamp: number;
  message: string;
  type: LogMessageType;
}

/** Logging configuration */
export interface LoggingConfig {
  /** Show log panel */
  enabled?: boolean;
  /** Maximum number of log entries to keep */
  maxEntries?: number;
  /** Show timestamps */
  showTimestamp?: boolean;
  /** Panel title */
  title?: string;
}

/** Default logging configuration values */
export const DEFAULT_MAX_LOG_ENTRIES = 50;
export const DEFAULT_LOG_TITLE = 'System Log';
