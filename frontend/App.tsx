/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {} from 'react';
//import {Colors} from 'react-native/Libraries/NewAppScreen';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
//import PushNotification from 'react-native-push-notification';

import AppContent from './src/components/AppContent';

const queryClient = new QueryClient();

function App() {
  
  return (
     <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
