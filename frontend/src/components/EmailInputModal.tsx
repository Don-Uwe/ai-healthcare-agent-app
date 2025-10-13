import React, { useState } from 'react'
import {
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native'
import {
  YStack,
  Button,
  Input,
  Spacer,
  H2,
  H4,
} from 'tamagui'
import { EmailInputModalProp } from '../type'

export default function EmailInputModal({
  visible,
  callback,
  backButtonClick,
  onDismiss,
  isRequestVerification,
}: EmailInputModalProp) {
  const [email, setEmail] = useState('')
  const [isValid, setIsValid] = useState(true)

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
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        onDismiss?.()
      }}
    >
      <TouchableWithoutFeedback onPress={() => onDismiss?.()}>
        <YStack
          flex={1}
          bg="rgba(0,0,0,0.5)"
          justifyContent="center"
          alignItems="center"
        >
          <YStack
            width="90%"
            maxWidth={480}
            minHeight={200}
            bg="$background"
            borderRadius="$6"
            p="$4"
            elevation={10}
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
          </YStack>
        </YStack>
      </TouchableWithoutFeedback>
    </Modal>
  )
}
