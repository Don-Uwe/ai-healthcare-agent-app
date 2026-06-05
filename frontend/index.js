import {registerRootComponent} from 'expo';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {Provider} from 'react-redux';
import store from './src/store/ReduxStore';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import App from './App';
import messaging from '@react-native-firebase/messaging';
import {StyleSheet} from 'react-native';

// Firebase background handler must be registered at the app root (run once,
// before any component mounts). FCM requires this to be at module scope.
// NOTE: initMonitoring() is intentionally NOT called here — it has been moved
// to AppContent.tsx's first useEffect so that expo-application metadata
// (nativeApplicationVersion, nativeBuildVersion) is fully available before
// Sentry initialises.
messaging().setBackgroundMessageHandler(async remoteMessage => {
  // Only log notification payloads in development to avoid leaking user data
  // or FCM tokens in production log aggregators.
  if (__DEV__) {
    console.log('Background notification received:', remoteMessage);
  }
});

const AppWrapper = () => {
  return (
    <GestureHandlerRootView style={styles.container}>
      <BottomSheetModalProvider>
        <Provider store={store}>
          <App />
        </Provider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

registerRootComponent(AppWrapper);
