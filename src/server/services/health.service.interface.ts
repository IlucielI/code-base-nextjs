import { HealthResponseDto } from '../dtos/health.dto';

export interface IHealthService {
  getHealth(): HealthResponseDto;
}
