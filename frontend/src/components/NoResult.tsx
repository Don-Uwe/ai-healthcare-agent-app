// NoResults.js
import {MaterialIcons} from '@expo/vector-icons';
import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';

import {YStack, Text} from 'tamagui';

const NoResults = ({query = ''}) => {
  return (
    <SafeAreaView>
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        paddingHorizontal="$4"
        gap="$2">
        <MaterialIcons name="podcasts" size={64} color="#B0B0B0" />

        <Text fontSize="$5" fontWeight="600" color="$gray10">
          No podcasts found
        </Text>

        <Text fontSize="$3" color="$gray8" textAlign="center">
          Try with different keywords or check back later.
        </Text>
      </YStack>
      {/* Empty Result */}
    </SafeAreaView>
  );
};

export default NoResults;
