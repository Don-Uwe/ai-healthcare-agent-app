import React, { useEffect, useState } from 'react';
import { YStack, Button, Input, Spacer, Text, XStack, Card, Circle, Paragraph, ScrollView as TamaguiScrollView } from 'tamagui';
import { Sheet } from '@tamagui/sheet';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { EmailInputModalProp } from '../type';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';

export default function EmailInputBottomSheet({
  visible,
  callback,
  backButtonClick,
  onDismiss,
  isRequestVerification,
}: EmailInputModalProp) {
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [open, setOpen] = useState(visible);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setOpen(visible);
  }, [visible]);

  const verifyEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const valid = emailRegex.test(email);
    setIsValid(valid);
    if (valid) {
      callback(email);
      setEmail('');
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      handleBackClick();
    }
  };

  const handleBackClick = () => {
    setIsValid(true);
    setEmail('');
    setIsFocused(false);
    backButtonClick();
    setOpen(false);
    onDismiss();
  };

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={handleOpenChange}
      dismissOnSnapToBottom={false}
      dismissOnOverlayPress={false}
      snapPoints={[85, 50, 25]}
      zIndex={100000}
    >
      <Sheet.Overlay
        backgroundColor="rgba(0, 0, 0, 0.5)"
      />
      <Sheet.Handle backgroundColor="$gray8" />
      <Sheet.Frame padding="$5" justifyContent="center" alignItems="center" backgroundColor="$background" zIndex={100001}>
   
          <ScrollView
            style={{ width: '100%' }}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 20, flexGrow: 1, justifyContent: 'center' }}
            showsVerticalScrollIndicator={false}
          >
            <Card
              elevate
              bordered
              padding="$5"
              borderRadius="$6"
              backgroundColor="white"
              shadowColor="rgba(0, 0, 0, 0.1)"
              shadowRadius={20}
              shadowOffset={{ width: 0, height: 4 }}
              zIndex={100002}
              pointerEvents="auto"
            >
            <YStack width="100%" gap="$4" alignItems="center">
              {/* Icon Circle */}
              <Circle
                size={80}
                backgroundColor={isRequestVerification ? '$blue2' : '$purple2'}
                justifyContent="center"
                alignItems="center"
                marginBottom="$2"
              >
                {isRequestVerification ? (
                  <Icon name="email-check-outline" size={40} color="#3b82f6" />
                ) : (
                  <Feather name="lock" size={36} color="#a855f7" />
                )}
              </Circle>

              {/* Title */}
              <Text
                color={isValid ? '$color12' : '$red10'}
                textAlign="center"
                fontSize={26}
                fontWeight="700"
                lineHeight={32}
              >
                {isValid
                  ? isRequestVerification
                    ? 'Email Verification'
                    : 'Forgot Password?'
                  : 'Invalid Email'}
              </Text>

              {/* Subheading */}
              <Paragraph
                color="$gray11"
                textAlign="center"
                fontSize={15}
                fontWeight="500"
                lineHeight={22}
                marginBottom="$2"
              >
                {isValid
                  ? isRequestVerification
                    ? 'Please enter your registered email to receive the verification link.'
                    : 'Enter your email address and we\'ll send you a code to reset your password.'
                  : 'Please enter a valid email address to continue.'}
              </Paragraph>

              {/* Email Input Field with Icon */}
              <YStack width="100%" gap="$2">
                <Text fontSize={14} fontWeight="600" color="$gray11">
                  Email Address
                </Text>
                <XStack
                  alignItems="center"
                  position="relative"
                  width="100%"
                >
                  <Icon
                    name="email-outline"
                    size={20}
                    color={isFocused ? (isValid ? '#3b82f6' : '#ef4444') : '#9ca3af'}
                    style={{
                      position: 'absolute',
                      left: 14,
                      zIndex: 1,
                    }}
                  />
                  <Input
                    flex={1}
                    height={56}
                    paddingLeft={46}
                    paddingRight="$4"
                    borderRadius="$4"
                    placeholder="your.email@example.com"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setIsValid(true);
                    }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    borderWidth={2}
                    borderColor={
                      !isValid
                        ? '$red8'
                        : isFocused
                          ? '$blue8'
                          : '$gray6'
                    }
                    backgroundColor={!isValid ? '$red1' : '$gray1'}
                    focusStyle={{
                      borderColor: isValid ? '$blue9' : '$red8',
                      backgroundColor: 'white',
                    }}
                    pointerEvents="auto"
                  />
                </XStack>
                {!isValid && (
                  <XStack gap="$2" alignItems="center" paddingLeft="$2">
                    <Feather name="alert-circle" size={14} color="#ef4444" />
                    <Text fontSize={13} color="$red10" fontWeight="500">
                      Please enter a valid email address
                    </Text>
                  </XStack>
                )}
              </YStack>

              <Spacer size="$2" />

              {/* Action Buttons */}
              <YStack gap="$3" width="100%" alignItems="center">
                <Button
                  size="$5"
                  height={56}
                  onPress={verifyEmail}
                  width="100%"
                  borderRadius="$4"
                  backgroundColor={email.trim() ? '$blue10' : '$gray7'}
                  hoverStyle={{ backgroundColor: '$blue9', opacity: 0.9 }}
                  pressStyle={{ backgroundColor: '$blue11', scale: 0.98 }}
                  disabled={!email.trim()}
                  shadowColor="$blue8"
                  shadowRadius={12}
                  shadowOffset={{ width: 0, height: 4 }}
                  shadowOpacity={0.3}
                >
                  <Text fontSize={17} fontWeight="600" color="white">
                    {isRequestVerification ? 'Send Verification Link' : 'Send Reset Code'}
                  </Text>
                </Button>

                <Button
                  size="$5"
                  height={56}
                  onPress={handleBackClick}
                  width="100%"
                  borderRadius="$4"
                  backgroundColor="transparent"
                  borderWidth={2}
                  borderColor="$gray7"
                  hoverStyle={{
                    backgroundColor: '$gray2',
                    borderColor: '$gray8'
                  }}
                  pressStyle={{
                    backgroundColor: '$gray3',
                    scale: 0.98
                  }}
                >
                  <Text fontSize={17} fontWeight="600" color="$gray11">
                    Cancel
                  </Text>
                </Button>
              </YStack>
            </YStack>
          </Card>
          </ScrollView>
     
      </Sheet.Frame>
    </Sheet>
  );
}
