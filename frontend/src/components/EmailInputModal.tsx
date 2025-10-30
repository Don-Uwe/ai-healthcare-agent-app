import React, { useEffect, useState } from 'react';
import { YStack, Button, Input, Spacer, H2, H4 , Text} from 'tamagui';
import { Sheet } from '@tamagui/sheet';
import { ScrollView } from 'react-native';
import { EmailInputModalProp } from '../type';

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
      animation="medium"
      zIndex={1000}
    >
      <Sheet.Overlay backgroundColor="rgba(0, 0, 0, 0.1)" pointerEvents="none" />
      <Sheet.Handle />
      <Sheet.Frame padding="$4" justifyContent="center" alignItems="center" gap="$4">
        <ScrollView
          style={{ width: '100%' }}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 20 }} 
        >
          <YStack width="100%" gap="$4" alignItems="center">
            {/* Title */}
            <H2
              color={isValid ? '$color12' : '$red10'}
              textAlign="center"
              fontSize={28}
              marginBottom={10}
            >
              {isValid
                ? isRequestVerification
                  ? 'Email Verification'
                  : 'Forgot Password'
                : 'Email is not valid'}
            </H2>

            {/* Subheading */}
            <H4 color="$color10" textAlign="center" fontSize={16}>
              Please enter your registered email to continue.
            </H4>

            <Spacer size={16} />

            {/* Email Input Field */}
            <Input
              size="$5"
              height="$6"
              width="100%"
              padding="$3"
              borderRadius="$3"
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
             
              onTouchStart={(e) => e.stopPropagation()}
              marginBottom={20} 
            />

            {/* Action Buttons */}
            <YStack gap="$3" width="100%" alignItems="center">
              <Button
               
                size="$5"
                height="$7"
                padding="$3"
                theme="blue"
                onPress={verifyEmail}
                width="100%"
                borderRadius="$3"
                // Styling for active state
                backgroundColor={isValid ? '$blue10' : '$gray500'}
                disabled={!isValid}
              >
              <Text fontSize={18} color="white">{isRequestVerification ? 'Send Verification Link' : 'Send OTP'}</Text>
              </Button>

              <Button
                size="$5"
                height="$7"
                padding="$3"
                theme="active"
                variant="outlined"
                onPress={handleBackClick}
                width="100%"
                borderRadius="$3"
                backgroundColor="$color2"
                color="$color10"
                marginTop={10}
              >
                Back
              </Button>
            </YStack>
          </YStack>
        </ScrollView>
      </Sheet.Frame>
    </Sheet>
  );
}
