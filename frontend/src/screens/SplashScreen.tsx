import React, {useEffect} from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../helper/Theme';
// import {handleBackButton} from '../helper/Utils';
import {SplashScreenProp} from '../type';

const SplashScreen = ({navigation}: SplashScreenProp) => {
  const checkLoginStatus = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        navigation.navigate('TabNavigation'); // Navigate to HomePage if user is logged in
      } else {
        navigation.navigate('LoginScreen'); // Navigate to LoginPage if user is not logged in
      }
    } catch (error) {
      console.error('Error retrieving user data from storage', error);
      navigation.navigate('LoginScreen'); // Navigate to LoginPage if there's an error
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      checkLoginStatus();
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/icon.png')} style={styles.icon} />
      <Text style={styles.text}>Ultimate</Text>
      <Text style={styles.text}>Health</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PRIMARY_COLOR,
  },
  icon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  text: {
    fontSize: 22,
    // fontWeight: 'bold',
    color: ON_PRIMARY_COLOR,
    textAlign: 'center',
    fontFamily: 'Lobster-Regular',
  },
});

export default SplashScreen;
