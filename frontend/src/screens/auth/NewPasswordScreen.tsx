import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import {BUTTON_COLOR, PRIMARY_COLOR} from '../../helper/Theme';
import feather from '@expo/vector-icons/Feather';
import {hp} from '../../helper/Metric';
import AntIcon from '@expo/vector-icons/AntDesign';
import {NewPasswordScreenProp} from '../../type';
import {useMutation} from '@tanstack/react-query';
import axios, {AxiosError} from 'axios';
import {CHANGE_PASSWORD_API} from '../../helper/APIUtils';
import Loader from '../../components/Loader';

export default function NewPasswordScreen({
  navigation,
  route,
}: NewPasswordScreenProp) {
  const {email} = route.params;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVerify, setPasswordVerify] = useState(false);
  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false,
  });
  const [error, setError] = useState({
    new: false,
    confirm: false,
  });
  const [errorText, setErrorText] = useState({
    new: '',
    confirm: '',
  });

  const handlePasswordSubmit = () => {
    if (!password || password.length === 0) {
      setError({...error, new: true});
      setErrorText({...errorText, new: 'Please give a password'});
      return;
    } else if (!passwordVerify) {
      setError({...error, new: true});
      setErrorText({
        ...errorText,
        new: 'Please enter a valid password',
      });
      return;
    } else if (!confirmPassword || confirmPassword.length === 0) {
      setError({...error, confirm: true});
      setErrorText({...errorText, confirm: 'Please confirm your password'});
      return;
    } else if (password !== confirmPassword) {
      setError({...error, confirm: true});
      setErrorText({
        ...errorText,
        confirm: 'confirmation password does not match the new password',
      });
      return;
    } else {
      //navigation.navigate('LoginScreen');
      changePasswordMutation.mutate();
    }
  };

  const handlePassword = e => {
    let pass = e;
    setPassword(pass);
    setPasswordVerify(false);

    if (/(?=.*[a-z]).{6,}/.test(pass)) {
      setPassword(pass);
      setPasswordVerify(true);
    }
  };

  const changePasswordMutation = useMutation({
    mutationKey: ['generate-new-password'],
    mutationFn: async () => {
      const res = await axios.post(CHANGE_PASSWORD_API, {
        email: email,
        newPassword: password,
      });
      return res.data as any;
    },
    onSuccess: () => {
      Alert.alert('Password reset successfully');
      navigation.navigate('LoginScreen');
    },

    onError: (error: AxiosError) => {
      if (error.response) {
        const statusCode = error.response.status;
        switch (statusCode) {
          case 400:
            Alert.alert('Error', 'User not found');
            break;
          case 402:
            Alert.alert(
              'Error',
              'New password should not be same as old password',
            );
            break;
          default:
            Alert.alert('Error', 'Something went wrong. Please try again.');
        }
      } else {
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
    },
  });

  if (changePasswordMutation.isPending) {
    return <Loader />;
  }
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={{marginHorizontal: 16, marginTop: 6}}
        onPress={() => {
          navigation.navigate('LoginScreen');
        }}>
        <AntIcon name="arrowleft" size={35} color="white" />
      </TouchableOpacity>

      <View style={styles.innerContainer}>
        {/* <Text style={styles.title}>New Password</Text> */}

        <View style={styles.inputContainer}>
          <Text style={styles.text}>Enter new password</Text>
          {error.new && <Text style={styles.error}>{errorText.new}</Text>}
          <View
            style={[styles.passwordContainer, error.new && styles.inputError]}>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={!showPassword.new}
              placeholder="at least 6 length"
              value={password}
              onChangeText={e => {
                handlePassword(e);
                setError({...error, new: false});
              }}
              style={styles.input}
            />
            <feather.Button
              name={showPassword.new ? 'eye' : 'eye-off'}
              size={16}
              color="black"
              backgroundColor="white"
              onPress={() =>
                setShowPassword({...showPassword, new: !showPassword.new})
              }
            />
          </View>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.text}>Confirm password</Text>
          {error.confirm && (
            <Text style={styles.error}>{errorText.confirm}</Text>
          )}
          <View
            style={[
              styles.passwordContainer,
              error.confirm && styles.inputError,
            ]}>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={!showPassword.confirm}
              placeholder="at least 6 length"
              value={confirmPassword}
              onChangeText={text => {
                setConfirmPassword(text);
                setError({...error, confirm: false});
              }}
              style={styles.input}
            />
            <feather.Button
              name={showPassword.confirm ? 'eye' : 'eye-off'}
              size={16}
              color="black"
              backgroundColor="white"
              onPress={() =>
                setShowPassword({
                  ...showPassword,
                  confirm: !showPassword.confirm,
                })
              }
            />
          </View>
        </View>
        <TouchableOpacity style={styles.button} onPress={handlePasswordSubmit}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRIMARY_COLOR,
  },
  innerContainer: {
    alignItems: 'center',
    padding: 20,
    borderColor: 'white',
    marginTop: 80,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 20,
    paddingTop: hp(10),
    width: '100%',
    height: '100%',
  },
  // title: {
  //   fontSize: 24,
  //   fontWeight: 'bold',
  //   color: 'black',
  //   marginBottom: 20,
  // },
  inputContainer: {
    width: '90%',
    marginVertical: 20,
  },
  error: {
    color: 'red',
    marginBottom: 10,
    fontWeight: '400',
    fontSize: 16,
    //marginHorizontal: 5,
    width: '80%',
  },
  inputError: {
    borderColor: 'red',
  },
  text: {
    fontSize: 16,
    color: BUTTON_COLOR,
    marginBottom: 8,
    fontWeight: '500',

  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PRIMARY_COLOR,
    backgroundColor: 'white',
    borderRadius: 6,
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    width: '100%',
    borderRadius: 15,
  },
  button: {
    backgroundColor: PRIMARY_COLOR,
    padding: 10,
    borderRadius: 3,
    marginTop: 20,
    alignItems: 'center',
    width: '92%',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
