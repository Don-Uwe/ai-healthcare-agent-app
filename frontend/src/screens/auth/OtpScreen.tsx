import React, {useRef, useState} from 'react';
import {TextInput, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {OtpScreenProp} from '../../type';
import axios, {AxiosError} from 'axios';
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
import {useSendOtpMutation} from '@/src/hooks/useSendOtp';
import {useVerifyOtpMutation} from '@/src/hooks/useVerifyOtp';

export default function OtpScreen({navigation, route}: OtpScreenProp) {
  const [otp, setOtp] = useState(['', '', '', '']);
  const inputs = useRef<(TextInput | null)[]>([]);
  const {email} = route.params;

  const [errorMessages, setErrorMessages] = useState<string[]>();
  const {mutate: sendOtp, isPending: sendOtpPending} = useSendOtpMutation();
  const {mutate: checkOtp, isPending: checkOtpPending} = useVerifyOtpMutation();

  const handleSubmit = () => {
    //navigation.navigate('NewPasswordScreen');
    const fullCode = otp!.join('');
    if (!fullCode || fullCode.length === 0) {
      setErrorMessages(['Please provide otp inputs']);
      return;
    } else {
      setErrorMessages(undefined);

      checkOtp(
        {
          email: email,
          otp: fullCode,
        },
        {
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
        },
      );
    }
  };


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

  if (sendOtpPending || checkOtpPending) {
    return <Loader />;
  }
  return (
    <Theme name="light">
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: '#f8f9fa',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <YStack f={1} jc="center" ai="center" bg="#f8f9fa" p="$6" space="$5">
          <Card
            elevate
            bordered
            p="$8"
            width="90%"
            maxWidth={450}
            bg="white"
            br="$8"
            shadowColor="rgba(0, 0, 0, 0.08)"
            shadowRadius={24}
            shadowOffset={{ width: 0, height: 8 }}>
            <YStack alignItems="center" gap="$4">
              {/* Icon */}
              <YStack
                width={70}
                height={70}
                borderRadius={35}
                backgroundColor="$blue2"
                justifyContent="center"
                alignItems="center"
                marginBottom="$2">
                <Text fontSize={32} color="$blue10">
                  🔐
                </Text>
              </YStack>

              <Text fontSize={28} fontWeight="700" color="$color12" textAlign="center">
                Verify Your Code
              </Text>
              <Paragraph
                textAlign="center"
                color="$gray11"
                fontSize={15}
                fontWeight="500"
                lineHeight={22}
                paddingHorizontal="$2">
                We've sent a 4-digit verification code to{'\n'}
                <Text fontWeight="600" color="$blue10">{email}</Text>
              </Paragraph>
            </YStack>

            <XStack gap="$3" justifyContent="center" marginTop="$7" marginBottom="$2">
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
                  fontSize={28}
                  fontWeight="700"
                  borderWidth={2}
                  borderColor={
                    errorMessages
                      ? '$red8'
                      : digit
                        ? '$blue9'
                        : '$gray6'
                  }
                  focusStyle={{
                    borderColor: errorMessages ? '$red9' : '$blue10',
                    borderWidth: 2.5,
                    backgroundColor: 'white',
                    shadowColor: errorMessages ? '$red8' : '$blue8',
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3
                  }}
                  br="$5"
                  width={60}
                  height={64}
                  bg={errorMessages ? '$red1' : digit ? '$blue1' : '$gray1'}
                  color="$color12"
                />
              ))}
            </XStack>

            {errorMessages && (
              <XStack
                jc="center"
                ai="center"
                gap="$2"
                mt="$4"
                mb="$2"
                paddingHorizontal="$4"
                paddingVertical="$2"
                backgroundColor="$red2"
                borderRadius="$3"
                alignSelf="center">
                <Text color="$red10" fontSize={20}>⚠️</Text>
                <Paragraph
                  color="$red10"
                  fontSize={14}
                  fontWeight="600"
                  textAlign="center">
                  {errorMessages}
                </Paragraph>
              </XStack>
            )}

            <Button
              backgroundColor={otp.every(d => d) ? '$blue10' : '$gray7'}
              hoverStyle={{ bg: '$blue9', opacity: 0.9 }}
              pressStyle={{ bg: '$blue11', scale: 0.98 }}
              borderRadius={12}
              //width="100%"
              alignItems="center"
              justifyContent='center'
              //alignSelf="center"
              height={56}
              marginTop="$5"
              disabled={!otp.every(d => d)}
              shadowColor="$blue8"
              shadowRadius={12}
              shadowOffset={{ width: 0, height: 4 }}
              shadowOpacity={0.25}
              onPress={handleSubmit}>
              <Text
                fontSize={17}
                fontWeight="600"
                color="white"
                >
                Verify & Continue
              </Text>
            </Button>

            <YStack marginTop="$6" alignItems="center" gap="$3">
              <Paragraph color="$gray10" fontSize={15} textAlign="center">
                Didn't receive the code?
              </Paragraph>
              <Button
                chromeless
                onPress={() => {
                  sendOtp(
                    {
                      email,
                    },
                    {
                      onSuccess: () => {
                        Alert.alert('Success', 'A new OTP has been sent to your email');
                        setOtp(Array(4).fill(''));
                        setErrorMessages(undefined);
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
                }}
                padding="$2"
                height="auto">
                <XStack ai="center" gap="$2">
                  <Text fontSize={18}>🔄</Text>
                  <Text color="$blue10" fontWeight="700" fontSize={15}>
                    Resend Code
                  </Text>
                </XStack>
              </Button>
            </YStack>
          </Card>
        </YStack>
      </SafeAreaView>
    </Theme>
  );
}
