import axios from 'axios';
import {Alert, Platform, ToastAndroid} from 'react-native';
import store from '../store/ReduxStore';
import {
  setGuestMode,
  setUserHandle,
  setUserId,
  setUserToken,
} from '../store/UserSlice';
import { KEYS, removeItem, clearStorage } from './Utils';
import { secureRemoveItem } from './SecureStorageUtils';

let interceptorInitialized = false;
let sessionExpiredNotified = false;

export const setupAxiosInterceptor = () => {
  // Guard against duplicate interceptor registration during re-renders.
  if (interceptorInitialized) {
    return;
  }

  interceptorInitialized = true;

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
        secureRemoveItem(KEYS.USER_TOKEN);
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
};
