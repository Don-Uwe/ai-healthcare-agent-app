import React, {useEffect} from 'react';
import {View, Text, StyleSheet, Image, Alert, BackHandler} from 'react-native';
import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../helper/Theme';
import {SplashScreenProp, User} from '../type';
import {clearStorage, KEYS, retrieveItem} from '../helper/Utils';
import {useDispatch} from 'react-redux';
import {setUserHandle, setUserId, setUserToken} from '../store/UserSlice';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import axios, {AxiosError} from 'axios';
import {GET_PROFILE_API} from '../helper/APIUtils';

const SplashScreen = ({navigation}: SplashScreenProp) => {
  const dispatch = useDispatch();

  function isDateMoreThanSevenDaysOld(dateString: string) {
    const inputDate = new Date(dateString).getTime();
    const currentDate = new Date().getTime();
    const timeDifference = currentDate - inputDate;
    const daysDifference = timeDifference / (1000 * 3600 * 24);
    return daysDifference >= 6;
  }

  const getUserData = async (user_token: string) => {
    try {
      const response = await axios.get(`${GET_PROFILE_API}`, {
        headers: {
          Authorization: `Bearer ${user_token}`,
        },
      });

      return response.data.profile as User;
    } catch (err) {
      // Token is blacklisted
      const status = err.response.status;
      //console.log('lOGIN STATUS', status);

      if (status === 403) {
        Alert.alert(
          'Session Expired',
          'You have logged in from a different device. Please create a new login session. Your previous session has been terminated.',
          [
            {
              text: 'continue',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{name: 'LoginScreen'}],
                });
              },
            },
            {
              text: 'exit',
              onPress: () => {
                BackHandler.exitApp(); // This works on Android, for iOS it is not possible
              },
            },
          ],
          {cancelable: false},
        );
      }
    }
  };

  const checkLoginStatus = async () => {
    try {
      const userId = await retrieveItem(KEYS.USER_ID);
      //console.log('User Id', userId);
      const user = await retrieveItem(KEYS.USER_TOKEN);
      const user_handle = await retrieveItem(KEYS.USER_HANDLE);
      const expiryDate = await retrieveItem(KEYS.USER_TOKEN_EXPIRY_DATE);
      if (
        user_handle &&
        user &&
        expiryDate &&
        !isDateMoreThanSevenDaysOld(expiryDate)
      ) {
        // check if token blacklisted or not, later more than 7 days check will remove no need

        await getUserData(user);

        dispatch(setUserId(userId));
        dispatch(setUserToken(user));
        dispatch(setUserHandle(user_handle));

        navigation.reset({
          index: 0,
          routes: [{name: 'TabNavigation'}], // Send user to LoginScreen after logout
        });
      } else {
        await clearStorage();
        navigation.reset({
          index: 0,
          routes: [{name: 'LoginScreen'}], // Send user to LoginScreen after logout
        });
      }
    } catch (error) {
      console.error('Error retrieving user data from storage', error);
      await clearStorage();
      // navigation.navigate('LoginScreen'); // Navigate to LoginPage if there's an error
      navigation.reset({
        index: 0,
        routes: [{name: 'LoginScreen'}], // Send user to LoginScreen after logout
      });
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
      
      <Image source={require('../../assets/images/icon.png')} style={styles.icon} />
         
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
