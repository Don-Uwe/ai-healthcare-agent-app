import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Button,
  Card,
  Circle,
  Input,
  Paragraph,
  Text,
  useTheme,
  XStack,
  YStack
} from 'tamagui';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { ON_PRIMARY_COLOR, PRIMARY_COLOR } from '@/src/helper/Theme';
import { useChangePasswordMutation } from '@/src/hooks/useChangePassword';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import Icon from '@expo/vector-icons/Ionicons';
import { AxiosError } from 'axios';
import Loader from '../../components/Loader';
import { NewPasswordScreenProp } from '../../type';
import {Alert, ActivityIndicator} from 'react-native';

const newPasswordSchema = z.object({
  password: z
    .string()
    .min(1, 'Password is required.')
    .min(8, 'Password must contain at least 8 characters.')
    .regex(/(?=.*[a-z])/, 'Password must contain at least one lowercase letter.')
    .regex(/(?=.*[0-9]|.*[!@#$%^&*])/, 'Password must contain at least one number or special character.'),
  confirmPassword: z.string().min(1, 'Please confirm your password.'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match. Please re-enter.",
  path: ['confirmPassword'],
});
type NewPasswordFormData = z.infer<typeof newPasswordSchema>;

export default function NewPasswordScreen({
  navigation,
  route,
}: NewPasswordScreenProp) {
  const {email} = route.params;

  const {
    control,
    handleSubmit,
    watch,
    formState: { isValid, errors },
  } = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');
  const passwordVerify = !errors.password && password.length >= 8;

  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureNewTextEntry, setSecureNewTextEntry] = useState(true);
  const {mutate: changePassword, isPending} = useChangePasswordMutation();

  const handleSecureEntryClickEvent = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const theme = useTheme();

  const handleSecureNewEntryClickEvent = () => {
    setSecureNewTextEntry(!secureNewTextEntry);
  };

  const handlePasswordSubmit = (data: NewPasswordFormData) => {

    changePassword(
      {email, newPassword: password},
      {
        onSuccess: () => {
          Alert.alert('Password reset successfully');
          navigation.navigate('LoginScreen', {});
        },
        onError: (error: AxiosError) => {
          if (error.response) {
            switch (error.response.status) {
              case 400: Alert.alert('Error', 'User not found'); break;
              case 402: Alert.alert('Error', 'New password should not be same as old password.'); break;
              default: Alert.alert('Error', 'Something went wrong. Please try again.');
            }
          } else {
            Alert.alert('Error', 'Something went wrong. Please try again.');
          }
        },
      },
    );
  };


  const insets = useSafeAreaInsets();
  if (isPending) {
    return <Loader />;
  }
  return (
    <YStack flex={1} backgroundColor="$background" paddingTop={insets.top}>
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        paddingHorizontal="$4"
        padding="$3">
        <Card
          elevate
          bordered
          backgroundColor="$backgroundLight"
          width="100%"
          maxWidth={440}
          height="auto"
          padding="$6"
          borderRadius="$8"
          shadowColor="$black"
          shadowOpacity={0.08}
          shadowRadius={24}
          shadowOffset={{width: 0, height: 8}}
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
            color="$gray700"
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
              <Text fontWeight="600" color="$gray700" fontSize={14}>
                New Password
              </Text>

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                  <XStack alignItems="center" position="relative">
                    <Entypo
                      name="lock"
                      size={20}
                      color={!error && value ? '$blue10' : '$gray500'}
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
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                      color="$color10"
                      paddingLeft={46}
                      paddingRight={46}
                      borderWidth={2}
                      borderColor={
                        error && value
                          ? '$red8'
                          : !error && value
                            ? '$green8'
                            : '$gray6'
                      }
                      backgroundColor={
                        error && value
                          ? '$red1'
                          : !error && value
                            ? '$green1'
                            : '$gray1'
                      }
                      focusStyle={{
                        borderColor: !error && value ? '$green9' : '$blue9',
                        backgroundColor: '$background',
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
                        color={theme.gray700.val}
                      />
                    </Button>
                  </XStack>
                )}
              />

              {/* Password Requirements */}
              <XStack gap="$2" alignItems="center" paddingLeft="$2">
                {password && passwordVerify ? (
                  <>
                    <Text fontSize={14} color="$green10">
                      ✓
                    </Text>
                    <Text fontSize={13} color="$green10" fontWeight="500">
                      Password meets requirements
                    </Text>
                  </>
                ) : errors.password ? (
                  <>
                    <Text fontSize={14} color="$red10">
                      ✗
                    </Text>
                    <Text fontSize={13} color="$red10" fontWeight="500">
                      {errors.password.message}
                    </Text>
                  </>
                ) : (
                  <Text fontSize={13} color="$gray400" fontWeight="500">
                    At least 8 characters with a number or special character
                  </Text>
                )}
              </XStack>
            </YStack>

            <YStack gap="$2">
              <Text fontWeight="600" color="$gray700" fontSize={14}>
                Confirm Password
              </Text>

              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                  <XStack alignItems="center" position="relative">
                    <Entypo
                      name="lock"
                      size={20}
                      color={
                        value && password === value
                          ? theme.blue10.val
                          : theme.gray500.val
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
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                      color="$color10"
                      paddingLeft={46}
                      paddingRight={46}
                      borderWidth={2}
                      borderColor={
                        error && value
                          ? '$red8'
                          : value && password === value
                            ? '$green8'
                            : '$gray6'
                      }
                      backgroundColor={
                        error && value
                          ? '$red1'
                          : value && password === value
                            ? '$green1'
                            : '$gray1'
                      }
                      focusStyle={{
                        borderColor:
                          value && password === value
                            ? '$green9'
                            : '$blue9',
                        backgroundColor: '$background',
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
                        color={theme.gray600.val}
                      />
                    </Button>
                  </XStack>
                )}
              />

              {/* Confirmation Status */}
              {confirmPassword && (
                <XStack gap="$2" alignItems="center" paddingLeft="$2">
                  {password === confirmPassword ? (
                    <>
                      <Text fontSize={14} color="$green10">
                        ✓
                      </Text>
                      <Text fontSize={13} color="$green10" fontWeight="500">
                        Passwords match
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text fontSize={14} color="$red10">
                        ✗
                      </Text>
                      <Text fontSize={13} color="$red10" fontWeight="500">
                        {errors.confirmPassword?.message || "Passwords don't match"}
                      </Text>
                    </>
                  )}
                </XStack>
              )}
            </YStack>
          </YStack>

          {/* Confirm Button */}
          <YStack w="100%" marginTop="$6">
            <Button
              backgroundColor={
                isValid && !isPending
                  ? '$blue10'
                  : '$gray7'
              }
              w="100%"
              h={56}
              borderRadius={12}
              hoverStyle={{bg: '$blue9', opacity: 0.9}}
              pressStyle={{bg: '$blue11', scale: 0.98}}
              disabled={
                !isValid || isPending
              }
              shadowColor="$blue8"
              shadowRadius={12}
              shadowOffset={{width: 0, height: 4}}
              shadowOpacity={0.25}
              onPress={handleSubmit(handlePasswordSubmit)}>
              <Text fontSize={17} fontWeight="600" color="white">
                Reset Password
              </Text>
            </Button>
          </YStack>

        </Card>
      </YStack>
    </YStack>
  );
}

