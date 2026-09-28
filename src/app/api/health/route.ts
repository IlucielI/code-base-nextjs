import { healthController } from '@/server/controllers';

export async function GET(request?: Request) {
  return healthController.check(request);
}
