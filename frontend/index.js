/**
 * @format
 */
/**
 * @format
 */
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {Provider} from 'react-redux';
import store from './src/store/ReduxStore';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

const AppWrapper = () => {
  return (
    <GestureHandlerRootView>
      <BottomSheetModalProvider>
        <Provider store={store}>
          <App />
        </Provider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
};

//AppRegistry.registerComponent(appName, () => App);
AppRegistry.registerComponent(appName, () => AppWrapper);
