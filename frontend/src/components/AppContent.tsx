import {FirebaseProvider} from '@/hooks/FirebaseContext';
import {useCheckTokenStatus} from '@/hooks/useGetTokenStatus';
import {useNotificationListeners} from '@/hooks/useNotificationListener';
import {useVersionCheck} from '@/hooks/useVersionCheck';
import {SocketProvider} from '@/SocketContext';
import config from '@/tamagui.config';
import messaging from '@react-native-firebase/messaging';
import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect, useRef} from 'react';
import {useColorScheme, View} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {PaperProvider} from 'react-native-paper';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {addEventListener} from '@react-native-community/netinfo';
import {useDispatch} from 'react-redux';
import {TamaguiProvider} from 'tamagui';
import {initDeepLinking} from '../helper/DeepLinkService';
import StackNavigation from '../navigations/StackNavigation';
import {CustomAlertDialog} from './CustomAlert';
import UpdateModal from './UpdateModal';
import {ON_PRIMARY_COLOR} from '../helper/Theme';
import {setConnected} from '../store/NetworkSlice';
import {firebaseInit} from '../helper/firebase';
import {cleanUpDownloads, KEYS, retrieveItem} from '../helper/Utils';
import { setUserToken } from '../store/UserSlice';

export default function AppContent() {
  const navigationRef = useRef(null);
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#000' : ON_PRIMARY_COLOR,
  };

  const {data: tokenRes = null, isLoading} = useCheckTokenStatus();
  const {visible, storeUrl} = useVersionCheck();
  const dispatch = useDispatch();

  useEffect(() => {
    if (navigationRef.current && tokenRes) {
      
      checkToken();
    }
  }, [tokenRes, isLoading]);

  const checkToken = async () =>{
    const token = await retrieveItem(KEYS.USER_TOKEN);

      dispatch(setUserToken(token));
      initDeepLinking(navigationRef.current, tokenRes?.isValid || false);
    
  }

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log(
        'Foreground notification received from message:',
        remoteMessage,
      );
    });

    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Background notification received:', remoteMessage); // wjem app is in bg
      // const data = remoteMessage.data;
      //handleNotification(data);
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
    <TamaguiProvider config={config}>
      <FirebaseProvider>
        <SocketProvider>
          <SafeAreaProvider>
            <PaperProvider>
              <View style={{flex: 1}}>
                <StatusBar style="dark" backgroundColor={'#000A60'} />
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
