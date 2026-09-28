import { ISystemRepository, SystemMetadata } from './system.repository.interface';
import { env } from '../config/env';

const startedAt = new Date();

export class SystemRepository implements ISystemRepository {
  getStartTime(): Date {
    return startedAt;
  }

  getSystemMetadata(): SystemMetadata {
    return {
      appName: env.APP_NAME,
      version: env.APP_VERSION,
      gitHash: env.GIT_HASH,
      nodeEnv: env.NODE_ENV,
      startedAt: this.getStartTime(),
    };
  }
}

/**
 * Colocated singleton instance for SystemRepository.
 */
export const systemRepository: ISystemRepository = new SystemRepository();
