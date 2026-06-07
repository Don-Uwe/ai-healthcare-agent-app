import { FirebaseProvider } from '@/hooks/FirebaseContext';
import { useCheckTokenStatus } from '@/src/hooks/useGetTokenStatus';
import { useNotificationListeners } from '@/hooks/useNotificationListener';
import { useVersionCheck } from '@/hooks/useVersionCheck';
import { SocketProvider } from '../contexts/SocketContext';
import { PreferencesProvider } from '../contexts/PreferencesContext';
import config from '@/tamagui.config';
import messaging from '@react-native-firebase/messaging';
import {
  NavigationContainer,
  type NavigationContainerRef,
} from '@react-navigation/native';
import React, { useEffect, useRef, useCallback } from 'react';

import { View, useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { addEventListener } from '@react-native-community/netinfo';
import { useDispatch, useSelector } from 'react-redux';
import { TamaguiProvider } from 'tamagui';
import { initDeepLinking } from '../helper/DeepLinkService';
import StackNavigation from '../navigations/StackNavigation';
import { CustomAlertDialog } from './CustomAlert';
import UpdateModal from './UpdateModal';
import { setConnected } from '../store/NetworkSlice';
import { firebaseInit } from '../helper/firebase';
import { cleanUpDownloads } from '../helper/Utils';
import { SECURE_KEYS, secureRetrieveItem } from '../helper/SecureStorageUtils';
import { setUserToken, setGuestMode } from '../store/UserSlice';
import { RootState } from '../store/ReduxStore';
import { setupAxiosInterceptor } from '../helper/setupAxiosInterceptor';
import { initMonitoring } from '../services/monitoring/sentry';

export default function AppContent() {
  const navigationRef = useRef<NavigationContainerRef<any> | null>(null);
  const hasInitialized = useRef(false);
  // Used only for TamaguiProvider theming. StatusBar styling is owned by CustomStatusBar.
  const isDarkMode = useColorScheme() === 'dark';

  const { data: tokenRes = null } = useCheckTokenStatus();
  const { user_token, isGuest } = useSelector((state: RootState) => state.user);

  // Initialise monitoring and axios interceptors once on mount.
  // initMonitoring() is placed here (rather than index.js module scope) so that
  // expo-application metadata is fully available when Sentry reads
  // nativeApplicationVersion / nativeBuildVersion.
  // setupAxiosInterceptor() is idempotent — it ejects and re-registers interceptors
  // on every call, so double-invocations from React Strict Mode are safe.
  useEffect(() => {
    initMonitoring();
    setupAxiosInterceptor();
  }, []);

  const { visible, storeUrl } = useVersionCheck();
  const dispatch = useDispatch();

  const checkToken = useCallback(async () => {
    const token = await secureRetrieveItem(SECURE_KEYS.USER_TOKEN);

    dispatch(setUserToken(token));
    if (token) {
      dispatch(setGuestMode(false));
    }
  }, [dispatch]);

  useEffect(() => {
    if (navigationRef.current && tokenRes && !hasInitialized.current) {
      hasInitialized.current = true;
      checkToken();
    }
  }, [checkToken, tokenRes]);

  useEffect(() => {
    if (!navigationRef.current) {
      return;
    }

    if (!isGuest && tokenRes === null && !user_token) {
      return;
    }

    const isAuthenticated =
      Boolean(tokenRes?.isValid || user_token) && !isGuest;
    return initDeepLinking(navigationRef.current, isAuthenticated);
  }, [isGuest, tokenRes, user_token]);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      // Only log notification payloads in development to avoid leaking
      // FCM message content (including user-targeted data fields) to
      // production log aggregators or crash reporters.
      if (__DEV__) {
        console.log(
          'Foreground notification received from message:',
          remoteMessage,
        );
      }
    });

    const unsubscribe1 = addEventListener(state => {
      if (__DEV__) {
        console.log('Connection type', state.type);
        console.log('Is connected?', state.isConnected);
      }
      /** Dispatch use a reducer to update the value in store */
      dispatch(setConnected(state.isConnected));
    });

    const onOpenApp = messaging().onNotificationOpenedApp(remoteMessage => {
      if (__DEV__) {
        console.log('Notification caused app to open:', remoteMessage);
      }
      // const data = remoteMessage.data;
      // handleNotification(data);
    });

    return () => {
      unsubscribe();
      unsubscribe1();
      onOpenApp();
    };
  }, [dispatch]);

  useEffect(() => {
    firebaseInit();
    cleanUpDownloads();
  }, []);

  useNotificationListeners();

  return (
    <TamaguiProvider
      config={config}
      defaultTheme={isDarkMode ? 'dark' : 'light'}>
      <FirebaseProvider>
        <SocketProvider>
          <PreferencesProvider>
            <SafeAreaProvider>
              <PaperProvider
                theme={{
                  dark: isDarkMode,
                  colors: {
                    primary: '#000A60',
                    background: isDarkMode ? '#0F172A' : '#FFFFFF',
                    text: isDarkMode ? '#FFFFFF' : '#000000',
                  },
                }}>
                <View
                  style={{
                    flex: 1,
                    backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                  }}>
                  {/* StatusBar is managed globally by CustomStatusBar — do not add one here. */}
                  <NavigationContainer ref={navigationRef}>
                    <StackNavigation />
                  </NavigationContainer>
                  <CustomAlertDialog key={'alert'} />
                  <UpdateModal visible={visible} storeUrl={storeUrl} />
                </View>
              </PaperProvider>
            </SafeAreaProvider>
          </PreferencesProvider>
        </SocketProvider>
      </FirebaseProvider>
    </TamaguiProvider>
  );
}
