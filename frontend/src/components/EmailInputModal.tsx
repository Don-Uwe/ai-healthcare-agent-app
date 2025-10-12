import React, { useState } from 'react';
import {
  Dialog,
  Button,
  YStack,
  Input,
  Spacer,
  H2,
  H4,
} from 'tamagui';
import { EmailInputModalProp } from '../type';

export default function EmailInputModal({
  visible,
  callback,
  backButtonClick,
  onDismiss,
  isRequestVerification,
}: EmailInputModalProp) {
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState(true);

  const verifyEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const valid = emailRegex.test(email);
    setIsValid(valid);

    if (valid) {
      callback(email);
      setEmail('');
    }
  };

  const handleBackClick = () => {
    setIsValid(true);
    setEmail('');
    backButtonClick();
  };

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && onDismiss?.()}>
      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          animation="fast"
          opacity={0.6}
          backgroundColor="rgba(0,0,0,0.5)"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />

        <Dialog.Content
          elevate
          bg="$background"
          p="$6"
          paddingVertical="$7"
          borderRadius="$6"
          width="90%"
          maxWidth={480}
          maxHeight="95%"
          animation={[
            'bouncy',
            {
              opacity: { overshootClamping: true },
            },
          ]}
          // eslint-disable-next-line react-native/no-inline-styles
          enterStyle={{ y: '-20px', opacity: 0 }}
          // eslint-disable-next-line react-native/no-inline-styles
          exitStyle={{ y: '20px', opacity: 0 }}
        >
          <YStack width="100%" gap="$4" alignItems="center">
            <H2
              color={isValid ? '$color12' : '$red10'}
              textAlign="center"
              fontSize={28}
            >
              {isValid
                ? isRequestVerification
                  ? 'Email Verification'
                  : 'Forgot Password'
                : 'Email is not valid'}
            </H2>

            <H4 color="$color10" textAlign="center" fontSize={16}>
              Please enter your registered email to continue.
            </H4>

            <Spacer size={8} />

            <Input
              size="$7"
              height="$5"
              width="100%"
              padding={"$2"}
              borderRadius={"$2"}
              placeholder="Enter your email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setIsValid(true);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              borderColor={isValid ? '$color6' : '$red8'}
              backgroundColor={isValid ? '$color2' : '$red1'}
            />

            <YStack gap="$3" width="100%">
              <Button size="$4"  height="$5" padding="$2" theme="blue" onPress={verifyEmail}>
                {isRequestVerification ? 'Send Verification Link' : 'Send OTP'}
              </Button>

              <Button
                size="$4"
                height="$5"
                theme="active"
                padding="$3"
                variant="outlined"
                onPress={handleBackClick}
              >
                Back
              </Button>
            </YStack>
          </YStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}