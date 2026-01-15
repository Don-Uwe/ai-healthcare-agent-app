import React from 'react';
import { PodcastProfileProp } from '../type';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { 
  YStack, 
  Text, 
  Heading, 
  XStack, 
  Theme,
  Circle,
  Spacer
} from 'tamagui';

export default function PodcastProfile({ navigation }: PodcastProfileProp) {
  return (
    <Theme name="light">
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background" padding="$8">
        
        {/* Visual Header */}
        <YStack alignItems="center" gap="$5">
          <Circle 
            size={140} 
            backgroundColor="$blue3" 
            elevation="$1"
          >
             <MaterialCommunityIcons name="microphone" size={60} color="$blue10" />
          </Circle>
          
          <YStack alignItems="center" gap="$2">
            <Text 
              fontSize={25}
              fontWeight="700" 
              letterSpacing={-1} 
              color="$color"
            >
              Coming Soon
            </Text>
            <Text 
              color="$gray11" 
              fontSize="$4" 
              textAlign="center" 
              maxWidth={280}
            >
              Our first season is currently in the works. We can't wait to share it with you.
            </Text>
          </YStack>
        </YStack>

        <Spacer size="$10" />

        {/* Minimal Social Links */}
        {/* <YStack alignItems="center" gap="$4">
          <Text fontSize="$3" color="$gray9" letterSpacing={2} fontWeight="600">FOLLOW US</Text>
          <XStack gap="$6" alignItems="center">
            <MaterialCommunityIcons name="instagram" size={28} color="$gray10" />
            <MaterialCommunityIcons name="twitter" size={28} color="$gray10" />
            <MaterialCommunityIcons name="spotify" size={28} color="$gray10" />
          </XStack>
        </YStack> */}
        
      </YStack>
    </Theme>
  );
}