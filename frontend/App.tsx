/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect} from 'react';
//import {Colors} from 'react-native/Libraries/NewAppScreen';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
//import PushNotification from 'react-native-push-notification';
import {setAudioModeAsync} from 'expo-audio';

import AppContent from './src/components/AppContent';

import { wrapWithSentry } from './src/services/monitoring/sentry';

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    setAudioModeAsync({
      //staysActiveInBackground: true,
      playsInSilentMode: true,
      allowsRecording: true,
    });
  }, []);

  return (
     <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default wrapWithSentry(App);
