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
import {SECURE_KEYS, secureRemoveItem} from './SecureStorageUtils';

import { logApiError } from '../services/monitoring/networkLogger';

let interceptorInitialized = false;
let sessionExpiredNotified = false;

/**
 * Shared error handler used by both axios instances.
 * Logs API errors safely and handles 401 unauthenticated specifically.
 */
const handleError = (error: any) => {
  // Log the API error securely without exposing secrets
  logApiError(error, undefined, { handler: 'axiosInterceptor' });

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
 * Configures axios with timeout defaults and response interceptors.
 *
 * Sets up:
 * - Global timeout configuration for both axios instances (default + authAxios)
 * - Response interceptor for handling 401 (unauthorized) errors
 * - Automatic logout and guest mode activation on session expiry
 *
 * This function is idempotent - calling it multiple times will only
 * register the interceptor once to prevent duplicate handlers.
 *
 * @example
 * ```typescript
 * // Call once during app initialization
 * useEffect(() => {
 *   setupAxiosInterceptor();
 * }, []);
 * ```
 */
export const setupAxiosInterceptor = () => {
  // Apply shared timeout defaults to both axios instances so requests cannot
  // hang indefinitely on slow or stalled networks.
  axios.defaults.timeout = API_REQUEST_TIMEOUT_MS;
  axios.defaults.timeoutErrorMessage = API_TIMEOUT_ERROR_MESSAGE;
  authAxios.defaults.timeout = API_REQUEST_TIMEOUT_MS;
  authAxios.defaults.timeoutErrorMessage = API_TIMEOUT_ERROR_MESSAGE;

  // Guard against duplicate interceptor registration during re-renders.
  if (interceptorInitialized) {
    return;
  }

  interceptorInitialized = true;

  // Attach error handler to both the global axios instance (used by existing hooks)
  // and authAxios (used by new/migrated code with the request interceptor).
  axios.interceptors.response.use(response => response, handleError);
  authAxios.interceptors.response.use(response => response, handleError);
};
