import axios from 'axios';
import authAxios from './authAxios';
import {Alert, Platform, ToastAndroid} from 'react-native';
import store from '../store/ReduxStore';
import {
  setGuestMode,
  setUserHandle,
  setUserId,
  setUserToken,
} from '../store/UserSlice';
import {
  API_REQUEST_TIMEOUT_MS,
  API_TIMEOUT_ERROR_MESSAGE,
} from './ApiTimeout';
import {KEYS, removeItem} from './Utils';
import {SECURE_KEYS, secureRemoveItem, secureRetrieveItem} from './SecureStorageUtils';
import {logApiError} from '../services/monitoring/networkLogger';

/**
 * Module-scoped flag to suppress duplicate "session expired" notifications
 * within a single session (e.g., when multiple in-flight requests all fail
 * with 401 at the same time).
 *
 * Reset this via `resetSessionExpiredNotification()` whenever a new valid
 * session starts (i.e., after a successful login).
 */
let sessionExpiredNotified = false;

/**
 * Module-scoped interceptor IDs.
 *
 * Storing the numeric IDs returned by `.use()` lets us call `.eject()` before
 * re-registering — making `setupAxiosInterceptor()` safely idempotent even if
 * invoked multiple times (e.g. React Strict Mode double-effect, hot reloads).
 */
let _axiosReqId: number | null = null;
let _axiosResId: number | null = null;
let _authAxiosResId: number | null = null;

/**
 * Resets the session-expired notification flag.
 * Call this from your login success handler so that if the *new* session
 * later expires, the user sees the notification again.
 *
 * @example
 * // In LoginScreen onSuccess:
 * import { resetSessionExpiredNotification } from '../../helper/setupAxiosInterceptor';
 * resetSessionExpiredNotification();
 */
export const resetSessionExpiredNotification = (): void => {
  sessionExpiredNotified = false;
};

/**
 * Shared error handler used by both axios instances.
 * Logs API errors safely and handles 401 Unauthorized specifically.
 */
const handleError = (error: any) => {
  // Log the API error securely without exposing secrets
  logApiError(error, undefined, {handler: 'axiosInterceptor'});

  if (error?.response?.status === 401) {
    store.dispatch(setUserToken(''));
    store.dispatch(setUserId(''));
    store.dispatch(setUserHandle(''));
    store.dispatch(setGuestMode(true));

    // Clear token from secure storage to prevent re-attachment by request interceptor.
    secureRemoveItem(SECURE_KEYS.USER_TOKEN);
    removeItem(KEYS.USER_TOKEN_EXPIRY_DATE);
    removeItem(KEYS.USER_ID);
    removeItem(KEYS.USER_HANDLE);

    // Notify once to avoid alert/toast spam if multiple calls fail simultaneously.
    if (!sessionExpiredNotified) {
      sessionExpiredNotified = true;
      const message =
        'Your session has expired. You are now browsing as a guest.';

      if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.SHORT);
      } else {
        Alert.alert('Session Expired', message);
      }
    }
  }

  return Promise.reject(error);
};

/**
 * Configures axios with timeout defaults and response/request interceptors.
 *
 * Sets up:
 * - Global timeout configuration for both axios instances (default + authAxios)
 * - Request interceptor to dynamically attach the Bearer token
 * - Response interceptor for handling 401 (unauthorized) errors
 * - Automatic logout and guest mode activation on session expiry
 *
 * This function is **idempotent**: it ejects any previously registered
 * interceptors before re-registering, so it is safe to call more than once
 * (e.g. React Strict Mode double-effect, hot reloads, auth re-initialisation).
 * The previous doc-comment stated that `useEffect([])` was a sufficient guard —
 * that is only true in production; in development React Strict Mode deliberately
 * double-invokes effects, so an explicit eject guard is required.
 *
 * @example
 * ```typescript
 * // AppContent.tsx
 * useEffect(() => {
 *   setupAxiosInterceptor();
 * }, []);
 * ```
 */
export const setupAxiosInterceptor = () => {
  // --- Eject any previously registered interceptors -------------------------
  // This makes the function idempotent regardless of how many times it is
  // called. Without ejecting, each call appends a new interceptor handler,
  // leading to duplicate 401 logouts, repeated error toasts, and performance
  // degradation from stacked async handlers.
  if (_axiosReqId !== null) {
    axios.interceptors.request.eject(_axiosReqId);
  }
  if (_axiosResId !== null) {
    axios.interceptors.response.eject(_axiosResId);
  }
  if (_authAxiosResId !== null) {
    authAxios.interceptors.response.eject(_authAxiosResId);
  }
  // --------------------------------------------------------------------------

  // Ensure global axios instance has default Content-Type for JSON requests
  axios.defaults.headers.common['Content-Type'] = 'application/json';

  // Apply shared timeout defaults so requests cannot hang indefinitely
  // on slow or stalled networks.
  axios.defaults.timeout = API_REQUEST_TIMEOUT_MS;
  axios.defaults.timeoutErrorMessage = API_TIMEOUT_ERROR_MESSAGE;
  authAxios.defaults.timeout = API_REQUEST_TIMEOUT_MS;
  authAxios.defaults.timeoutErrorMessage = API_TIMEOUT_ERROR_MESSAGE;

  // Request interceptor: dynamically attach Bearer token before every request.
  // `config.headers ??= {}` guards against the rare case where an Axios adapter
  // or custom config omits the headers object entirely.
  _axiosReqId = axios.interceptors.request.use(
    async config => {
      config.headers ??= {} as typeof config.headers;
      const token = await secureRetrieveItem(SECURE_KEYS.USER_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // Remove Authorization header to prevent sending "Bearer undefined/null"
        delete config.headers.Authorization;
      }
      return config;
    },
    error => Promise.reject(error),
  );

  // Attach error handler to both the global axios instance (used by existing hooks)
  // and authAxios (used by migrated code with the request interceptor).
  // Store returned IDs so we can eject on the next call.
  _axiosResId = axios.interceptors.response.use(response => response, handleError);
  _authAxiosResId = authAxios.interceptors.response.use(response => response, handleError);
};
