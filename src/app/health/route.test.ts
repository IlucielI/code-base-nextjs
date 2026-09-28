import { describe, it, expect } from 'vitest';
import { GET } from './route';

describe('Health Route (GET /health)', () => {
  it('returns health telemetry JSON with status 200', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(data.version).toBeDefined();
    expect(data.uptime).toBeDefined();
    expect(data.git_hash).toBeDefined();
  });
});
