import { describe, it, expect } from 'vitest';
import { PinoLogger } from './pino.logger';

describe('PinoLogger', () => {
  it('should initialize and log without errors', () => {
    const logger = new PinoLogger({ level: 'debug', isProduction: false });

    expect(() => {
      logger.debug('Debug test message', { debugKey: 'debugVal' });
      logger.info('Info test message', { key: 'value' });
      logger.warn('Warn test message', { warning: true });
      logger.error('Error test message', new Error('Something broke'), { contextId: 123 });
    }).not.toThrow();
  });

  it('should handle logging without context arguments', () => {
    const logger = new PinoLogger({ level: 'debug', isProduction: false });

    expect(() => {
      logger.debug('Simple debug');
      logger.info('Simple info');
      logger.warn('Simple warn');
      logger.error('Simple error');
      logger.error('Error with non-error object', 'string-error');
    }).not.toThrow();
  });

  it('should create child loggers with contextual bindings', () => {
    const parentLogger = new PinoLogger({ level: 'info' });
    const childLogger = parentLogger.child({ module: 'TestModule', traceId: 'abc-123' });

    expect(childLogger).toBeDefined();
    expect(typeof childLogger.info).toBe('function');
    expect(() => childLogger.info('Child info message')).not.toThrow();
  });

  it('should create scoped child logger via forClass without magic strings', () => {
    class SampleService {}
    const parentLogger = new PinoLogger({ level: 'info' });
    const classLogger = parentLogger.forClass(SampleService);

    expect(classLogger).toBeDefined();
    expect(typeof classLogger.info).toBe('function');
    expect(() => classLogger.info('Service log')).not.toThrow();
  });

  it('should redact sensitive fields such as password and token', async () => {
    let output = '';
    const pino = (await import('pino')).default;
    const customInstance = pino(
      {
        redact: {
          paths: ['password', '*.password', 'token', '*.token'],
          censor: '[REDACTED]',
        },
      },
      {
        write: (str: string) => {
          output += str;
        },
      }
    );

    const logger = new PinoLogger({ customInstance });
    logger.info('User authenticated', { password: 'superSecret123', token: 'bearer-xyz' });

    expect(output).toContain('[REDACTED]');
    expect(output).not.toContain('superSecret123');
    expect(output).not.toContain('bearer-xyz');
  });
});
