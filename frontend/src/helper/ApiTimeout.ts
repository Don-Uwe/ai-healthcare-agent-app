import { logApiError } from '../services/monitoring/networkLogger';

/** Default timeout duration for API requests in milliseconds (15 seconds) */
export const API_REQUEST_TIMEOUT_MS = 15000;

/** Default error message shown when API requests timeout */
export const API_TIMEOUT_ERROR_MESSAGE =
  'Request timed out. Please check your connection and try again.';

/**
 * Custom error class for API timeout scenarios.
 * Extends the standard Error class with a specific error code.
 */
export class ApiTimeoutError extends Error {
  code = 'ECONNABORTED';

  /**
   * Creates a new ApiTimeoutError instance.
   * @param timeoutMs - The timeout duration in milliseconds that was exceeded
   */
  constructor(timeoutMs: number = API_REQUEST_TIMEOUT_MS) {
    // Build on top of the shared API_TIMEOUT_ERROR_MESSAGE constant so both
    // fetch-path and axios-path timeout errors stay textually consistent.
    super(
      `Request timed out after ${Math.round(
        timeoutMs / 1000,
      )} seconds. ${API_TIMEOUT_ERROR_MESSAGE}`,
    );
    this.name = 'ApiTimeoutError';
  }
}

type FetchInput = Parameters<typeof fetch>[0];
type FetchInit = Parameters<typeof fetch>[1];

/**
 * Factory function to create ApiTimeoutError instances.
 * @param timeoutMs - The timeout duration in milliseconds
 * @returns A new ApiTimeoutError instance
 */
export function createApiTimeoutError(timeoutMs = API_REQUEST_TIMEOUT_MS) {
  return new ApiTimeoutError(timeoutMs);
}

/**
 * Wraps the native fetch API with a configurable timeout mechanism.
 * Automatically aborts the request if it exceeds the specified timeout duration.
 * 
 * @param input - URL string or Request object to fetch
 * @param init - Fetch options (headers, method, body, signal, etc.)
 * @param timeoutMs - Timeout duration in milliseconds (default: 15000ms)
 * @returns Promise resolving to the Response object
 * @throws {ApiTimeoutError} When the request exceeds the timeout duration
 * 
 * @example
 * ```typescript
 * // Simple GET request with default timeout
 * const response = await fetchWithTimeout('https://api.example.com/data');
 * 
 * // POST request with custom timeout
 * const response = await fetchWithTimeout(
 *   'https://api.example.com/users',
 *   { method: 'POST', body: JSON.stringify(data) },
 *   10000
 * );
 * ```
 */
export async function fetchWithTimeout(
  input: FetchInput,
  init: FetchInit = {},
  timeoutMs = API_REQUEST_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  // `init` defaults to `{}` via the parameter default, so no need for `?? {}`.
  const requestInit = init;
  const externalSignal = requestInit.signal;
  let didTimeout = false;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const abortFromExternalSignal = () => {
    controller.abort();
  };

  if (externalSignal) {
    if (externalSignal.aborted) {
      abortFromExternalSignal();
    } else {
      externalSignal.addEventListener('abort', abortFromExternalSignal);
    }
  }

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      didTimeout = true;
      reject(createApiTimeoutError(timeoutMs));
      controller.abort();
    }, timeoutMs);
  });

  try {
    const response = await Promise.race([
      fetch(input, {
        ...requestInit,
        signal: controller.signal,
      }),
      timeoutPromise,
    ]);

    // Successful HTTP error responses (e.g. 4xx/5xx) are returned normally above
    // and handled by the caller (typically the Axios response interceptor via networkLogger).
    // This catch block only fires for hard network failures (e.g. DNS, connection refused)
    // or when the AbortController fires due to a timeout.
    return response;
  } catch (error) {
    if (didTimeout) {
      const timeoutError = error instanceof ApiTimeoutError ? error : createApiTimeoutError(timeoutMs);
      logApiError(timeoutError, typeof input === 'string' ? input : undefined, { handler: 'fetchWithTimeout' });
      throw timeoutError;
    }

    logApiError(error, typeof input === 'string' ? input : undefined, { handler: 'fetchWithTimeout' });
    throw error;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    externalSignal?.removeEventListener('abort', abortFromExternalSignal);
  }
}
