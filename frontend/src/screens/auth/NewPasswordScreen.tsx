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
      <SafeAreaView style={{flex: 1, backgroundColor: '#f7f6fb'}}>
        <YStack
          flex={1}
          justifyContent="center"
          alignItems="center"
          paddingHorizontal="$4"
          padding="$6">
          <Card
            elevate
            bordered
            bg="white"
            width="100%"
            maxWidth={400}
            height="auto"
            p="$6"
            br="$8"
            shadowColor="#00000020"
            ai="center">
            {/* Icon Circle */}
            <Circle
              size={70}
              bg={ON_PRIMARY_COLOR}
              jc="center"
              ai="center"
              mb="$4">
              <AntDesign
                size={32}
                name="key"
                color={PRIMARY_COLOR}
                strokeWidth={2.2}
              />
            </Circle>

            {/* Title & Subtitle */}
            <Text
              fontSize={20}
              fontWeight="600"
              alignSelf="center"
              marginTop="$2"
              color="$color12"
              mb="$2">
              Set your new password
            </Text>

            {/* Inputs */}
            <YStack space="$4" w="100%" marginTop="$4">
              <YStack space="$2">
                <Text fontWeight="600" color="$gray11">
                  Password
                </Text>

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
              </YStack>

              <YStack space="$2">
                <Text fontWeight="600" color="$gray11">
                  Confirm your new password
                </Text>

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
                    placeholder="Confirm Password"
                    secureTextEntry={secureNewTextEntry}
                    autoCapitalize="none"
                    onChangeText={handleConfirmPassword}
                    value={confirmPassword}
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
                    onPress={handleSecureNewEntryClickEvent}>
                    <Icon
                      name={secureNewTextEntry ? 'eye-off' : 'eye'}
                      size={22}
                      color={isDarkMode ? 'white' : 'black'}
                    />
                  </Button>
                </XStack>
              </YStack>
            </YStack>

            {/* Error Message */}
            {errorMessage && (
              <Paragraph
                color="$red10"
                fontSize={14}
                fontWeight="600"
                textAlign="center"
                mt="$3">
                {errorMessage}
              </Paragraph>
            )}

            {/* Confirm Button */}
            <YStack w="100%" marginTop="$8">
              <Button
                backgroundColor="$blue10"
                w="100%" // Ensure the button stretches across full width
                h={50}
                borderRadius={10}
                hoverStyle={{bg: '$purple8'}}
                pressStyle={{bg: '$purple7'}}
                onPress={handlePasswordSubmit}>
                <Text fontSize={17} fontWeight="500" color="white">
                  Confirm
                </Text>
              </Button>
            </YStack>

            {/* Return Link */}
            <XStack marginTop="$6" ai="center" space="$2">
              <Icon
                color="$gray10"
                name="arrow-back-circle-outline"
                size={28}
              />
              <Text
                color="$purple10"
                fontWeight="600"
                fontSize={16}
                onPress={() => navigation.navigate('LoginScreen')}>
                Return to the login screen
              </Text>
            </XStack>
          </Card>
        </YStack>
      </SafeAreaView>
    </Theme>
  );
}
