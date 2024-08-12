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
import {hp} from '../../helper/Metric';
import Icon from 'react-native-vector-icons/Entypo';
import AntIcon from 'react-native-vector-icons/AntDesign';
import {OtpScreenProp} from '../../type';

export default function OtpScreen({navigation}: OtpScreenProp) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState(false);
  const [secureText, setSecureText] = useState(true);

  const handleSubmit = () => {
    if (otp.length < 4) {
      setError(true);
      return;
    }
    navigation.navigate('NewPasswordScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={{marginHorizontal: 16, marginTop: 6}}
        onPress={() => {
          navigation.goBack();
        }}>
        <AntIcon name="arrowleft" size={35} color="white" />
      </TouchableOpacity>

      <View style={styles.innerContainer}>
        <Icon
          name="mail"
          size={105}
          color={PRIMARY_COLOR}
          style={styles.logo}
        />
        <Text style={styles.title}>
          We have sent you OTP to your email address for verification
        </Text>
        <View style={styles.otpContainer}>
          {error && <Text style={styles.error}>Invalid OTP</Text>}

          <View style={[styles.inPutContainer, error && styles.inputError]}>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              maxLength={10}
              keyboardType="numeric"
              secureTextEntry={secureText}
              placeholder={secureText ? '***********' : 'Enter OTP here'}
              onChangeText={text => {
                setError(false);
                setOtp(text);
              }}
              value={otp}
            />

            <TouchableOpacity
              style={{alignSelf: 'center', marginHorizontal: 7}}
              onPress={() => {
                setSecureText(!secureText);
              }}>
              {secureText ? (
                <AntIcon name="eye" size={22} color={PRIMARY_COLOR} />
              ) : (
                <AntIcon name="eyeo" size={22} color={PRIMARY_COLOR} />
              )}
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={styles.resendContainer}>
          <Text style={styles.resendText}>Resend OTP?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
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
    borderColor: 'white',
    paddingTop: hp(4),
    marginTop: hp(10),
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    //borderRadius: 30,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 20,
    height: '100%',
    width: '100%',
  },
  logo: {
    height: 105,
    width: 152,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  error: {
    color: 'red',
    marginBottom: 10,
    fontWeight: 'bold',
    marginHorizontal: 20,
    fontSize: 18,
    width: '80%',
  },
  otpContainer: {
    width: '100%',
    marginBottom: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    color: PRIMARY_COLOR,
    width: '90%',
  },

  inPutContainer: {
    flex: 0,
    height: 50,
    width: '85%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderColor: PRIMARY_COLOR,
    borderWidth: 1,
    alignSelf: 'center',
    borderRadius: 8,
    marginTop: 20,
    marginHorizontal: 7,
  },

  input: {
    height: 50,

    width: '80%',
    fontSize: 18,
    borderRadius: 7,
    borderColor: 'white',
    marginBottom: 6,
    paddingHorizontal: 4,
    textAlign: 'left',
    fontWeight: '500',
  },
  inputError: {
    borderColor: 'red',
  },
  resendContainer: {
    marginBottom: 20,
    marginLeft: 'auto',
    marginRight: '7%',
  },
  resendText: {
    color: PRIMARY_COLOR,
    fontWeight: '500',
    fontSize: 14,
  },
  button: {
    backgroundColor: PRIMARY_COLOR,
    padding: 14,
    marginVertical: 10,
    borderRadius: 18,
    alignItems: 'center',
    width: '70%',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
