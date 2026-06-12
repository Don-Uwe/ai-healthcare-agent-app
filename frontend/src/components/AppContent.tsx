import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useRef, useCallback } from 'react';
import { View, useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { TamaguiProvider, useTheme } from 'tamagui';

import { FirebaseProvider } from '@/hooks/FirebaseContext';
import { useCheckTokenStatus } from '@/src/hooks/useGetTokenStatus';
import { useNotificationListeners } from '@/hooks/useNotificationListener';
import { useVersionCheck } from '@/hooks/useVersionCheck';
import { SocketProvider } from '../contexts/SocketContext';
import { PreferencesProvider } from '../contexts/PreferencesContext';
import config from '@/tamagui.config';
import { InitDeepLinking } from '../helper/DeepLinkingService';

export function AppContent() {
  const colorScheme = useColorScheme();
  const dispatch = useDispatch();
  
  // Fetch real-time asynchronous authentication initialization metrics from Redux
  const { isLoading, isAuthenticated, deepLinkUrl } = useSelector((state: any) => state.auth);
  
  // 🧠 THE STATE BUFFER LAYER: Prevents stale closures from dropping link routing actions
  const navigationRef = useRef<any>(null);
  const pendingLinkRef = useRef<string | null>(null);

  // Run core system dependency validation checking pipelines natively
  useVersionCheck();
  useNotificationListeners();

  // Step 1: Securely cache incoming cold-start deep links inside the reference buffer
  useEffect(() => {
    if (deepLinkUrl) {
      pendingLinkRef.current = deepLinkUrl;
    }
  }, [deepLinkUrl]);

  // Step 2: Defer execution of deep link actions until auth context is definitively authorization-settled
  useEffect(() => {
    // Hold navigation frames securely while JWT background token checking runs async
    if (isLoading) return;

    if (pendingLinkRef.current && navigationRef.current) {
      if (isAuthenticated) {
        // User is verified -> Dispatch deep link safely to the internal dashboard engine
        InitDeepLinking(navigationRef.current, pendingLinkRef.current);
        pendingLinkRef.current = null; // Instantly flush reference pointer to block navigation re-triggering loops
      } else {
        // User is unauthorized -> Wipe buffer cache cleanly and route to login boundaries
        pendingLinkRef.current = null;
        navigationRef.current.navigate('Login');
      }
    }
  }, [isLoading, isAuthenticated]);

  return (
    <SafeAreaProvider>
      <TamaguiProvider config={config} defaultTheme={colorScheme === 'dark' ? 'dark' : 'light'}>
        <PaperProvider>
          <FirebaseProvider>
            <PreferencesProvider>
              <SocketProvider>
                <View style={{ flex: 1 }}>
                  <NavigationContainer ref={navigationRef}>
                    {/* Main app navigation tree routes process natively below */}
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
