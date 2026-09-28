import { describe, it, expect } from 'vitest';
import { validateEnv } from './env';

describe('Environment Config (env.ts)', () => {
  it('should parse environment variables with standard defaults', () => {
    const parsed = validateEnv({});

    expect(parsed.NODE_ENV).toBe('development');
    expect(parsed.PORT).toBe(3000);
    expect(parsed.APP_NAME).toBe('code-base-nextjs');
    expect(parsed.APP_VERSION).toBe('0.1.0');
    expect(parsed.MOCK_CORE_API).toBe(false);
  });

  it('should coerce string values for PORT and booleans correctly', () => {
    const parsed = validateEnv({
      PORT: '8080',
      MOCK_CORE_API: 'true',
      USE_MOCK_DATA: '1',
      CORE_API_URL: 'https://api.example.com',
    });

    expect(parsed.PORT).toBe(8080);
    expect(parsed.MOCK_CORE_API).toBe(true);
    expect(parsed.USE_MOCK_DATA).toBe(true);
    expect(parsed.CORE_API_URL).toBe('https://api.example.com');
  });

  it('should throw error when invalid NODE_ENV is provided', () => {
    expect(() =>
      validateEnv({
        NODE_ENV: 'invalid-env',
      })
    ).toThrow('Environment validation failed');
  });
});
