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

import {useColorScheme, View} from 'react-native';
import {StatusBar} from 'expo-status-bar';
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
import {cleanUpDownloads, KEYS, retrieveItem} from '../helper/Utils';
import {setUserToken, setGuestMode} from '../store/UserSlice';
import axios from 'axios';
import {setupAxiosInterceptor} from '../helper/setupAxiosInterceptor';

export default function AppContent() {
  const navigationRef = useRef<NavigationContainerRef<any> | null>(null);
  const hasInitialized = useRef(false);
  const isDarkMode = useColorScheme() === 'dark';

  const {data: tokenRes = null} = useCheckTokenStatus();
  const {user_token, isGuest} = useSelector((state: any) => state.user);

  const {visible, storeUrl} = useVersionCheck();
  const dispatch = useDispatch();

  // Setup axios interceptor once on mount
  useEffect(() => {
    setupAxiosInterceptor();
  }, []);

  const checkToken = useCallback(async () => {
    const token = await retrieveItem(KEYS.USER_TOKEN);

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    axios.defaults.headers.common['Content-Type'] = 'application/json';

    dispatch(setUserToken(token));
    if (token) {
      dispatch(setGuestMode(false));
    }
  }, [dispatch, tokenRes]);

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
                <StatusBar
                  style={isDarkMode ? 'light' : 'dark'}
                  backgroundColor={isDarkMode ? '#151718' : '#FFFFFF'}
                />
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
