import { describe, it, expect } from 'vitest';
import { getSystemHealthAction } from './actions';

describe('Server Actions', () => {
  it('should fetch system health telemetry strictly on the server wrapped in safeAction', async () => {
    const result = await getSystemHealthAction();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBeDefined();
      expect(result.data.status).toBe('ok');
      expect(result.data.version).toBeDefined();
      expect(result.data.uptime).toBeDefined();
      expect(result.data.git_hash).toBeDefined();
    }
  });
});
