import { logger } from '../logger';
import { HttpClient } from '../datasources';
import { env } from '../config';

/**
 * Shared Infrastructure Registry
 * 
 * Provides cross-cutting infrastructure singletons (Logger, HTTP Client).
 * 
 * NOTE: Individual feature controllers, services, and repositories are colocated
 * and self-instantiated in their respective feature files.
 */

// 1. Cross-Cutting Infrastructure
export { logger };
export const httpClient = new HttpClient({
  baseUrl: env.CORE_API_URL,
  logger: logger.forClass ? logger.forClass(HttpClient) : logger.child({ module: HttpClient.name }),
});

// 2. Mocking Switch Flag for future feature repositories
export const useMock = env.MOCK_CORE_API || env.USE_MOCK_DATA;
