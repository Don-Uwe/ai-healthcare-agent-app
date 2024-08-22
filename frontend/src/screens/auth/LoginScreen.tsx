import {
  Image,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StatusBar,
  BackHandler,
  Alert,
  useColorScheme,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {PRIMARY_COLOR} from '../../helper/Theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {fp, hp, wp} from '../../helper/Metric';
import {Colors} from 'react-native/Libraries/NewAppScreen';
// import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {retrieveItem} from '../../helper/Utils';
import EmailInputModal from '../../components/EmailInputModal';
import {UserModel, LoginUser} from '../../models/User';
import {AuthApiService} from '../../services/AuthApiService';
import Icon from 'react-native-vector-icons/Ionicons';
import {LoginScreenProp} from '../../type';
import {useMutation} from '@tanstack/react-query';
import axios from 'axios';
import {RESEND_VERIFICATION} from '../../helper/APIUtils';

const LoginScreen = ({navigation}: LoginScreenProp) => {
  const inset = useSafeAreaInsets();
  const isDarkMode = useColorScheme() === 'dark';
  const [emailInputVisible, setEmailInputVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordVerify, setPasswordVerify] = useState(false);
  const [email, setEmail] = useState('');
  const [emailVerify, setEmailVerify] = useState(false);
  const [output, setOutput] = useState(true);
  const [passwordMessage, setPasswordMessage] = useState(false);
  const [emailMessage, setEmailMessage] = useState(false);

  const routes = navigation.getState().routeNames;

  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const handleSecureEntryClickEvent = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  useEffect(
    () =>
      navigation.addListener('beforeRemove', e => {
        e.preventDefault();
        Alert.alert(
          'Warning',
          'Do you want to exit',
          [
            {text: 'No', onPress: () => null},
            {text: 'Yes', onPress: () => BackHandler.exitApp()},
          ],
          {cancelable: true},
        );
      }),
    [],
  );

  const storeItem = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value);
      navigation.navigate('TabNavigation');
    } catch (error) {
      console.error('Error storing item:', error);
    }
  };

  /** ISSUE 85 : Complete the function */
  const validateAndSubmit = async () => {
    let userData;

    /** Complete the function */
    if (validate()) {
      setPasswordMessage(false);
      setEmailMessage(false);
      let params = new LoginUser();
      params.email = email;
      params.password = password;
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

  async function storeDataAndNavigateHome(userData: any) {
    await AsyncStorage.setItem('User', userData);
    navigation.navigate('TabNavigation');
  }

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
    let email = e.nativeEvent.text;
    setEmail(email);
    setEmailVerify(false);
    if (/^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      setEmail(email);
      setEmailVerify(true);
    }
  };

  const handleForgotPassword = () => {
    setEmailInputVisible(true);
  };

  const handleEmailInputBack = () => {
    setEmailInputVisible(false);
  };

  const navigateToOtpScreen = () => {
    setEmailInputVisible(false);
    navigation.navigate('OtpScreen');
  };

  const requestVerification = useMutation({
    mutationKey: ['resend-verification-mail'],
    mutationFn: async () => {
      const res = await axios.post(RESEND_VERIFICATION, {
        email: email,
      });

      return res.data.message as string;
    },

    onSuccess: () => {
      /** Check Status */
      Alert.alert('Verification Email Sent');
    },
    onError: error => {
      console.log('Email Verification error', error);

      if (axios.isAxiosError(error)) {
        const statusCode = error.status;
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

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDarkMode ? 'dark-content' : 'light-content'}
        backgroundColor={PRIMARY_COLOR}
      />
      <View style={[styles.innercontainer, {paddingTop: inset.top}]}>
        {/* logo image and brand container */}
        <View style={styles.logoContainer}>
          {/* image */}
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logo}
          />
          {/* brand text container */}
          <View style={{marginTop: wp(2)}}>
            <Text style={styles.brandText}>Ultimate Health</Text>
          </View>
        </View>
        {/* login form */}
        <View
          style={[
            styles.formContainer,
            {backgroundColor: isDarkMode ? Colors.darker : 'white'},
          ]}>
          {/* email input */}
          <View style={styles.input}>
            {/** ISSUE : 85, STEP:3, set email ref here for TextInput
               <TextInput ref={emailRef} style={styles.inputLabel}></TextInput>
              */}

            <TextInput
              onChange={e => handleEmail(e)}
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
              keyboardType="email-address"
              placeholder="Enter your mail id"
              placeholderTextColor="#948585"
              style={[
                styles.inputControl,
                {
                  borderColor: isDarkMode ? 'white' : 'black',
                  color: isDarkMode ? 'white' : 'black',
                },
              ]}
            />
            {emailMessage ? (
              <Text style={{color: 'red'}}>Please Enter a Valid Email</Text>
            ) : (
              <Text style={{color: 'red'}} />
            )}
          </View>
          {/* password input */}

          <View style={styles.input}>
            <View style={styles.passwordContainer}>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                clearButtonMode="while-editing"
                keyboardType="ascii-capable"
                placeholder="Password"
                placeholderTextColor="#948585"
                secureTextEntry={secureTextEntry}
                style={[
                  styles.inputControl,
                  {
                    borderColor: isDarkMode ? 'white' : 'black',
                    color: isDarkMode ? 'white' : 'black',
                  },
                ]}
                onChange={e => handlePassword(e)}
                value={password}
                underlineColorAndroid="transparent"
              />

              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={handleSecureEntryClickEvent}>
                {secureTextEntry ? (
                  <Icon
                    name="eye-off"
                    size={20}
                    color={isDarkMode ? 'white' : 'black'}
                  />
                ) : (
                  <Icon
                    name="eye"
                    size={20}
                    color={isDarkMode ? 'white' : 'black'}
                  />
                )}
              </TouchableOpacity>
            </View>
            {passwordMessage ? (
              <Text style={{color: 'red'}}>
                Password must be 6 Characters Longs
              </Text>
            ) : (
              <Text style={{color: 'red'}} />
            )}
          </View>
          {/* forgot password */}
          <TouchableOpacity
            style={styles.forgotPasswordContainer}
            onPress={() => {
              console.log('Forgot Password Click');
              setEmailInputVisible(!emailInputVisible);
            }}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* login  button */}
          <View style={styles.loginButtonContainer}>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => {
                validateAndSubmit();
              }}>
              <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>
          </View>

          <EmailInputModal
            callback={navigateToOtpScreen}
            visible={emailInputVisible}
            backButtonClick={handleEmailInputBack}
            onDismiss={() => setEmailInputVisible(false)}
          />

          <View style={styles.createAccountContainer}>
            <TouchableOpacity>
              <Text
                style={[
                  styles.createAccountText,
                  {
                    color: isDarkMode ? 'white' : 'black',
                  },
                ]}
                onPress={() => {
                  navigation.navigate('SignUpScreenFirst');
                }}>
                Create new account
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.loginButtonContainer}>
            <TouchableOpacity
              style={{...styles.loginButton, backgroundColor: '#DE3163'}}
              onPress={() => {
                //validateAndSubmit();
                if (email === '') {
                  Alert.alert('Please enter your mail id');
                  return;
                }
                requestVerification.mutate();
              }}>
              <Text style={styles.loginText}>Request Verification</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innercontainer: {
    flex: 1,
    backgroundColor: PRIMARY_COLOR,
  },
  logoContainer: {
    flex: 0,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(3),
    marginTop: hp(2),
    flexDirection: 'column',
    marginHorizontal: 18,
    marginLeft: wp(2),
  },
  logo: {
    height: hp(10),
    width: wp(20),
    borderRadius: 100,
    resizeMode: 'cover',
  },
  brandText: {
    color: 'white',
    fontSize: fp(6),
    fontFamily: 'Lobster-Regular',
  },
  formContainer: {
    flex: 1,
    marginTop: 14,
    borderTopRightRadius: wp(26),
    paddingHorizontal: wp(7),
    paddingTop: hp(10),
    flexDirection: 'column',
  },
  input: {
    marginBottom: hp(2),
  },
  inputLabel: {
    fontSize: fp(4),
    fontWeight: '600',
    color: '#948585',
    marginBottom: hp(1),
  },

  inputControl: {
    borderBottomWidth: 1,
    width: '100%',
    paddingRight: 40,
    fontSize: fp(4),
    fontWeight: '500',
    height: hp(5),
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginVertical: 2,
  },
  forgotPasswordText: {color: 'black', fontWeight: '600'},
  loginButtonContainer: {marginVertical: hp(2), alignItems: 'center'},
  loginButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: hp(1),
    paddingHorizontal: wp(10),
    borderRadius: 50,
  },
  loginText: {
    fontSize: fp(5),
    fontWeight: '700',
    color: '#fff',
  },
  createAccountContainer: {marginVertical: hp(1), alignItems: 'center'},
  createAccountText: {
    fontSize: 16,
    fontWeight: '500',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeIcon: {
    position: 'absolute',
    right: 0,
    padding: 10,
  },
});
