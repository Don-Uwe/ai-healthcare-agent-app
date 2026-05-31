import React, {useEffect} from 'react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {setAudioModeAsync} from 'expo-audio';
import * as Sentry from '@sentry/react-native';

import AppContent from './src/components/AppContent';
import {wrapWithSentry} from './src/services/monitoring/sentry';

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    const configureAudio = async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });
      } catch (error) {
        // Report to Sentry so production audio failures are visible to developers
        Sentry.captureException(error, {
          tags: {feature: 'audio_playback'},
          extra: {context: 'App startup audio configuration'},
        });

        if (__DEV__) {
          console.error('[App] Failed to configure audio mode:', error);
        }
      }
    };

    configureAudio();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default wrapWithSentry(App);
