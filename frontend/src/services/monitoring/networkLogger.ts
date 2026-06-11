import { captureException } from './errorHandler';
import { logger } from './logger';

/**
 * Safely strips sensitive information from headers or payloads.
 */
const redactSensitiveData = (data: any, visited = new Set<any>()): any => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  // Prevent circular references
  if (visited.has(data)) {
    return '[CIRCULAR]';
  }
  visited.add(data);

  if (Array.isArray(data)) {
    return data.map(item => redactSensitiveData(item, visited));
  }

  const redacted: Record<string, any> = {};
  // Use substring matching so variants like `authToken` or `userPasswordHash`
  // are caught in addition to exact-match keys.
  const sensitiveKeys = ['authorization', 'token', 'password', 'secret', 'cookie'];

  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      if (sensitiveKeys.some(sensitiveKey => key.toLowerCase().includes(sensitiveKey))) {
        redacted[key] = '[REDACTED]';
      } else {
        redacted[key] = redactSensitiveData(data[key], visited);
      }
    }
  }

  visited.delete(data);

  return redacted;
};

/**
 * Logs an API error safely, extracting relevant status and URL without exposing secrets.
 * 
 * @param error - The axios or fetch error object
 * @param url - The requested endpoint (optional if it can be extracted from error)
 * @param context - Additional context to log
 */
export const logApiError = (error: any, url?: string, context?: Record<string, any>) => {
  let endpoint = url || error?.config?.url || 'Unknown URL';
  const status = error?.response?.status || 'Unknown Status';
  
  // Clean query params if needed to avoid leaking sensitive tokens in URL
  if (endpoint.includes('?')) {
    endpoint = endpoint.split('?')[0] + '?[REDACTED_QUERY]';
  }

  const safeContext = {
    ...context,
    url: endpoint,
    status,
    method: error?.config?.method || 'Unknown Method',
    // Rename to `requestHeaders` for clarity and redact any sensitive header values.
    requestHeaders: error?.config?.headers
      ? redactSensitiveData(error.config.headers)
      : undefined,
    // Redact the request body (e.g. POST/PUT payloads) to prevent PII or
    // credentials from being forwarded to Sentry.
    requestData:
      error?.config?.data && typeof error.config.data === 'object'
        ? redactSensitiveData(error.config.data)
        : undefined,
    message: error?.message,
    networkError: !error?.response,
  };

  // Only log if it's a 5xx error or a network/timeout failure
  // Usually we don't want to alert on 4xx errors (like 401 Unauthorized or 400 Bad Request) 
  // as they are expected client errors, unless explicitly requested
  if (!error.response || (status >= 500 && status < 600)) {
    captureException(error, safeContext);
  } else  {
   logger.warn(`[NetworkLogger] Expected client error (Status: ${status}) for ${endpoint}`);
  }
};
