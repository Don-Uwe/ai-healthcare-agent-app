import React, { useState } from 'react'
import { YStack, Button, Input, Spacer, H2, H4 } from 'tamagui'
import { Sheet } from '@tamagui/sheet'
import { EmailInputModalProp } from '../type'

export default function EmailInputBottomSheet({
  visible,
  callback,
  backButtonClick,
  onDismiss,
  isRequestVerification,
}: EmailInputModalProp) {
  const [email, setEmail] = useState('')
  const [isValid, setIsValid] = useState(true)
  const [open, setOpen] = useState(visible)

  const verifyEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const valid = emailRegex.test(email)
    setIsValid(valid)
    if (valid) {
      callback(email)
      setEmail('')
    }
  }

  const handleBackClick = () => {
    setIsValid(true)
    setEmail('')
    backButtonClick()
    setOpen(false)
  }

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={setOpen}
      dismissOnSnapToBottom
      snapPoints={[85, 50, 25]} // Ensure snapPoints are percentages between 0 and 100
      animation="medium"
      zIndex={1000}
    >
      <Sheet.Overlay backgroundColor="rgba(0, 0, 0, 0.5)" />
      <Sheet.Handle />
      <Sheet.Frame padding="$4" justifyContent="center" alignItems="center" gap="$4">
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
            padding="$2"
            borderRadius="$2"
            placeholder="Enter your email"
            value={email}
            onChangeText={(text) => {
              setEmail(text)
              setIsValid(true)
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            borderColor={isValid ? '$color6' : '$red8'}
            backgroundColor={isValid ? '$color2' : '$red1'}
          />

          <YStack gap="$3" width="100%">
            <Button
              size="$4"
              height="$5"
              padding="$2"
              theme="blue"
              onPress={verifyEmail}
            >
              {isRequestVerification
                ? 'Send Verification Link'
                : 'Send OTP'}
            </Button>

            <Button
              size="$4"
              height="$5"
              theme="active"
              variant="outlined"
              onPress={handleBackClick}
            >
              Back
            </Button>
          </YStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  )
}
