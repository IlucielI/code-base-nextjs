import { describe, it, expect } from 'vitest';
import { SystemRepository } from './system.repository';

describe('SystemRepository', () => {
  it('should return system metadata with valid properties', () => {
    const repository = new SystemRepository();
    const metadata = repository.getSystemMetadata();

    expect(metadata).toBeDefined();
    expect(metadata.version).toBeDefined();
    expect(metadata.gitHash).toBeDefined();
    expect(metadata.startedAt).toBeInstanceOf(Date);
  });

  it('should return a valid start time', () => {
    const repository = new SystemRepository();
    const startTime = repository.getStartTime();

    expect(startTime).toBeInstanceOf(Date);
    expect(startTime.getTime()).toBeLessThanOrEqual(Date.now());
  });
});
