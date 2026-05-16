import React from 'react';
import { useColorScheme, Image } from 'react-native';
import { YStack, Text, Button, XStack } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../type';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

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
  const isDarkMode = useColorScheme() === 'dark';
  const inset = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <YStack
      flex={1}
      backgroundColor={isDarkMode ? '$background' : '#fff'}
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
        backgroundColor={isDarkMode ? '$gray400' : '$blue3'}
        width={100} 
        height={100} 
        borderRadius={50}
        marginBottom="$4"
        animation="bouncy"
        enterStyle={{ opacity: 0, scale: 0.5 }}
      >
        <FontAwesome5 name={iconName} size={40} color={isDarkMode ? 'white' : '#000A60'} />
      </YStack>

      <Text
        fontSize={24}
        fontWeight="800"
        color={isDarkMode ? '$color' : '$color10'}
        textAlign="center"
      >
        {title}
      </Text>

      <Text
        fontSize={16}
        color={isDarkMode ? '$color10' : '$gray11'}
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
          borderColor={isDarkMode ? '$gray600' : '$gray8'}
          size="$6"
          borderRadius="$4"
          pressStyle={{ scale: 0.97 }}
          animation="fast"
          onPress={() => {
             navigation.navigate('SignUpScreenFirst');
          }}
        >
          <Text fontSize={18} color={isDarkMode ? '$color' : '$black'} fontWeight="600">
            Sign Up
          </Text>
        </Button>
      </YStack>
    </YStack>
  );
};

export default GuestPlaceholderScreen;
