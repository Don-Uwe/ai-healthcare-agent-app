import { captureException } from './errorHandler';

/**
 * Safely strips sensitive information from headers or payloads.
 */
const redactSensitiveData = (data: any) => {
  if (!data) return data;
  
  const redacted = { ...data };
  const sensitiveKeys = ['authorization', 'token', 'password', 'secret', 'cookie'];

  for (const key in redacted) {
    if (sensitiveKeys.includes(key.toLowerCase())) {
      redacted[key] = '[REDACTED]';
    } else if (typeof redacted[key] === 'object') {
      redacted[key] = '[OBJECT]';
    }
  }

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
    headers: error?.config?.headers ? redactSensitiveData(error.config.headers) : undefined,
    message: error?.message,
    networkError: !error?.response,
  };

  // Only log if it's a 5xx error or a network/timeout failure
  // Usually we don't want to alert on 4xx errors (like 401 Unauthorized or 400 Bad Request) 
  // as they are expected client errors, unless explicitly requested
  if (!error.response || (status >= 500 && status < 600)) {
    captureException(error, safeContext);
  } else if (__DEV__) {
    console.warn(`[NetworkLogger] Expected client error (Status: ${status}) for ${endpoint}`);
  }
};
