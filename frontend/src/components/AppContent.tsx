import React, { useEffect, useRef } from 'react';
import { useColorScheme, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider } from 'tamagui';
import { NavigationContainer } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import messaging from '@react-native-firebase/messaging';

import { FirebaseProvider } from '@/hooks/FirebaseContext';
import { useCheckTokenStatus } from '@/src/hooks/useGetTokenStatus';
import { useNotificationListeners } from '@/hooks/useNotificationListener';
import { useVersionCheck } from '@/hooks/useVersionCheck';
import { SocketProvider } from '../contexts/SocketContext';
import { PreferencesProvider } from '../contexts/PreferencesContext';
import config from '@/tamagui.config';

import { registerAndSyncPushToken } from '../helper/PushNotificationService';
import { initDeepLinking, navigateDeepLink, resolveNotificationTarget } from '../helper/DeepLinkService';
import { firebaseInit } from '../helper/firebase'; // Ensure file dependency matches project pathing rules
import { cleanUpDownloads } from '../helper/utils';   // Ensure file dependency matches project pathing rules

// Import your application's actual routing provider engine to prevent blank screen errors
// Note: Double-check the physical file path name inside your fork to match this import
import StackNavigation from '../navigation/StackNavigation'; 
import { NetworkBanner } from './NetworkBanner';

export function AppContent() {
  const colorScheme = useColorScheme();
  
  // Restore the application's native token check frameworks cleanly
  const { user_token, tokenRes, isLoading, isGuest } = useCheckTokenStatus();
  
  const navigationRef = useRef<any>(null);
  
  // 🧠 ASYNCHRONOUS AUTH GUARD BUFFER: Caches incoming deep link destination tokens securely during cold starts
  const pendingDeepLinkRef = useRef<string | null>(null);

  // Invoke core system validation pipelines natively
  useVersionCheck();
  useNotificationListeners();

  useEffect(() => {
    firebaseInit();
    cleanUpDownloads();

    // Securely register push tokens matching active session states
    if (user_token) {
      registerAndSyncPushToken(user_token);
    }

    // Intercept and buffer cold-start deep links until the navigation ref container binds securely
    initDeepLinking((url) => {
      if (url) {
        pendingDeepLinkRef.current = url;
        console.log('[Auth Guard] Cached incoming deep link securely inside reference buffer:', url);
      }
    });

    const onOpenApp = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification caused app to open from background state:', remoteMessage);
    });

    return () => {
      onOpenApp();
    };
  }, [user_token]);

  // Asynchronous Router Guard Loop: Defers target navigation loops until token validations resolve
  useEffect(() => {
    if (isLoading || !navigationRef.current || !pendingDeepLinkRef.current) return;

    const isAuthenticated = Boolean(tokenRes?.isValid || user_token) && !isGuest;

    if (isAuthenticated) {
      console.log('[Auth Guard] User is verified. Routing deep link payload destination string.');
      navigateDeepLink(navigationRef.current, pendingDeepLinkRef.current, true);
    } else {
      console.log('[Auth Guard] User is anonymous. Purging buffer and diverting to login gate schemas.');
      navigationRef.current.navigate('Login');
    }
    
    // Instantly flush pointer reference to block loops
    pendingDeepLinkRef.current = null;
  }, [isLoading, tokenRes, user_token, isGuest]);

  useEffect(() => {
    const handleNotificationResponse = async (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data;
      const target = resolveNotificationTarget(data);

      if (!target || !navigationRef.current) return;

      const isAuthenticated = Boolean(tokenRes?.isValid || user_token) && !isGuest;
      navigateDeepLink(navigationRef.current, target, isAuthenticated);
    };

    const responseListener = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);

    Notifications.getLastNotificationResponseAsync().then(response => {
      if (response) {
        handleNotificationResponse(response);
      }
    });

    return () => {
      responseListener.remove();
    };
  }, [user_token, tokenRes, isGuest]);

  return (
    <SafeAreaProvider>
      <TamaguiProvider config={config} defaultTheme={colorScheme === 'dark' ? 'dark' : 'light'}>
        <PaperProvider>
          <FirebaseProvider>
            <PreferencesProvider>
              <SocketProvider>
                <View style={{ flex: 1 }}>
                  <NetworkBanner />
                  <NavigationContainer ref={navigationRef}>
                    {/* 🚀 RESTORE APP ROUTER: Embed the navigation stack routing component back into the tree layout */}
                    <StackNavigation />
                  </NavigationContainer>
                </View>
              </SocketProvider>
            </PreferencesProvider>
          </FirebaseProvider>
        </PaperProvider>
      </TamaguiProvider>
    </SafeAreaProvider>
  );
}

