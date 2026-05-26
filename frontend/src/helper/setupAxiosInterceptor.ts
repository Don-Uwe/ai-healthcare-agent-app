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
<<<<<<< HEAD
import {SECURE_KEYS, secureRemoveItem} from './SecureStorageUtils';
=======
import { KEYS, removeItem, SECURE_KEYS } from './Utils';
import { secureRemoveItem } from './SecureStorageUtils';
>>>>>>> 50b9380e24c7a2c8761533207ac9ad780e3873ee

let interceptorInitialized = false;
let sessionExpiredNotified = false;

/**
 * Shared 401 error handler used by both axios instances.
 * Clears auth state, switches to guest mode, and notifies the user once.
 */
const handle401Error = (error: any) => {
  if (error?.response?.status === 401) {
    store.dispatch(setUserToken(''));
    store.dispatch(setUserId(''));
    store.dispatch(setUserHandle(''));
    store.dispatch(setGuestMode(true));

    // Clear token from secure storage to prevent re-attachment by request interceptor
    secureRemoveItem(SECURE_KEYS.USER_TOKEN);

    // Clear Authorization on both instances
    delete axios.defaults.headers.common['Authorization'];
    delete authAxios.defaults.headers.common['Authorization'];

    // Notify once to avoid alert/toast spam if multiple calls fail together.
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

export const setupAxiosInterceptor = () => {
  // Guard against duplicate interceptor registration during re-renders.
  if (interceptorInitialized) {
    return;
  }

  interceptorInitialized = true;

 main
  // Attach 401 handler to both the global axios instance (used by existing hooks)
  // and authAxios (used by new/migrated code with the request interceptor).
  axios.interceptors.response.use(response => response, handle401Error);
  authAxios.interceptors.response.use(response => response, handle401Error);

  axios.interceptors.response.use(
    response => response,
    error => {
      // Global auth-expiry handler: force logout state and switch to guest mode.
      if (error?.response?.status === 401) {
        store.dispatch(setUserToken(''));
        store.dispatch(setUserId(''));
        store.dispatch(setUserHandle(''));
        store.dispatch(setGuestMode(true));

        axios.defaults.headers.common.Authorization = '';
        secureRemoveItem(SECURE_KEYS.USER_TOKEN);
        removeItem(KEYS.USER_TOKEN_EXPIRY_DATE);
        removeItem(KEYS.USER_ID);
        removeItem(KEYS.USER_HANDLE);

        // Notify once to avoid alert/toast spam if multiple calls fail together.
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
    },
  );
 main
};
