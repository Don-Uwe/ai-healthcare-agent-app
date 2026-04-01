import React, {useState} from 'react';
import {Alert, useColorScheme} from 'react-native';
import {
  Theme,
  YStack,
  XStack,
  Card,
  Input,
  Button,
  Paragraph,
  Text,
  Circle,
} from 'tamagui';
import {SafeAreaView} from 'react-native-safe-area-context';

import {NewPasswordScreenProp} from '../../type';
import {AxiosError} from 'axios';
import Loader from '../../components/Loader';
import AntDesign from '@expo/vector-icons/AntDesign';
import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from '@/src/helper/Theme';
import Entypo from '@expo/vector-icons/Entypo';
import Icon from '@expo/vector-icons/Ionicons';
import {useChangePasswordMutation} from '@/src/hooks/useChangePassword';

export default function NewPasswordScreen({
  navigation,
  route,
}: NewPasswordScreenProp) {
  const {email} = route.params;
  const [password, setPassword] = useState('');
  const isDarkMode = useColorScheme() === 'dark';
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVerify, setPasswordVerify] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureNewTextEntry, setSecureNewTextEntry] = useState(true);
  const {mutate: changePassword, isPending} = useChangePasswordMutation();

  const handleSecureEntryClickEvent = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const handleSecureNewEntryClickEvent = () => {
    setSecureNewTextEntry(!secureNewTextEntry);
  };

 const handlePasswordSubmit = () => {
  const showError = (msg: string) => {
    Alert.alert(msg);
    setErrorMessage(msg);
  };

  if (!password?.trim()) {
    return showError('Please give a password');
  }

  if (!passwordVerify) {
    return showError('Please enter a valid password');
  }

  if (!confirmPassword?.trim()) {
    return showError('Please confirm your password');
  }

  if (password !== confirmPassword) {
    return showError(
      'Confirmation password does not match the new password',
    );
  }

  setErrorMessage(null);

  changePassword(
    {
      email,
      newPassword: password,
    },
    {
      onSuccess: () => {
        Alert.alert('Password reset successfully');
        navigation.navigate('LoginScreen');
      },

      onError: (error: AxiosError) => {
        if (error.response) {
          switch (error.response.status) {
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
              Alert.alert(
                'Error',
                'Something went wrong. Please try again.',
              );
          }
        } else {
          Alert.alert('Error', 'Something went wrong. Please try again.');
        }
      },
    },
  );
};

  const handlePassword = e => {
    let pass = e;
    setErrorMessage(null);
    setPassword(pass);
    setPasswordVerify(false);

    if (/(?=.*[a-z]).{6,}/.test(pass)) {
      setPassword(pass);
      setPasswordVerify(true);
    }
  };

  const handleConfirmPassword = e => {
    let pass = e;
    setErrorMessage(null);
    setConfirmPassword(pass);
    setPasswordVerify(false);

    if (/(?=.*[a-z]).{6,}/.test(pass)) {
      setConfirmPassword(pass);
      setPasswordVerify(true);
    }
  };


  if (isPending) {
    return <Loader />;
  }
  return (
    <Theme name="light">
      <SafeAreaView style={{flex: 1, backgroundColor: '#f8f9fa'}}>
        <YStack
          flex={1}
          justifyContent="center"
          alignItems="center"
          paddingHorizontal="$4"
          padding="$3">
          <Card
            elevate
            bordered
            backgroundColor="white"
            width="100%"
            maxWidth={440}
            height="auto"
            padding="$6"
            borderRadius="$8"
            shadowColor="rgba(0, 0, 0, 0.08)"
            shadowRadius={24}
            shadowOffset={{ width: 0, height: 8 }}
            alignItems="center">
            {/* Icon Circle */}
            <Circle
              size={80}
              backgroundColor={ON_PRIMARY_COLOR}
              justifyContent="center"
              alignItems="center"
              marginBottom="$4">
              <AntDesign
                size={36}
                name="key"
                color={PRIMARY_COLOR}
                strokeWidth={2.2}
              />
            </Circle>

            {/* Title & Subtitle */}
            <Text
              fontSize={26}
              fontWeight="700"
              alignSelf="center"
              marginTop="$2"
              color="$color12"
              marginBottom="$2"
              textAlign="center"
              lineHeight={32}>
              Create New Password
            </Text>

            <Paragraph
              color="$gray11"
              fontSize={15}
              fontWeight="500"
              textAlign="center"
              lineHeight={22}
              marginBottom="$4"
              paddingHorizontal="$2">
              Your new password must be different from previously used passwords.
            </Paragraph>

            {/* Inputs */}
            <YStack gap="$4" width="100%" marginTop="$2">
              <YStack gap="$2">
                <Text fontWeight="600" color="$gray11" fontSize={14}>
                  New Password
                </Text>

                <XStack alignItems="center" position="relative">
                  <Entypo
                    name="lock"
                    size={20}
                    color={passwordVerify ? '#3b82f6' : '#9ca3af'}
                    style={{
                      position: 'absolute',
                      left: 14,
                      zIndex: 1,
                    }}
                  />
                  <Input
                    flex={1}
                    height={56}
                    borderRadius="$4"
                    placeholder="Enter new password"
                    secureTextEntry={secureTextEntry}
                    autoCapitalize="none"
                    onChangeText={handlePassword}
                    value={password}
                    color="$color10"
                    paddingLeft={46}
                    paddingRight={46}
                    borderWidth={2}
                    borderColor={
                      errorMessage && !password
                        ? '$red8'
                        : passwordVerify && password
                          ? '$green8'
                          : '$gray6'
                    }
                    backgroundColor={
                      errorMessage && !password
                        ? '$red1'
                        : passwordVerify && password
                          ? '$green1'
                          : '$gray1'
                    }
                    focusStyle={{
                      borderColor: passwordVerify ? '$green9' : '$blue9',
                      backgroundColor: 'white',
                    }}
                  />
                  <Button
                    chromeless
                    size="$4"
                    circular
                    position="absolute"
                    right={6}
                    onPress={handleSecureEntryClickEvent}
                    padding="$1">
                    <Icon
                      name={secureTextEntry ? 'eye-off' : 'eye'}
                      size={20}
                      color="#6b7280"
                    />
                  </Button>
                </XStack>

                {/* Password Requirements */}
                <XStack gap="$2" alignItems="center" paddingLeft="$2">
                  {password && passwordVerify ? (
                    <>
                      <Text fontSize={14} color="$green10">✓</Text>
                      <Text fontSize={13} color="$green10" fontWeight="500">
                        Password meets requirements
                      </Text>
                    </>
                  ) : password ? (
                    <>
                      <Text fontSize={14} color="$red10">✗</Text>
                      <Text fontSize={13} color="$gray11" fontWeight="500">
                        At least 6 characters with lowercase letter
                      </Text>
                    </>
                  ) : (
                    <Text fontSize={13} color="$gray10" fontWeight="500">
                      At least 6 characters with lowercase letter
                    </Text>
                  )}
                </XStack>
              </YStack>

              <YStack gap="$2">
                <Text fontWeight="600" color="$gray11" fontSize={14}>
                  Confirm Password
                </Text>

                <XStack alignItems="center" position="relative">
                  <Entypo
                    name="lock"
                    size={20}
                    color={
                      confirmPassword && password === confirmPassword
                        ? '#3b82f6'
                        : '#9ca3af'
                    }
                    style={{
                      position: 'absolute',
                      left: 14,
                      zIndex: 1,
                    }}
                  />
                  <Input
                    flex={1}
                    height={56}
                    borderRadius="$4"
                    placeholder="Re-enter password"
                    secureTextEntry={secureNewTextEntry}
                    autoCapitalize="none"
                    onChangeText={handleConfirmPassword}
                    value={confirmPassword}
                    color="$color10"
                    paddingLeft={46}
                    paddingRight={46}
                    borderWidth={2}
                    borderColor={
                      errorMessage && !confirmPassword
                        ? '$red8'
                        : confirmPassword && password === confirmPassword
                          ? '$green8'
                          : '$gray6'
                    }
                    backgroundColor={
                      errorMessage && !confirmPassword
                        ? '$red1'
                        : confirmPassword && password === confirmPassword
                          ? '$green1'
                          : '$gray1'
                    }
                    focusStyle={{
                      borderColor:
                        confirmPassword && password === confirmPassword
                          ? '$green9'
                          : '$blue9',
                      backgroundColor: 'white',
                    }}
                  />
                  <Button
                    chromeless
                    size="$4"
                    circular
                    position="absolute"
                    right={6}
                    onPress={handleSecureNewEntryClickEvent}
                    padding="$1">
                    <Icon
                      name={secureNewTextEntry ? 'eye-off' : 'eye'}
                      size={20}
                      color="#6b7280"
                    />
                  </Button>
                </XStack>

                {/* Confirmation Status */}
                {confirmPassword && (
                  <XStack gap="$2" alignItems="center" paddingLeft="$2">
                    {password === confirmPassword ? (
                      <>
                        <Text fontSize={14} color="$green10">✓</Text>
                        <Text fontSize={13} color="$green10" fontWeight="500">
                          Passwords match
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text fontSize={14} color="$red10">✗</Text>
                        <Text fontSize={13} color="$red10" fontWeight="500">
                          Passwords don't match
                        </Text>
                      </>
                    )}
                  </XStack>
                )}
              </YStack>
            </YStack>

            {/* Error Message */}
            {errorMessage && (
              <XStack
                gap="$2"
                ai="center"
                mt="$4"
                paddingHorizontal="$3"
                paddingVertical="$2"
                backgroundColor="$red2"
                borderRadius="$3"
                alignSelf="stretch">
                <Text fontSize={16}>⚠️</Text>
                <Paragraph
                  color="$red10"
                  fontSize={14}
                  fontWeight="600"
                  flex={1}>
                  {errorMessage}
                </Paragraph>
              </XStack>
            )}

            {/* Confirm Button */}
            <YStack w="100%" marginTop="$6">
              <Button
                backgroundColor={
                  password && confirmPassword && password === confirmPassword && passwordVerify
                    ? '$blue10'
                    : '$gray7'
                }
                w="100%"
                h={56}
                borderRadius={12}
                hoverStyle={{ bg: '$blue9', opacity: 0.9 }}
                pressStyle={{ bg: '$blue11', scale: 0.98 }}
                disabled={!password || !confirmPassword || password !== confirmPassword || !passwordVerify}
                shadowColor="$blue8"
                shadowRadius={12}
                shadowOffset={{ width: 0, height: 4 }}
                shadowOpacity={0.25}
                onPress={handlePasswordSubmit}>
                <Text fontSize={17} fontWeight="600" color="white">
                  Reset Password
                </Text>
              </Button>
            </YStack>

            {/* Return Link */}
            <Button
              chromeless
              marginTop="$5"
              onPress={() => navigation.navigate('LoginScreen')}
              padding="$2"
              height="auto">
              <XStack ai="center" gap="$2">
                <Icon
                  color="$gray10"
                  name="arrow-back-circle-outline"
                  size={24}
                />
                <Text
                  color="$blue10"
                  fontWeight="600"
                  fontSize={15}>
                  Back to Login
                </Text>
              </XStack>
            </Button>
          </Card>
        </YStack>
      </SafeAreaView>
    </Theme>
  );
}
