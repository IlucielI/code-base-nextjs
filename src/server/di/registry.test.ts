import { describe, it, expect } from 'vitest';
import { logger, httpClient, useMock } from './registry';
import { PinoLogger } from '../logger';
import { HttpClient } from '../datasources';

describe('Shared Infrastructure (DI)', () => {
  it('should export properly initialized infrastructure singletons', () => {
    expect(logger).toBeDefined();
    expect(logger).toBeInstanceOf(PinoLogger);

    expect(httpClient).toBeDefined();
    expect(httpClient).toBeInstanceOf(HttpClient);

    expect(typeof useMock).toBe('boolean');
  });
});
