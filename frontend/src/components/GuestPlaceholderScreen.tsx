import React, { useState } from 'react';
import { YStack, Text, Button } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import LottieView from 'lottie-react-native';

import { RootStackParamList } from '../type';
import BenefitsModal from './BenefitsModal';

interface GuestPlaceholderScreenProps {
  title?: string;
  description?: string;
}

const GuestPlaceholderScreen: React.FC<GuestPlaceholderScreenProps> = ({
  title = 'Join the Community',
  description = 'Sign up or sign in to access personalized features, interact with the community, and manage your profile.',
}) => {
  const inset = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [isBenefitsModalVisible, setIsBenefitsModalVisible] = useState(false);

  return (
    <YStack
      flex={1}
      backgroundColor="$background"
      paddingHorizontal="$5"
      paddingTop={inset.top + 40}
      justifyContent="center"
      alignItems="center"
      space="$5"
      animation="bouncy"
      enterStyle={{ opacity: 0, y: 15, scale: 0.95 }}
    >
      <YStack
        alignItems="center"
        justifyContent="center"
        marginBottom="$4"
        animation="bouncy"
        enterStyle={{ opacity: 0, scale: 0.5 }}
      >
        <LottieView
          source={require('../assets/LottieAnimation/lock-animation.json')}
          autoPlay
          loop
          style={{
            width: 240,
            height: 240,
          }}
        />
      </YStack>

      <Text
        fontSize={24}
        fontWeight="800"
        color="$color"
        textAlign="center"
      >
        {title}
      </Text>

      <Text
        fontSize={16}
        color="$color10"
        textAlign="center"
        lineHeight={24}
        paddingHorizontal="$2"
        marginBottom="$6"
      >
        {description}
      </Text>

      <YStack width="100%" space="$3" marginTop="$4">
        <Button
          backgroundColor="$primary"
          size="$6"
          fontWeight="700"
          borderRadius="$4"
          pressStyle={{ scale: 0.97 }}
          animation="fast"
          onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'LoginScreen' }],
            });
          }}
        >
          <Text fontSize={18} color="$white" fontWeight="600">
            Sign In
          </Text>
        </Button>

        <Button
          variant="outlined"
          borderColor="$borderColor"
          size="$6"
          borderRadius="$4"
          pressStyle={{ scale: 0.97 }}
          animation="fast"
          onPress={() => {
            navigation.navigate('SignUpScreenFirst');
          }}
        >
          <Text fontSize={18} color="$color" fontWeight="600">
            Sign Up
          </Text>
        </Button>
      </YStack>

      <Button
        variant="outlined"
        borderWidth={0}
        backgroundColor="transparent"
        marginTop="$4"
        pressStyle={{ scale: 0.97, opacity: 0.7 }}
        animation="fast"
        onPress={() => setIsBenefitsModalVisible(true)}
      >
        <Text
          fontSize={15}
          color="$color10"
          fontWeight="600"
          textDecorationLine="underline"
        >
          Why should I create an account?
        </Text>
      </Button>

      <BenefitsModal
        visible={isBenefitsModalVisible}
        onDismiss={() => setIsBenefitsModalVisible(false)}
        onSignUp={() => {
          setIsBenefitsModalVisible(false);
          navigation.navigate('SignUpScreenFirst');
        }}
      />
    </YStack>
  );
};

export default GuestPlaceholderScreen;