export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Structured Logger Interface following Clean Architecture.
 * Decouples domain services and controllers from concrete logging libraries (e.g. Pino, Winston).
 */
export interface ILogger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void;
  child(bindings: Record<string, unknown>): ILogger;
  forClass?(target: { name: string }): ILogger;
}
