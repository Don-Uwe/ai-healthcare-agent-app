/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect} from 'react';
import {Platform,  useColorScheme, View} from 'react-native';
//import {Colors} from 'react-native/Libraries/NewAppScreen';
import {ON_PRIMARY_COLOR, PRIMARY_COLOR, SECONDARY_COLOR} from './src/helper/Theme';
import {NavigationContainer} from '@react-navigation/native';
import StackNavigation from './src/navigations/StackNavigation';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {addEventListener} from '@react-native-community/netinfo';
import {setConnected} from './src/store/NetworkSlice';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import messaging from '@react-native-firebase/messaging';
//import PushNotification from 'react-native-push-notification';

import {SocketProvider} from './SocketContext';
import {useDispatch} from 'react-redux';
import {cleanUpDownloads} from './src/helper/Utils';
import { Provider as PaperProvider } from 'react-native-paper';
import { TamaguiProvider } from 'tamagui';
import config from './tamagui.config';
import { FirebaseProvider } from './hooks/FirebaseContext';
import { StatusBar } from 'expo-status-bar';
import { CustomAlertDialog } from './src/components/CustomAlert';
import { firebaseInit } from './src/helper/firebase';
import { useNotificationListeners } from './hooks/useNotificationListener';
import { useVersionCheck } from './hooks/useVersionCheck';
import UpdateModal from './src/components/UpdateModal';

const queryClient = new QueryClient();

type Conf = typeof config

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends Conf {}
}

function App(): React.JSX.Element {
  
  const { visible, storeUrl } = useVersionCheck();
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#000' : ON_PRIMARY_COLOR,
  };

  const BarStyle = Platform.OS === 'ios' ? 'dark-content' : 'light-content';
  //const navigationContainerRef = useRef();
  const dispatch = useDispatch();

 

  useEffect(() => {
    firebaseInit();
    cleanUpDownloads();
  }, []);

  useNotificationListeners();

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

 
  return (
    <TamaguiProvider config={config}>
    <QueryClientProvider client={queryClient}>
         <FirebaseProvider>
      <SocketProvider>
        <SafeAreaProvider>
         
          <PaperProvider>
          <View
            style={{flex: 1, backgroundColor: backgroundStyle.backgroundColor}}>
            <StatusBar style="dark" backgroundColor={'#000A60'} />
            <NavigationContainer>
              <StackNavigation />
            </NavigationContainer>
             <CustomAlertDialog key={'alert'} /> 
              <UpdateModal visible={visible} storeUrl={storeUrl} />
          </View>
          </PaperProvider>
        
        </SafeAreaProvider>
        
      </SocketProvider>
      </FirebaseProvider>
    </QueryClientProvider>
    </TamaguiProvider>
  );
}

export default App;
