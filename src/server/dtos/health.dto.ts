import { HealthStatus } from '../constants';

export interface HealthResponseDto {
  version: string;
  uptime: string;
  git_hash: string;
  status: HealthStatus;
  timestamp: string;
}
