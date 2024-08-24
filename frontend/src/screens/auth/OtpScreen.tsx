import React, {RefObject, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
} from 'react-native';
import {PRIMARY_COLOR} from '../../helper/Theme';
import {hp} from '../../helper/Metric';
import Icon from 'react-native-vector-icons/Entypo';
import AntIcon from 'react-native-vector-icons/AntDesign';
import {OtpScreenProp} from '../../type';
import {OTPInput, OTPInputConfig} from '../../components/OTPInput';

export default function OtpScreen({navigation}: OtpScreenProp) {
  const [codes, setCodes] = useState<string[] | undefined>(Array(4).fill(''));
  const refs: RefObject<TextInput>[] = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  const config: OTPInputConfig = {
    backgroundColor: '#ffffff',
    textColor: '#000000',
    borderColor: '#36454f',
    errorColor: 'red',
    focusColor: PRIMARY_COLOR,
  };
  const [errorMessages, setErrorMessages] = useState<string[]>();

  const handleSubmit = () => {
    //navigation.navigate('NewPasswordScreen');
  };

  const onChangeCode = (text: string, index: number) => {
    if (text.length > 1) {
      setErrorMessages(undefined);
      const newCodes = text.split('');
      setCodes(newCodes);
      refs[3]!.current?.focus();
      return;
    }
    setErrorMessages(undefined);
    const newCodes = [...codes!];
    newCodes[index] = text;
    setCodes(newCodes);
    if (text !== '' && index < 3) {
      refs[index + 1]!.current?.focus();
    }
  };

  async function verifyPhoneNumberAndProgress() {
    const fullCode = codes!.join('');
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView>
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
            size={75}
            color={PRIMARY_COLOR}
            style={styles.logo}
          />
          <Text style={styles.title}>
            We have sent you OTP to your email address for verification
          </Text>

          <OTPInput
            codes={codes!}
            errorMessages={errorMessages}
            onChangeCode={onChangeCode}
            refs={refs}
            config={config}
          />
          <TouchableOpacity style={styles.resendContainer}>
            <Text style={styles.resendText}>Resend OTP?</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingTop: hp(14),
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
    marginBottom: 10,
    backgroundColor: 'white',
    alignSelf: 'center',
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
    fontWeight: '400',
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
    fontWeight: '400',
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
