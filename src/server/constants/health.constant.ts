export const HealthStatus = {
  OK: 'ok',
  DEGRADED: 'degraded',
  ERROR: 'error',
} as const;

export type HealthStatus = (typeof HealthStatus)[keyof typeof HealthStatus];
