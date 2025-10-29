import {useState} from 'react';
import React from 'react';
import {Alert, Image, useColorScheme} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {StatusBar} from 'expo-status-bar';
import {
  YStack,
  XStack,
  ScrollView,
  Input,
  Button,
  Text,
  Separator,
} from 'tamagui';
import {KEYS, storeItem} from '../../helper/Utils';

import Icon from '@expo/vector-icons/Ionicons';
import {AuthData, LoginScreenProp, User} from '../../type';
import {useMutation} from '@tanstack/react-query';
import axios, {AxiosError} from 'axios';
import {useDispatch} from 'react-redux';
import {LOGIN_API, RESEND_VERIFICATION, SEND_OTP} from '../../helper/APIUtils';
import Loader from '../../components/Loader';
import {setUserHandle, setUserId, setUserToken} from '../../store/UserSlice';
import messaging from '@react-native-firebase/messaging';
import Entypo from '@expo/vector-icons/Entypo';
import EmailInputBottomSheet from '../../components/EmailInputModal';

const LoginScreen = ({navigation}: LoginScreenProp) => {
  const inset = useSafeAreaInsets();
  const dispatch = useDispatch();
  const isDarkMode = useColorScheme() === 'dark';
  const [emailInputVisible, setEmailInputVisible] = useState(false);
  const [requestVerificationMode, setRequestVerification] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordVerify, setPasswordVerify] = useState(false);
  const [email, setEmail] = useState('');
  const [otpMail, setOtpMail] = useState('');
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [emailVerify, setEmailVerify] = useState(false);
  const [output, setOutput] = useState(true);
  const [passwordMessage, setPasswordMessage] = useState(false);
  const [emailMessage, setEmailMessage] = useState(false);

  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const handleSecureEntryClickEvent = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  }

  async function getFCMToken() {
    await requestUserPermission();
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      console.log('FCM Token:', fcmToken);
      setFcmToken(fcmToken);
    } else {
      console.log('Failed to get FCM Token');
      return null;
    }
  }

  const validateAndSubmit = async () => {
    if (validate()) {
      await getFCMToken();
      setPasswordMessage(false);
      setEmailMessage(false);
      loginMutation.mutate();
    } else {
      setOutput(true);
      setPasswordMessage(false);
      setEmailMessage(false);
      if (output && !passwordVerify) {
        setPasswordMessage(true);
      }
      if (output && !emailVerify) {
        setEmailMessage(true);
      }
    }
  };

  const validate = () => {
    if (emailVerify && passwordVerify) {
      return true;
    } else {
      return false;
    }
  };
  const handlePassword = e => {
    let pass = e.nativeEvent.text;
    setPassword(pass);
    setPasswordVerify(false);

    if (/(?=.*[a-z]).{6,}/.test(pass)) {
      setPassword(pass);
      setPasswordVerify(true);
    }
  };

  const handleEmail = e => {
    //console.log("Event",e );
    //let email = e.nativeEvent.text;
    setEmail(e);
    setEmailVerify(false);
    if (/^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(e)) {
      setEmail(e);
      setEmailVerify(true);
    }
  };

  const loginMutation = useMutation({
    mutationKey: ['login'],
    mutationFn: async () => {
      const res = await axios.post(LOGIN_API, {
        email: email,
        password: password,
        fcmToken: fcmToken,
      });

      return res.data.user as User;
    },

    onSuccess: async data => {
      const auth: AuthData = {
        userId: data._id,
        token: data?.refreshToken,
        user_handle: data?.user_handle,
      };
      try {
        await storeItem(KEYS.USER_ID, auth.userId.toString());
        await storeItem(KEYS.USER_HANDLE, data?.user_handle);
        if (auth.token) {
          await storeItem(KEYS.USER_TOKEN, auth.token.toString());
          await storeItem(
            KEYS.USER_TOKEN_EXPIRY_DATE,
            new Date().toISOString(),
          );
          dispatch(setUserId(auth.userId));
          dispatch(setUserToken(auth.token));
          dispatch(setUserHandle(auth.user_handle));
          setTimeout(() => {
            navigation.reset({
              index: 0,
              routes: [{name: 'TabNavigation'}],
            });
          }, 1000);
        } else {
          Alert.alert('Token not found');
        }
      } catch (e) {
        console.log('Async Storage ERROR', e);
      }
    },

    onError: (error: AxiosError) => {
      console.log('Error', error);
      setPassword('');
      setEmail('');
      if (error.response) {
        const errorCode = error.response.status;
        switch (errorCode) {
          case 400:
            Alert.alert('Error', 'Please provide email and password');
            break;
          case 401:
            Alert.alert('Error', 'Invalid password');
            break;
          case 403:
            Alert.alert(
              'Error',
              'Email not verified. Please check your email.',
            );
            break;
          case 404:
            Alert.alert('Error', 'User not found');
            break;
          default:
            Alert.alert('Error', 'Internal server error');
        }
      } else {
        Alert.alert('Error', 'User not found');
      }
    },
  });

  const handleEmailInputBack = () => {
    setEmailInputVisible(false);
  };

  const sendOtpMutation = useMutation({
    mutationKey: ['forgot-password-otp'],
    mutationFn: async ({email}: {email: string}) => {
      const res = await axios.post(SEND_OTP, {
        email: email,
      });
      return res.data.otp as string;
    },

    onSuccess: () => {
      Alert.alert('OTP has sent to your mail');
      navigateToOtpScreen();
    },
    onError: error => {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          if (error.response.status === 400) {
            Alert.alert('Error', 'User with this email does not exist.');
          } else if (error.response.status === 500) {
            Alert.alert('Error', 'Error sending email.');
          } else {
            Alert.alert('Error', 'Something went wrong.');
          }
        } else {
          Alert.alert('Error', 'Network error.');
        }
      } else {
        Alert.alert('Error', 'Network error.');
      }
    },
  });

  const navigateToOtpScreen = () => {
    setEmailInputVisible(false);
    navigation.navigate('OtpScreen', {
      email: otpMail,
    });
  };

  const requestVerification = useMutation({
    mutationKey: ['resend-verification-mail'],
    mutationFn: async ({email1}: {email1: string}) => {
      const res = await axios.post(RESEND_VERIFICATION, {
        email: email1,
      });

      return res.data.message as string;
    },

    onSuccess: () => {
      /** Check Status */
      Alert.alert('Verification Email Sent');
      setEmail('');
      setPassword('');
    },
    onError: (error: AxiosError) => {
      console.log('Email Verification error', error);

      if (error.response) {
        const statusCode = error.response.status;
        switch (statusCode) {
          case 400:
            Alert.alert('Error', 'User not found or already verified');
            break;
          case 429:
            Alert.alert(
              'Error',
              'Verification email already sent. Please try again after 1 hour.',
            );
            break;
          case 500:
            Alert.alert(
              'Error',
              'Internal server error. Please try again later.',
            );
            break;
          default:
            Alert.alert(
              'Error',
              'Something went wrong. Please try again later.',
            );
        }
      } else {
        console.log('Email Verification error', error);
      }
    },
  });

  if (
    loginMutation.isPending ||
    sendOtpMutation.isPending ||
    requestVerification.isPending
  ) {
    return <Loader />;
  }
  return (
    <ScrollView
      flex={1}
      backgroundColor={isDarkMode ? '$background' : '#fff'}
      showsVerticalScrollIndicator={false}>
      <StatusBar
        style={isDarkMode ? 'light' : 'dark'}
        backgroundColor="$blue10"
      />

      <YStack
        flex={1}
        paddingTop={inset.top + 60}
        paddingHorizontal="$4"
        paddingBottom="$6"
        space="$5">
        {/* Logo Section */}

        {/* Form Section */}
        <YStack
          marginTop="$4"
          backgroundColor={isDarkMode ? '$black' : '$background'}
          padding="$5"
          borderRadius="$5"
          space="$4"
          elevation={2}>
          <Image
            source={require('../../../assets/images/icon.png')}
            style={{
              height: 80,
              width: 80,
             // borderRadius: 60,
              alignSelf: 'center',
              resizeMode:'cover'
            }}
          />

          <Text
            alignSelf="center"
            textAlign="center"
            fontSize={16}
            fontWeight="500"
            color={isDarkMode ? '$color' : '$color10'}
            maxWidth={300}
            lineHeight={22}>
            Enter your email and password to securely access your account
          </Text>

          {emailMessage && (
            <Text color="red" fontSize={14}>
              Please Enter a Valid Email
            </Text>
          )}

          <XStack ai="center" position="relative">
            <Icon
              name="mail"
              size={22}
              color={isDarkMode ? 'white' : 'black'}
              style={{
                position: 'absolute',
                left: 6,
                zIndex: 1,
              }}
            />
            <Input
              flex={1}
              height="$6"
              borderRadius="$3"
              placeholder="Enter your email"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              onChangeText={handleEmail}
              color={isDarkMode ? '$color' : '$color10'}
              paddingStart="$8"
            />
          </XStack>

          {passwordMessage && (
            <Text color="red" fontSize={14}>
              Password must be 6 Characters Long
            </Text>
          )}

          <XStack ai="center" position="relative">
            <Entypo
              name="lock"
              size={22}
              color={isDarkMode ? 'white' : 'black'}
              style={{
                position: 'absolute',
                left: 12,
                zIndex: 1,
              }}
            />
            <Input
              flex={1}
              height="$6"
              borderRadius="$3"
              placeholder="Password"
              secureTextEntry={secureTextEntry}
              autoCapitalize="none"
              onChangeText={handlePassword}
              value={password}
              color={isDarkMode ? '$color' : '$color10'}
              paddingLeft="$8"
              paddingRight="$8"
            />
            <Button
              chromeless
              size="$4"
              circular
              position="absolute"
              right={6}
              onPress={handleSecureEntryClickEvent}>
              <Icon
                name={secureTextEntry ? 'eye-off' : 'eye'}
                size={22}
                color={isDarkMode ? 'white' : 'black'}
              />
            </Button>
          </XStack>

          <Button
             backgroundColor="$blue10"
            theme="blue"
            mt="$6"
            size="$6"
            fontWeight="700"
            alignSelf="center"
            onPress={validateAndSubmit}
            width="100%">
            <Text fontSize={18} color="$white" fontWeight="600">
              Login
            </Text>
          </Button>

          <Button
            chromeless
            size="$5"
            alignSelf="center"
            onPress={() => {
              setEmailInputVisible(true);
              setRequestVerification(false);
            }}>
            <Text color="$blue10" fontWeight="600" fontSize={16}>
              Forgot Password?
            </Text>
          </Button>

          <Button
            variant="outlined"
            marginTop="$2"
            size="$6"
            theme="dark"
            alignSelf="center"
            opacity={0.7}
            onPress={() => {
              setRequestVerification(true);
              setEmailInputVisible(true);
            }}>
            <Text color={isDarkMode ? '$color' : '$black'} fontWeight="600">
              Request Verification
            </Text>
          </Button>

          <Separator my="$3" />

          <Button
            mt="$3"
            size="$6"
            bg="$gray3"
            color="$color"
            alignSelf="center"
            width="100%"
            onPress={() => navigation.navigate('SignUpScreenFirst')}>
            <Text fontWeight="600" fontSize={16}>
              Sign Up
            </Text>
          </Button>
        </YStack>

       <EmailInputBottomSheet
        visible={emailInputVisible}
        callback={(email: string) => {
          setOtpMail(email)
          if (requestVerificationMode) {
            requestVerification.mutate({ email1: email })
          } else {
            sendOtpMutation.mutate({ email })
          }
        }}
        backButtonClick={handleEmailInputBack}
        onDismiss={() => setEmailInputVisible(false)}
        isRequestVerification={requestVerificationMode}
      />
      </YStack>
    </ScrollView>
  );
};

export default LoginScreen;
