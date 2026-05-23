import React, { useState } from 'react';
import { Image } from 'react-native';
import { YStack, Text, Button, XStack } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../type';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import BenefitsModal from './BenefitsModal';

interface GuestPlaceholderScreenProps {
  title?: string;
  description?: string;
  iconName?: string;
}

const GuestPlaceholderScreen: React.FC<GuestPlaceholderScreenProps> = ({
  title = 'Join the Community',
  description = 'Sign up or sign in to access personalized features, interact with the community, and manage your profile.',
  iconName = 'user-lock',
}) => {
  // removed isDarkMode variable
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
        backgroundColor="$backgroundLight"
        width={100} 
        height={100} 
        borderRadius={50}
        marginBottom="$4"
        animation="bouncy"
        enterStyle={{ opacity: 0, scale: 0.5 }}
      >
        <FontAwesome5 name={iconName} size={40} color="$color" />
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
              routes: [{name: 'LoginScreen'}],
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
        <Text fontSize={15} color="$color10" fontWeight="600" textDecorationLine="underline">
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
