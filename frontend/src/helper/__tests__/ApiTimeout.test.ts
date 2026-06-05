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
      // Message is composed of the duration prefix + API_TIMEOUT_ERROR_MESSAGE constant.
      message: `Request timed out after 1 seconds. ${API_TIMEOUT_ERROR_MESSAGE}`,
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
  beforeEach(() => {
    // Clear all interceptors so each test starts from a clean slate.
    // This prevents handler counts from accumulating across tests.
    (axios.interceptors.request as any).handlers = [];
    (axios.interceptors.response as any).handlers = [];
  });

  it('configures shared axios timeout defaults', () => {
    axios.defaults.timeout = 0;
    axios.defaults.timeoutErrorMessage = undefined;

    setupAxiosInterceptor();

    expect(axios.defaults.timeout).toBe(API_REQUEST_TIMEOUT_MS);
    expect(axios.defaults.timeoutErrorMessage).toBe(API_TIMEOUT_ERROR_MESSAGE);
  });

  it('does not stack interceptors when called multiple times (idempotency)', () => {
    setupAxiosInterceptor();
    setupAxiosInterceptor();
    setupAxiosInterceptor();

    // The eject-before-register guard should ensure only one handler is active
    // regardless of how many times the function is called. Without the guard,
    // duplicate interceptors would accumulate and could trigger multiple logout
    // dispatches, repeated toasts, and performance degradation.
    const activeReqHandlers = (axios.interceptors.request as any).handlers.filter(
      (h: any) => h !== null,
    );
    const activeResHandlers = (axios.interceptors.response as any).handlers.filter(
      (h: any) => h !== null,
    );

    expect(activeReqHandlers).toHaveLength(1);
    expect(activeResHandlers).toHaveLength(1);
  });

  it('attaches authorization header if token exists in secure store', async () => {
    const SecureStore = require('expo-secure-store');
    SecureStore.getItemAsync.mockResolvedValue('test-user-token');

    setupAxiosInterceptor();

    const config = { headers: {} as any };
    const handlers = (axios.interceptors.request as any).handlers;
    const interceptor = handlers.find((h: any) => h && h.fulfilled);
    expect(interceptor).toBeDefined();

    const resultConfig = await interceptor.fulfilled(config);
    expect(resultConfig.headers.Authorization).toBe('Bearer test-user-token');
  });

  it('removes authorization header if token is missing in secure store', async () => {
    const SecureStore = require('expo-secure-store');
    SecureStore.getItemAsync.mockResolvedValue(null);

    setupAxiosInterceptor();

    const config = { headers: { Authorization: 'Bearer old-token' } as any };
    const handlers = (axios.interceptors.request as any).handlers;
    const interceptor = handlers.find((h: any) => h && h.fulfilled);
    expect(interceptor).toBeDefined();

    const resultConfig = await interceptor.fulfilled(config);
    expect(resultConfig.headers.Authorization).toBeUndefined();
  });

  it('safely handles undefined headers object on request config', async () => {
    const SecureStore = require('expo-secure-store');
    SecureStore.getItemAsync.mockResolvedValue('safe-token');

    setupAxiosInterceptor();

    // Simulate a config where headers is undefined (edge-case Axios adapter behaviour)
    const config = { headers: undefined as any };
    const handlers = (axios.interceptors.request as any).handlers;
    const interceptor = handlers.find((h: any) => h && h.fulfilled);
    expect(interceptor).toBeDefined();

    // Should not throw a TypeError; headers should be initialised and token attached.
    const resultConfig = await interceptor.fulfilled(config);
    expect(resultConfig.headers).toBeDefined();
    expect(resultConfig.headers.Authorization).toBe('Bearer safe-token');
  });
});
