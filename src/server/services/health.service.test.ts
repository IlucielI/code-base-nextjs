import { describe, it, expect } from 'vitest';
import { HealthService } from './health.service';
import { ISystemRepository, SystemMetadata } from '../repositories/system.repository.interface';
import { HealthStatus } from '../constants';

class MockSystemRepository implements ISystemRepository {
  constructor(private readonly startTime: Date) {}

  getStartTime(): Date {
    return this.startTime;
  }

  getSystemMetadata(): SystemMetadata {
    return {
      version: '1.0.0',
      gitHash: 'abc1234',
      startedAt: this.startTime,
    };
  }
}

describe('HealthService', () => {
  it('should format seconds correctly for uptime < 60s', () => {
    const startedAt = new Date(Date.now() - 25000); // 25s ago
    const repo = new MockSystemRepository(startedAt);
    const service = new HealthService(repo);

    const health = service.getHealth();
    expect(health.version).toBe('1.0.0');
    expect(health.git_hash).toBe('abc1234');
    expect(health.status).toBe(HealthStatus.OK);
    expect(health.uptime).toMatch(/\d+(\.\d+)?s/);
  });

  it('should format minutes correctly for uptime between 1m and 60m', () => {
    const startedAt = new Date(Date.now() - 125000); // 2m5s ago
    const repo = new MockSystemRepository(startedAt);
    const service = new HealthService(repo);

    const health = service.getHealth();
    expect(health.uptime).toMatch(/\d+m\d+(\.\d+)?s/);
  });

  it('should format hours correctly for uptime >= 60m', () => {
    const startedAt = new Date(Date.now() - 3700000); // 1h1m40s ago
    const repo = new MockSystemRepository(startedAt);
    const service = new HealthService(repo);

    const health = service.getHealth();
    expect(health.uptime).toMatch(/\d+h\d+m\d+(\.\d+)?s/);
  });
});
