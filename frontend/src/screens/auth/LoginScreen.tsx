import React, {useEffect, useState} from 'react';
//import React from 'react';
import {Alert, Image, useColorScheme} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {StatusBar} from 'expo-status-bar';
import {
  YStack,
  XStack,
  Input,
  Button,
  Text,
  Separator,
} from 'tamagui';
import {KEYS, storeItem} from '../../helper/Utils';
import {SECURE_KEYS, secureStoreItem} from '../../helper/SecureStorageUtils';

import Icon from '@expo/vector-icons/Ionicons';
import {AuthData, LoginScreenProp} from '../../type';
import axios, {AxiosError} from 'axios';
import {useDispatch} from 'react-redux';
import Loader from '../../components/Loader';
import {setUserHandle, setUserId, setUserToken, setGuestMode} from '../../store/UserSlice';
import messaging from '@react-native-firebase/messaging';
import Entypo from '@expo/vector-icons/Entypo';
import EmailInputBottomSheet from '../../components/EmailInputModal';
import {useRequestVerification} from '@/src/hooks/useResendVerification';
import Snackbar from 'react-native-snackbar';
import {useSendOtpMutation} from '@/src/hooks/useSendOtp';
import {useLoginMutation} from '@/src/hooks/useUserLogin';

const LoginScreen = ({navigation, route}: LoginScreenProp) => {
  const inset = useSafeAreaInsets();
  const {redirectTo} = route.params || {};
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
  const {mutate: resendVerification, isPending: resendVerificationPending} =
    useRequestVerification();

  const {mutate: sendOtp, isPending: sendOtpPending} = useSendOtpMutation();

  const {mutate: login, isPending: loginPending} = useLoginMutation();

  const handleSecureEntryClickEvent = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  console.log("Is dark mode", isDarkMode);

  async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  }

  useEffect(() => {
    console.log('Email modal visibility state', emailInputVisible);
  }, [emailInputVisible]);

  async function getFCMToken() {
    try {
      await requestUserPermission();
      const fcmToken = await messaging().getToken();
      if (fcmToken) {
        console.log('FCM Token:', fcmToken);
        setFcmToken(fcmToken);
        return fcmToken;
      } else {
        console.log('Failed to get FCM Token');
        return null;
      }
    } catch (error) {
      console.log('Error getting FCM Token:', error);
      // Return a placeholder token in debug mode to allow login to proceed
      return __DEV__ ? 'debug-mode-token' : null;
    }
  }

  const validateAndSubmit = async () => {
    if (validate()) {
      setPasswordMessage(false);
      setEmailMessage(false);
      console.log("email, password", email, password);
      console.log("Attempting login in debug mode:", __DEV__);

      const fcmToken = await getFCMToken();
      console.log("FCM Token retrieved:", fcmToken);

      login(
        {
          email: email,
          password: password,
          fcmToken: fcmToken ?? 'not found',
        },
        {
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
                console.log('Storing token:', auth.token);
                  await secureStoreItem(SECURE_KEYS.USER_TOKEN, auth.token.toString());
                  await storeItem(
                    KEYS.USER_TOKEN_EXPIRY_DATE,
                    new Date().toISOString(),
                  );
                dispatch(setUserId(auth.userId));
                dispatch(setUserToken(auth.token));
                dispatch(setUserHandle(auth.user_handle));
                dispatch(setGuestMode(false));
                setTimeout(() => {
                  if (redirectTo) {
                    (navigation as any).navigate(redirectTo.name, redirectTo.params);

                    return;
                  }
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
        },
      );
   
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
  const handlePassword = (e: any) => {
    //let pass = e.nativeEvent.text;
    setPassword(e);
    setPasswordVerify(false);

    if (/(?=.*[a-z]).{6,}/.test(e)) {
      setPassword(e);
      setPasswordVerify(true);
    }
  };

  const handleEmail = (e: any) => {
    //console.log("Event",e );
    //let email = e.nativeEvent.text;
    setEmail(e);
    setEmailVerify(false);
    if (/^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(e)) {
      setEmail(e);
      setEmailVerify(true);
    }
  };


  const handleEmailInputBack = () => {
    setEmailInputVisible(false);
  };

  const navigateToOtpScreen = () => {
    setEmailInputVisible(false);
    navigation.navigate('OtpScreen', {
      email: otpMail,
    });
  };

  if (loginPending || sendOtpPending || resendVerificationPending) {
    return <Loader />;
  }
  return (
    <YStack
      flex={1}
      backgroundColor="$background">
      <StatusBar
        style={isDarkMode ? 'light' : 'dark'}
        backgroundColor="#007AFF"
      />

      <YStack
        flex={1}
        justifyContent="center"
        paddingTop={inset.top}
        paddingHorizontal="$3"
        paddingBottom="$4"
        gap="$3">
        {/* Logo Section */}

        {/* Form Section */}
        <YStack
          marginTop="$2"
          backgroundColor="$backgroundLight"
          paddingVertical="$4"
          paddingHorizontal="$2"
          borderRadius="$5"
          gap="$2"
          elevation={1}>
          <YStack alignItems="center" marginBottom="$4" gap="$2">
            <Image
              source={require('../../../assets/images/icon.png')}
              style={{
                height: 90,
                width: 90,
                alignSelf: 'center',
                resizeMode: 'contain',
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
          </YStack>

          <YStack gap="$3">
            {emailMessage && (
              <Text color="$red10" fontSize={14} marginBottom="$-2">
                Please Enter a Valid Email
              </Text>
            )}

            <XStack alignItems="center" position="relative">
              <Icon
                name="mail"
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
                borderRadius="$4"
                placeholder="Enter your email"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                onChangeText={handleEmail}
                color={isDarkMode ? '$color' : '$color10'}
                paddingStart="$10"
              />
            </XStack>

            {passwordMessage && (
              <Text color="$red10" fontSize={14} marginBottom="$-2">
                Password must be 6 Characters Long
              </Text>
            )}

            <XStack alignItems="center" position="relative">
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
                borderRadius="$4"
                placeholder="Password"
                secureTextEntry={secureTextEntry}
                autoCapitalize="none"
                onChangeText={handlePassword}
                value={password}
                color={isDarkMode ? '$color' : '$color10'}
                paddingLeft="$10"
                paddingRight="$10"
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

           <XStack
  justifyContent="space-between"
  alignItems="center"
  marginTop="$2"
  paddingHorizontal="$2"
>
  <Text
    color={isDarkMode ? '$gray10' : '$gray11'}
    fontWeight="500"
    fontSize={13}
    pressStyle={{ opacity: 0.7 }}
    cursor="pointer"
    onPress={() => {
      setRequestVerification(true);
      setEmailInputVisible(true);
    }}
  >
    Request Verification
  </Text>

  <Text
    color="$blue10"
    fontWeight="600"
    fontSize={13}
    pressStyle={{ opacity: 0.7 }}
    cursor="pointer"
    onPress={() => {
      setEmailInputVisible(true);
      setRequestVerification(false);
    }}
  >
    Forgot Password?
  </Text>
</XStack>

            <Button
              backgroundColor="$blue10"
              theme="blue"
              marginTop="$5"
              size="$5"
              borderRadius="$4"
              fontWeight="700"
              alignSelf="center"
              onPress={() => {
                console.log('Login button pressed!');
                validateAndSubmit();
              }}
              disabled={loginPending}
              opacity={loginPending ? 0.5 : 1}
              width="100%">
              <Text fontSize={18} color="$white" fontWeight="600">
                Login
              </Text>
            </Button>
          </YStack>

          <Separator marginVertical="$5" borderColor={isDarkMode ? '$gray6' : '$gray5'} />

          <YStack gap="$3">
            <Button
  size="$4"
  backgroundColor="transparent"
  borderWidth={1}
  borderRadius="$4"
  borderColor={isDarkMode ? '$gray8' : '$blue5'}
  alignSelf="center"
  width="100%"
  marginTop="$3"
  pressStyle={{ opacity: 0.85 }}
  onPress={() => navigation.navigate('SignUpScreenFirst')}
>
  <Text
    fontWeight="600"
    fontSize={16}
    color={isDarkMode ? '$color' : '$blue10'}
  >
    Sign Up
  </Text>
</Button>

            <Button
  size="$4"
  chromeless
  alignSelf="center"
  width="100%"
  marginTop="$2"
  pressStyle={{ opacity: 0.7 }}
  icon={
    <Icon
      name="compass-outline"
      size={20}
      color={isDarkMode ? '$gray11' : '$gray11'}
    />
  }
  onPress={() => {
    dispatch(setGuestMode(true));
    navigation.reset({
      index: 0,
      routes: [{ name: 'TabNavigation' }],
    });
  }}
>
  <Text
    fontWeight="500"
    fontSize={15}
    color={isDarkMode ? '$gray11' : '$gray11'}
  >
    Continue as Guest
  </Text>
</Button>
          </YStack>
        </YStack>

        <EmailInputBottomSheet
          visible={emailInputVisible}
          callback={(email: string) => {
            setOtpMail(email);
            if (requestVerificationMode) {
              resendVerification(
                {
                  email,
                },
                {
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
                          Snackbar.show({
                            text: 'User not found or already verified',
                            duration: Snackbar.LENGTH_SHORT,
                          });
                          break;
                        case 429:
                          Snackbar.show({
                            text: 'Verification email already sent, please try again after 1 hour',
                            duration: Snackbar.LENGTH_SHORT,
                          });
                          break;
                        case 500:
                          Snackbar.show({
                            text: 'Internal server error, try again',
                            duration: Snackbar.LENGTH_SHORT,
                          });

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
                },
              );
            } else {
              sendOtp(
                {
                  email,
                },
                {
                  onSuccess: () => {
                    Alert.alert('OTP has sent to your mail');
                    navigateToOtpScreen();
                  },
                  onError: error => {
                    // eslint-disable-next-line import/no-named-as-default-member
                    if (axios.isAxiosError(error)) {
                      if (error.response) {
                        if (error.response.status === 400) {
                          Alert.alert(
                            'Error',
                            'User with this email does not exist.',
                          );
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
                },
              );
            }
          }}
          backButtonClick={handleEmailInputBack}
          onDismiss={() => setEmailInputVisible(false)}
          isRequestVerification={requestVerificationMode}
        />
      </YStack>
    </YStack>
  );
};

export default LoginScreen;
