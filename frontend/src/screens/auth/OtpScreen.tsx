import React, {useRef, useState} from 'react';
import {TextInput, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {OtpScreenProp} from '../../type';
import {useMutation} from '@tanstack/react-query';
import axios, {AxiosError} from 'axios';
import {CHECK_OTP, SEND_OTP} from '../../helper/APIUtils';
import Loader from '../../components/Loader';
import {
  Theme,
  YStack,
  Text,
  Button,
  XStack,
  Input,
  Paragraph,
  Card,
} from 'tamagui';

export default function OtpScreen({navigation, route}: OtpScreenProp) {
  const [otp, setOtp] = useState(['', '', '', '']);
  const inputs = useRef<(TextInput | null)[]>([]);
  const {email} = route.params;
  

  const [errorMessages, setErrorMessages] = useState<string[]>();

  const handleSubmit = () => {
    //navigation.navigate('NewPasswordScreen');
    const fullCode = otp!.join('');
    if (!fullCode || fullCode.length === 0) {
      setErrorMessages(['Please provide otp inputs']);
      return;
    } else {
      setErrorMessages(undefined);
      verifyOtpMutation.mutate({
        otp: fullCode,
      });
    }
  };

  const sendOtpMutation = useMutation({
    mutationKey: ['forgot-password-otp'],
    mutationFn: async () => {
      const res = await axios.post(SEND_OTP, {
        email: email,
      });
      return res.data.otp as string;
    },

    onSuccess: () => {
      Alert.alert('OTP has sent to your mail');
      setOtp(Array(4).fill(''));
      setErrorMessages(undefined);
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

  const verifyOtpMutation = useMutation({
    mutationKey: ['verify-otp'],
    mutationFn: async ({otp}: {otp: string}) => {
      const res = await axios.post(CHECK_OTP, {
        email: email,
        otp: otp,
      });
      return res.data.message as string;
    },

    onSuccess: () => {
      navigation.navigate('NewPasswordScreen', {
        email: email,
      });
    },
    onError: (error: AxiosError) => {
      console.log('OTP ERROR', error);
      setErrorMessages(['Invalid or expired otp']);
      Alert.alert('Invalid or expired otp');
    },
  });

  const handleChange = (text: string, index: number) => {
    setErrorMessages(undefined);

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < otp.length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  if (sendOtpMutation.isPending || verifyOtpMutation.isPending) {
    return <Loader />;
  }
  return (
    <Theme name="light">
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: 'white',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <YStack f={1} jc="center" ai="center" bg="white" p="$6" space="$5">
          <Card
            elevate
            bordered
            p="$9"
            width="90%"
            bg="white"
            br="$6"
            shadowColor="#00000020">
            <YStack ai="center" space="$3">
              <Text fontSize={29} fontWeight="700" color="$color12">
                OTP Verification
              </Text>
              <Paragraph
                textAlign="center"
                color="$gray11"
                fontSize={15}
                fontWeight={'600'}
                lineHeight={22}>
                Enter the 4-digit verification code we’ve sent to your
                registered email address.
              </Paragraph>
            </YStack>

            <XStack space="$3" jc="center" mt="$6">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={ref => (inputs.current[index] = ref)}
                  value={digit}
                  onChangeText={text => handleChange(text, index)}
                  onKeyPress={e => handleKeyPress(e, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  textAlign="center"
                  fontSize={24}
                  borderWidth={1.5}
                  borderColor={digit ? '$blue9' : '$gray5'}
                  focusStyle={{borderColor: '$blue10', shadowColor: '$blue6'}}
                  bw={1.5}
                  br="$5"
                  width={54}
                  height={54}
                  bg="$gray1"
                />
              ))}
            </XStack>

            {errorMessages && (
              <Paragraph
                mt="$3"
                mb="$1"
                color="$red10"
                fontSize={14}
                fontWeight="600"
                textAlign="center">
                {errorMessages}
              </Paragraph>
            )}

            <Button
              backgroundColor="$blue10"
              hoverStyle={{bg: '$blue9'}}
              pressStyle={{bg: '$blue8'}}
              borderRadius={12}
              //width="100%"
              paddingHorizontal={'$10'}
              alignItems="center"
              alignSelf="center"
              height={50}
              marginTop={14}
              onPress={handleSubmit}>
              <Text
                fontSize={17}
                fontWeight="600"
                color="white"
                alignSelf="center">
                Continue
              </Text>
            </Button>

            <YStack marginTop="$5" ai="center">
              <Paragraph color="$gray10" fontSize={15}>
                Didn’t receive the code?{' '}
                <Text
                onPress={()=>{
                  sendOtpMutation.mutate();
                }} 
                color="$blue10" fontWeight="600">
                  Resend
                </Text>
              </Paragraph>
            </YStack>
          </Card>
        </YStack>
      </SafeAreaView>
    </Theme>
  );
}
