import {FirebaseProvider} from '@/hooks/FirebaseContext';
import {useCheckTokenStatus} from '@/src/hooks/useGetTokenStatus';
import {useNotificationListeners} from '@/hooks/useNotificationListener';
import {useVersionCheck} from '@/hooks/useVersionCheck';
import {SocketProvider} from '../contexts/SocketContext';
import config from '@/tamagui.config';
import messaging from '@react-native-firebase/messaging';
import {
  NavigationContainer,
  type NavigationContainerRef,
} from '@react-navigation/native';
import React, {useEffect, useRef, useCallback} from 'react';

import {View, useColorScheme} from 'react-native';
import {PaperProvider} from 'react-native-paper';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {addEventListener} from '@react-native-community/netinfo';
import {useDispatch, useSelector} from 'react-redux';
import {TamaguiProvider} from 'tamagui';
import {initDeepLinking} from '../helper/DeepLinkService';
import StackNavigation from '../navigations/StackNavigation';
import {CustomAlertDialog} from './CustomAlert';
import UpdateModal from './UpdateModal';
import {setConnected} from '../store/NetworkSlice';
import {firebaseInit} from '../helper/firebase';
import {cleanUpDownloads} from '../helper/Utils';
import {SECURE_KEYS, secureRetrieveItem} from '../helper/SecureStorageUtils';
import {setUserToken, setGuestMode} from '../store/UserSlice';
import {RootState} from '../store/ReduxStore';
import {setupAxiosInterceptor} from '../helper/setupAxiosInterceptor';

export default function AppContent() {
  const navigationRef = useRef<NavigationContainerRef<any> | null>(null);
  const hasInitialized = useRef(false);
  // Used only for TamaguiProvider theming. StatusBar styling is owned by CustomStatusBar.
  const isDarkMode = useColorScheme() === 'dark';

  const {data: tokenRes = null} = useCheckTokenStatus();
  const {user_token, isGuest} = useSelector((state: RootState) => state.user);

  // Setup axios interceptor and timeout defaults once on mount.
  useEffect(() => {
    setupAxiosInterceptor();
  }, []);

  const {visible, storeUrl} = useVersionCheck();
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
      console.log(
        'Foreground notification received from message:',
        remoteMessage,
      );
    });

    // On app open

    const unsubscribe1 = addEventListener(state => {
      console.log('Connection type', state.type);
      console.log('Is connected?', state.isConnected);
      /** Dispatch use a reducer to update the value in store */
      dispatch(setConnected(state.isConnected));
    });
    const onOpenApp = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification caused app to open:', remoteMessage);
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
          <SafeAreaProvider>
            <PaperProvider>
              <View style={{flex: 1}}>
                {/* StatusBar is managed globally by CustomStatusBar — do not add one here. */}
                <NavigationContainer ref={navigationRef}>
                  <StackNavigation />
                </NavigationContainer>
                <CustomAlertDialog key={'alert'} />
                <UpdateModal visible={visible} storeUrl={storeUrl} />
              </View>
            </PaperProvider>
          </SafeAreaProvider>
        </SocketProvider>
      </FirebaseProvider>
    </TamaguiProvider>
  );
}
