import { headers } from 'next/headers';
import { ILogger } from '../logger/logger.interface';
import { PinoLogger } from '../logger/pino.logger';

export const REQUEST_ID_HEADER = 'x-request-id';

const defaultContextLogger: ILogger = new PinoLogger();

/**
 * Extracts or generates a correlation Request ID.
 * Can be used in Route Handlers, Server Actions, or middleware.
 */
export async function getRequestId(customHeaders?: Headers): Promise<string> {
  let reqHeaders: Headers | undefined = customHeaders;
  
  if (!reqHeaders) {
    try {
      reqHeaders = await headers();
    } catch {
      // Not in a request header context (e.g. background job or test)
    }
  }

  const incomingId = reqHeaders?.get(REQUEST_ID_HEADER);
  if (incomingId && /^[a-zA-Z0-9-_]{1,64}$/.test(incomingId)) {
    return incomingId;
  }

  return crypto.randomUUID();
}

/**
 * Creates a scoped logger instance tagged with the active Request ID.
 */
export async function getRequestLogger(
  moduleName?: string,
  customHeaders?: Headers,
  parentLogger?: ILogger
): Promise<ILogger> {
  const requestId = await getRequestId(customHeaders);
  const bindings: Record<string, unknown> = { requestId };
  
  if (moduleName) {
    bindings.module = moduleName;
  }

  const base = parentLogger || defaultContextLogger;
  return base.child(bindings);
}
