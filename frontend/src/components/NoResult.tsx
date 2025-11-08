// NoResults.js
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { YStack , Image, Text} from 'tamagui';

const NoResults = ({ query = '' }) => {
  return (
    <SafeAreaView>
    <YStack f={1} jc="center" ai="center" space="$3">
      {/* Empty Result */}
      <MaterialCommunityIcons
      name='book-search'
      size={100}
      color={'#0EA5E9'}
      />
      <Text fontSize="$6" fontWeight="700" color="#808080">
        No results found
      </Text>
      <Text fontSize="$4" color="#777">
        Try different keywords or check your spelling.
      </Text>
    </YStack>
    </SafeAreaView>
  )
};


export default NoResults;
