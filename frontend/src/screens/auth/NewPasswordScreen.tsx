import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {PRIMARY_COLOR} from '../../helper/Theme';
import feather from 'react-native-vector-icons/Feather';
import {hp} from '../../helper/Metric';
import AntIcon from 'react-native-vector-icons/AntDesign';
import {NewPasswordScreenProp} from '../../type';

export default function NewPasswordScreen({navigation}: NewPasswordScreenProp) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState({
    new: true,
    confirm: false,
  });
  const [error, setError] = useState(false);
  const [errorText, setErrorText] = useState('');

  const handlePasswordSubmit = () => {
    if (!password || !confirmPassword) {
      setError(true);
      setErrorText('Please fill all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError(true);
      setErrorText('Password does not match');
      return;
    }
    navigation.navigate('LoginScreen');
  };

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
          {error && <Text style={styles.error}>{errorText}</Text>}
          <View style={[styles.passwordContainer, error && styles.inputError]}>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={!showPassword.new}
              placeholder="at least 10 digits"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
            />
            <feather.Button
              name={showPassword.new ? 'eye' : 'eye-off'}
              size={24}
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
          {error && <Text style={styles.error}>{errorText}</Text>}
          <View style={[styles.passwordContainer, error && styles.inputError]}>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={!showPassword.confirm}
              placeholder="*******"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
            />
            <feather.Button
              name={showPassword.confirm ? 'eye' : 'eye-off'}
              size={24}
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
    fontWeight: 'bold',
    fontSize: 18,
    marginHorizontal: 5,
    width: '80%',
  },
  inputError: {
    borderColor: 'red',
  },
  text: {
    fontSize: 16,
    color: '#808080',
    marginBottom: 8,
    fontWeight: '500',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PRIMARY_COLOR,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    width: '100%',
    borderRadius: 15,
  },
  button: {
    backgroundColor: PRIMARY_COLOR,
    padding: 15,
    borderRadius: 30,
    marginTop: 20,
    alignItems: 'center',
    width: '40%',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
