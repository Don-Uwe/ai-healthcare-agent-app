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
 * This function is intended to be called **once** inside a `useEffect` with
 * an empty dependency array in `AppContent.tsx`. The `useEffect` lifecycle
 * is the idiomatic React guard against duplicate registrations — no global
 * boolean flag is needed here.
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
  // Ensure global axios instance has default Content-Type for JSON requests
  axios.defaults.headers.common['Content-Type'] = 'application/json';

  // Apply shared timeout defaults so requests cannot hang indefinitely
  // on slow or stalled networks.
  axios.defaults.timeout = API_REQUEST_TIMEOUT_MS;
  axios.defaults.timeoutErrorMessage = API_TIMEOUT_ERROR_MESSAGE;
  authAxios.defaults.timeout = API_REQUEST_TIMEOUT_MS;
  authAxios.defaults.timeoutErrorMessage = API_TIMEOUT_ERROR_MESSAGE;

  // Request interceptor: dynamically attach Bearer token before every request.
  axios.interceptors.request.use(
    async config => {
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
  axios.interceptors.response.use(response => response, handleError);
  authAxios.interceptors.response.use(response => response, handleError);
};
