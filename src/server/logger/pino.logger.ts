import pino, { Logger as PinoInstance } from 'pino';
import { ILogger } from './logger.interface';

export interface LoggerConfig {
  level?: string;
  name?: string;
  isProduction?: boolean;
  customInstance?: PinoInstance;
}

export class PinoLogger implements ILogger {
  private readonly client: PinoInstance;

  constructor(config?: LoggerConfig) {
    if (config?.customInstance) {
      this.client = config.customInstance;
      return;
    }

    const isProduction = config?.isProduction ?? process.env.NODE_ENV === 'production';
    const level = config?.level ?? (process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'));

    this.client = pino({
      name: config?.name || 'nextbase',
      level,
      timestamp: pino.stdTimeFunctions.isoTime,
      formatters: {
        level: (label) => ({ level: label }),
      },
      redact: {
        paths: [
          'password',
          '*.password',
          '*.*.password',
          'token',
          '*.token',
          '*.*.token',
          'authorization',
          '*.authorization',
          '*.*.authorization',
          'cookie',
          '*.cookie',
          'secret',
          '*.secret',
          'apiKey',
          '*.apiKey',
        ],
        censor: '[REDACTED]',
      },
    });
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (context) {
      this.client.debug(context, message);
    } else {
      this.client.debug(message);
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    if (context) {
      this.client.info(context, message);
    } else {
      this.client.info(message);
    }
  }

  warn(message: string, context?: Record<string, unknown>): void {
    if (context) {
      this.client.warn(context, message);
    } else {
      this.client.warn(message);
    }
  }

  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    const errorDetails =
      error instanceof Error
        ? {
            err: {
              name: error.name,
              message: error.message,
              stack: error.stack,
            },
          }
        : error
          ? { err: error }
          : {};

    const payload = {
      ...errorDetails,
      ...(context || {}),
    };

    this.client.error(payload, message);
  }

  child(bindings: Record<string, unknown>): ILogger {
    const childClient = this.client.child(bindings);
    return new PinoLogger({ customInstance: childClient });
  }

  forClass(target: { name: string }): ILogger {
    return this.child({ module: target.name });
  }
}

/**
 * Shared root logger instance.
 */
export const logger: ILogger = new PinoLogger();
