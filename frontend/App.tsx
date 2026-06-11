import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setAudioModeAsync } from 'expo-audio';
import * as Sentry from '@sentry/react-native';
import { logger } from './src/services/monitoring/logger';

import AppContent from './src/components/AppContent';

function App() {
const [queryClient] = useState(
() =>
new QueryClient({
defaultOptions: {
queries: {
retry: 2,
staleTime: 1000 * 60,
},
},
})
);

  useEffect(() => {
    let isMounted = true;

    const configureAudio = async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });
      } catch (error) {
        // Prevent state/logging side-effects if unmounted
        if (!isMounted) return;

        Sentry.captureException(error, {
          tags: { feature: 'audio_playback' },
          extra: { context: 'App startup audio configuration' },
        });

        
          logger.error('[App] Failed to configure audio mode:', error);
        }
      }
    };

    configureAudio();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

// 3. Using standard Sentry wrapping (or keep your custom one if verified)
export default Sentry.wrap(App);
