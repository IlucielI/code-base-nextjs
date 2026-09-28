import { z } from 'zod';
import { HealthStatus } from '../constants/health.constant';

/**
 * -----------------------------------------------------------------------------
 * 1. External Core API Health Schemas (Anti-Corruption Layer)
 * -----------------------------------------------------------------------------
 */

/**
 * Raw DTO Schema for incoming external Core API health response (over-the-wire payload).
 * Uses backend snake_case naming and primitive types.
 */
export const RawCoreApiHealthSchema = z.object({
  app_version: z.string().default('1.0.0'),
  uptime_seconds: z.number().nonnegative(),
  commit_hash: z.string().default('dev'),
  service_status: z.enum(['ok', 'healthy', 'up', 'down', 'degraded', 'error']).default('ok'),
  server_time: z.string(),
});

export type RawCoreApiHealthDto = z.infer<typeof RawCoreApiHealthSchema>;

/**
 * Zod Transformer Schema: Parses raw Core API DTO and maps it directly into internal Domain Model.
 * Acts as an Anti-Corruption Layer (ACL).
 */
export const CoreApiToDomainHealthSchema = RawCoreApiHealthSchema.transform((raw) => {
  let mappedStatus: HealthStatus = HealthStatus.OK;
  if (raw.service_status === 'degraded') {
    mappedStatus = HealthStatus.DEGRADED;
  } else if (raw.service_status === 'down' || raw.service_status === 'error') {
    mappedStatus = HealthStatus.ERROR;
  }

  return {
    version: raw.app_version,
    gitHash: raw.commit_hash,
    startedAt: new Date(Date.now() - raw.uptime_seconds * 1000),
    status: mappedStatus,
  };
});

export type DomainHealthFromApi = z.infer<typeof CoreApiToDomainHealthSchema>;
