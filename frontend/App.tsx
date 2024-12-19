/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {createContext, useEffect, useState} from 'react';
import {Platform, StatusBar, useColorScheme, View} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {PRIMARY_COLOR} from './src/helper/Theme';
import {NavigationContainer} from '@react-navigation/native';
import StackNavigation from './src/navigations/StackNavigation';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

const queryClient = new QueryClient();
function App(): React.JSX.Element {
  //const navigation = useNavigation();
  const isDarkMode = useColorScheme() === 'dark';

  /*
  const [socket, setSocket] = useState<Socket | null>(null);

  const handleSocket = () => {
    const newSocket = io('http://localhost:8080'); // HTTP didn't work either
    // newSocket.connect(); //? manual connection didn't work
    console.log(newSocket.connected); // false
    setSocket(newSocket);
  };
  useEffect(() => {
    handleSocket();
  }, [setSocket]);
*/
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const BarStyle = Platform.OS === 'ios' ? 'dark-content' : 'light-content';
  return (
    <QueryClientProvider client={queryClient}>
      {/* Wrap your app with SocketProvider */}
      <SafeAreaProvider>
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
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

export default App;
