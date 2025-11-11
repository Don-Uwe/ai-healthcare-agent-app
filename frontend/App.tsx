/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect} from 'react';
import {Platform, StatusBar, useColorScheme, View} from 'react-native';
//import {Colors} from 'react-native/Libraries/NewAppScreen';
import {PRIMARY_COLOR, SECONDARY_COLOR} from './src/helper/Theme';
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

const queryClient = new QueryClient();

type Conf = typeof config

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends Conf {}
}

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#000' : SECONDARY_COLOR,
  };

  const BarStyle = Platform.OS === 'ios' ? 'dark-content' : 'light-content';
  //const navigationContainerRef = useRef();
  const dispatch = useDispatch();

 

  useEffect(() => {
    cleanUpDownloads();
  }, []);

  useEffect(() => {
    /*
    PushNotification.configure({
      onRegister: token => {
        console.log('FCM Token:', token);
      },

      onNotification: () => {
        // Handle notification action here
      },
      requestPermissions: true, // Automatically request permissions on iOS
    });

    // Create notification channels (Android specific)
    PushNotification.createChannel(
      {
        channelId: 'default-channel',
        channelName: 'Default Channel',
        channelDescription: 'UltimateHealth Notifications',
        playSound: true,
        soundName: 'default',
        importance: 4,
        vibrate: true,
      },
      created => console.log(`createChannel returned '${created}'`),
    );
    */
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log(
        'Foreground notification received from message:',
        remoteMessage,
      );
      //const data = remoteMessage.data;
      // handleNotification(data);

      /*
      PushNotification.localNotification({
        channelId: 'default-channel',
        title: remoteMessage?.notification?.title,
        message: remoteMessage?.notification?.body,
        playSound: true,
        soundName: 'default',
        priority: 'high',
        visibility: 'public',
      });
      */
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

  /*
  const handleNotification = data => {
    if (!navigationContainerRef.current) {
      return;
    }
    if (data?.action === 'openPost') {
      navigationContainerRef.current.navigate('ArticleScreen', {
        articleId: Number(data?.postId),
        authorId: data?.authorId.toString(),
      });
    } else if (data?.action === 'likePost') {
      navigationContainerRef.current.navigate('NotificationScreen');
    } else if (data?.action === 'commentPost') {
      navigationContainerRef.current.navigate('CommentScreen', {
        articleId: Number(data?.postId),
      });
    } else if (data?.action === 'commentLikePost') {
      navigationContainerRef.current.navigate('NotificationScreen');
    } else if (data?.action === 'userFollow') {
      navigationContainerRef.current.navigate('NotificationScreen');
    } else {
      navigationContainerRef.current.navigate('NotificationScreen');
    }
  };
  */

  return (
    <TamaguiProvider config={config}>
    <QueryClientProvider client={queryClient}>
         <FirebaseProvider>
      <SocketProvider>
        <SafeAreaProvider>
         
          <PaperProvider>
          <View
            style={{flex: 1, backgroundColor: backgroundStyle.backgroundColor}}>
            <StatusBar
              barStyle={isDarkMode ? 'light-content' : BarStyle}
              backgroundColor={
                isDarkMode ? backgroundStyle.backgroundColor : PRIMARY_COLOR
              }
            />
            <NavigationContainer>
              <StackNavigation />
            </NavigationContainer>
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
