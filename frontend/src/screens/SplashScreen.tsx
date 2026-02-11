import React, {useEffect} from 'react';
import {Image, StyleSheet} from 'react-native';
import {YStack, Text, Button} from 'tamagui';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {SplashScreenProp} from '../type';
import {useDispatch} from 'react-redux';
import {retrieveItem, KEYS, clearStorage} from '../helper/Utils';
import {setUserId, setUserToken, setUserHandle} from '../store/UserSlice';
import { useCheckTokenStatus } from '@/hooks/useGetTokenStatus';

export default function SplashScreen({navigation}: SplashScreenProp) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const translateY = useSharedValue(20);

  const dispatch = useDispatch();

  const {data: tokenRes, isLoading} = useCheckTokenStatus();


  // function isDateMoreThanSevenDaysOld(dateString: string) {
  //   const inputDate = new Date(dateString).getTime();
  //   const currentDate = new Date().getTime();
  //   const timeDifference = currentDate - inputDate;
  //   const daysDifference = timeDifference / (1000 * 3600 * 24);
  //   return daysDifference >= 6;
  // }

  const checkLoginStatus = async () => {


    try {
      const userId = await retrieveItem(KEYS.USER_ID);
      const user = await retrieveItem(KEYS.USER_TOKEN);
      const user_handle = await retrieveItem(KEYS.USER_HANDLE);
      if (
       // user_handle &&
       // user &&
       // expiryDate &&
       // !isDateMoreThanSevenDaysOld(expiryDate)
       tokenRes?.isValid
      ) {

        dispatch(setUserId(userId));
        dispatch(setUserToken(user));
        dispatch(setUserHandle(user_handle));

        navigation.reset({
          index: 0,
          routes: [{name: 'TabNavigation'}],
        });
      } else {
        await clearStorage();
        navigation.reset({
          index: 0,
          routes: [{name: 'LoginScreen'}],
        });
      }
    } catch (error) {
      console.error('Error retrieving user data from storage', error);
      await clearStorage();
      // navigation.navigate('LoginScreen');
      navigation.reset({
        index: 0,
        routes: [{name: 'LoginScreen'}],
      });
    }
  };

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: 1200,
      easing: Easing.out(Easing.exp),
    });
    scale.value = withTiming(1, {
      duration: 1000,
      easing: Easing.out(Easing.ease),
    });
    translateY.value = withTiming(0, {
      duration: 1000,
      easing: Easing.out(Easing.ease),
    });
  }, [opacity, scale, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{scale: scale.value}, {translateY: translateY.value}],
  }));

  return (
    <YStack
      flex={1}
      alignItems="center"
      justifyContent="center"
      //bg="$background"
      padding="$6"
      gap="$4">
      <Animated.View style={animatedStyle}>
        <Image
          source={require('../../assets/images/icon.png')}
          style={styles.icon}
        />
        <Text
          marginTop="$4"
          fontSize="$8"
          fontWeight="800"
          color="$color12"
          letterSpacing={1}
          textAlign="center">
          Ultimate Health
        </Text>
        <Text marginTop="$2" fontSize="$4" color="$color10" textAlign="center" paddingHorizontal="$4">
          Empowering wellness through knowledge
        </Text>
      </Animated.View>

      <Button
        marginTop="$6"
        size="$7"
        backgroundColor={isLoading ? '$color3' : '$color9'}
        color="black"
        paddingHorizontal="$9"
        paddingVertical="$2"
        borderRadius="$10"
        elevation={4}
        disabled={isLoading}

        pressStyle={{scale: 0.96, opacity: 0.9}}
        onPress={checkLoginStatus}>
        <Text fontSize={16} color="black">
          Continue
        </Text>
      </Button>
    </YStack>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignSelf: 'center',
  },
});
