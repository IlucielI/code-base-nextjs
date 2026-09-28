import { describe, it, expect, vi } from 'vitest';
import { HealthController } from './health.controller';
import { IHealthService } from '../services/health.service.interface';
import { HealthResponseDto } from '../dtos/health.dto';
import { HealthStatus } from '../constants';

class MockHealthService implements IHealthService {
  getHealth(): HealthResponseDto {
    return {
      version: '0.1.0',
      uptime: '1m20s',
      git_hash: 'test-hash',
      status: HealthStatus.OK,
      timestamp: '2026-09-28T00:00:00.000Z',
    };
  }
}

describe('HealthController', () => {
  it('should return NextResponse with 200 status and correct headers', async () => {
    const service = new MockHealthService();
    const controller = new HealthController(service);

    const response = await controller.check();
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('no-store, no-cache, must-revalidate');

    const data = await response.json();
    expect(data.version).toBe('0.1.0');
    expect(data.uptime).toBe('1m20s');
    expect(data.git_hash).toBe('test-hash');
    expect(data.status).toBe('ok');
  });

  it('should initialize and execute cleanly with or without logger', async () => {
    const service = new MockHealthService();
    const mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      child: vi.fn(),
    };

    const controllerWithLogger = new HealthController(service, mockLogger);
    const resWithLogger = await controllerWithLogger.check();
    expect(resWithLogger.status).toBe(200);

    const controllerWithoutLogger = new HealthController(service);
    const resWithoutLogger = await controllerWithoutLogger.check();
    expect(resWithoutLogger.status).toBe(200);
  });

  it('should include x-request-id in response header and forward from incoming request', async () => {
    const service = new MockHealthService();
    const controller = new HealthController(service);

    const req = new Request('http://localhost:3000/api/health', {
      headers: { 'x-request-id': 'custom-trace-uuid-123' },
    });

    const response = await controller.check(req);
    expect(response.headers.get('x-request-id')).toBe('custom-trace-uuid-123');
  });

  it('should catch service exception and return safe 500 error response', async () => {
    const brokenService: IHealthService = {
      getHealth: () => {
        throw new Error('Database server exploded');
      },
    };

    const mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      child: vi.fn(),
    };

    const controller = new HealthController(brokenService, mockLogger);
    const response = await controller.check();

    expect(response.status).toBe(500);
    expect(response.headers.get('x-request-id')).toBeDefined();

    const body = await response.json();
    expect(body.code).toBe('INTERNAL_SERVER_ERROR');
    expect(mockLogger.error).toHaveBeenCalled();
  });
});
