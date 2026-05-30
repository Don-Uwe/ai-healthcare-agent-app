import axios from 'axios';
import {
  API_REQUEST_TIMEOUT_MS,
  API_TIMEOUT_ERROR_MESSAGE,
  fetchWithTimeout,
} from '../ApiTimeout';
import {
  getMethodCall,
  postMethodCallwithToken,
} from '../CallAPI';
import {setupAxiosInterceptor} from '../setupAxiosInterceptor';

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  jest.clearAllMocks();
  jest.useRealTimers();
});

describe('fetchWithTimeout', () => {
  it('resolves when fetch completes before the timeout', async () => {
    const response = {ok: true} as Response;
    const fetchMock = jest.fn().mockResolvedValue(response);
    global.fetch = fetchMock as typeof fetch;

    await expect(
      fetchWithTimeout('https://example.com/health', {}, 1000),
    ).resolves.toBe(response);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.com/health',
      expect.objectContaining({
        signal: expect.any(Object),
      }),
    );
  });

  it('rejects with a clear timeout error for stalled requests', async () => {
    jest.useFakeTimers();

    const fetchMock = jest.fn(
      (_input: Parameters<typeof fetch>[0], init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            const abortError = new Error('Aborted');
            abortError.name = 'AbortError';
            reject(abortError);
          });
        }),
    );
    global.fetch = fetchMock as typeof fetch;

    const request = fetchWithTimeout('https://example.com/slow', {}, 1000);

    jest.advanceTimersByTime(1000);

    await expect(request).rejects.toMatchObject({
      name: 'ApiTimeoutError',
      code: 'ECONNABORTED',
      message:
        'Request timed out after 1 seconds. Please check your connection and try again.',
    });
  });
});

describe('CallAPI helpers', () => {
  it('uses the timeout-enabled fetch wrapper for authenticated POST calls', async () => {
    const json = jest.fn().mockResolvedValue({success: true});
    const fetchMock = jest.fn().mockResolvedValue({json} as unknown as Response);
    global.fetch = fetchMock as typeof fetch;

    await expect(
      postMethodCallwithToken(
        'https://example.com/api',
        {name: 'Ada'},
        'token-123',
      ),
    ).resolves.toEqual({success: true});

    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.com/api',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer token-123',
        }),
        signal: expect.any(Object),
      }),
    );
  });

  it('uses the timeout-enabled fetch wrapper for simple GET calls', async () => {
    const json = jest.fn().mockResolvedValue({items: []});
    const fetchMock = jest.fn().mockResolvedValue({json} as unknown as Response);
    global.fetch = fetchMock as typeof fetch;

    await expect(getMethodCall('https://example.com/api')).resolves.toEqual({
      items: [],
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.com/api',
      expect.objectContaining({
        method: 'GET',
        signal: expect.any(Object),
      }),
    );
  });
});

describe('setupAxiosInterceptor', () => {
  it('configures shared axios timeout defaults', () => {
    axios.defaults.timeout = 0;
    axios.defaults.timeoutErrorMessage = undefined;

    setupAxiosInterceptor();

    expect(axios.defaults.timeout).toBe(API_REQUEST_TIMEOUT_MS);
    expect(axios.defaults.timeoutErrorMessage).toBe(API_TIMEOUT_ERROR_MESSAGE);
  });
});
