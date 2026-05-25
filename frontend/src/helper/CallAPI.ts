import {fetchWithTimeout} from './ApiTimeout';

/**
 * API Call Helpers
 * 
 * This module provides an abstraction layer over all types of API calls (POST, GET, UPDATE, DELETE)
 * with support for authenticated and non-authenticated requests.
 * All functions use fetchWithTimeout to ensure requests don't hang indefinitely.
 */

/**
 * Makes an authenticated POST request with a bearer token.
 * 
 * @template T - The expected response type
 * @param url - The API endpoint URL
 * @param params - The request body data (will be JSON stringified)
 * @param authToken - The authentication bearer token
 * @returns Promise resolving to the parsed JSON response
 * @throws {ApiTimeoutError} When the request exceeds the timeout duration
 * 
 * @example
 * ```typescript
 * interface User { id: string; name: string; }
 * const user = await postMethodCallwithToken<User>(
 *   'https://api.example.com/users',
 *   { name: 'John Doe' },
 *   'your-auth-token'
 * );
 * ```
 */
export function postMethodCallwithToken<T = unknown>(
  url: string,
  params: unknown,
  authToken: string,
): Promise<T> {
  return fetchWithTimeout(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'cache-control': 'no-cache',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(params),
  }).then(response => response.json());
}

/**
 * Makes a simple POST request without authentication.
 * 
 * @template T - The expected response type
 * @param url - The API endpoint URL
 * @param params - The request body data (will be JSON stringified)
 * @returns Promise resolving to the parsed JSON response
 * @throws {ApiTimeoutError} When the request exceeds the timeout duration
 * 
 * @example
 * ```typescript
 * interface LoginResponse { token: string; }
 * const response = await postMethodCall<LoginResponse>(
 *   'https://api.example.com/login',
 *   { email: 'user@example.com', password: 'secret' }
 * );
 * ```
 */
export function postMethodCall<T = unknown>(
  url: string,
  params: unknown,
): Promise<T> {
  return fetchWithTimeout(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  }).then(response => response.json());
}

/**
 * Makes an authenticated GET request with a bearer token.
 * 
 * @template T - The expected response type
 * @param url - The API endpoint URL
 * @param authToken - The authentication bearer token
 * @returns Promise resolving to the parsed JSON response
 * @throws {ApiTimeoutError} When the request exceeds the timeout duration
 * 
 * @example
 * ```typescript
 * interface UserProfile { id: string; name: string; email: string; }
 * const profile = await getMethodCallwithToken<UserProfile>(
 *   'https://api.example.com/profile',
 *   'your-auth-token'
 * );
 * ```
 */
export function getMethodCallwithToken<T = unknown>(
  url: string,
  authToken: string,
): Promise<T> {
  return fetchWithTimeout(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
  }).then(response => response.json());
}

/**
 * Makes a simple GET request without authentication.
 * 
 * @template T - The expected response type
 * @param url - The API endpoint URL
 * @returns Promise resolving to the parsed JSON response
 * @throws {ApiTimeoutError} When the request exceeds the timeout duration
 * 
 * @example
 * ```typescript
 * interface Article { id: string; title: string; content: string; }
 * const articles = await getMethodCall<Article[]>(
 *   'https://api.example.com/articles'
 * );
 * ```
 */
export function getMethodCall<T = unknown>(url: string): Promise<T> {
  return fetchWithTimeout(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  }).then(response => response.json());
}
