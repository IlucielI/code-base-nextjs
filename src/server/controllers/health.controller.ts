import { NextResponse } from 'next/server';
import { BaseController } from './base.controller';
import { IHealthService } from '../services/health.service.interface';
import { healthService } from '../services/health.service';
import { ILogger } from '../logger/logger.interface';

export class HealthController extends BaseController {
  constructor(
    private readonly healthService: IHealthService,
    logger?: ILogger
  ) {
    super(logger);
  }

  async check(req?: Request): Promise<NextResponse> {
    return this.handle(req, async () => {
      return this.healthService.getHealth();
    });
  }
}

/**
 * Colocated singleton instance for HealthController.
 */
export const healthController = new HealthController(healthService);
