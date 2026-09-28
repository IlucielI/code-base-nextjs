'use server';

import { healthService } from '@/server/services';
import { createSafeAction } from '@/server/actions';
import { HealthResponseDto } from '@/server/dtos/health.dto';

/**
 * Server Action: Fetches current system health telemetry.
 * 
 * Executed strictly on the Node.js server.
 * The client browser NEVER calls backend APIs directly.
 */
export const getSystemHealthAction = createSafeAction<HealthResponseDto>(async () => {
  return healthService.getHealth();
});
