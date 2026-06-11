import React from 'react';
import { Input, XStack, YStack, Button, Text, View } from "tamagui";
import Feather from '@expo/vector-icons/Feather';

// ... existing props setup ...

export const HomeScreenHeader = ({
  handlePresentModalPress,
  onTextInputChange,
  onNotificationClick,
  unreadCount,
  hasActiveFilters = false, // Yeh check karega filters active hain ya nahi
  onFilterReset, // Reset trigger logic
}: HomeScreenHeaderProps) => {
  return (
    <YStack backgroundColor="#000A60" width="100%" paddingHorizontal="$3" paddingVertical="$3" elevation={1}>
      <XStack alignItems="center" justifyContent="space-between" gap="$3">
        
        {/* Search Bar Container */}
        <XStack flex={1} alignItems="center" backgroundColor="white" borderWidth={1.5} borderColor="#4D6360" borderRadius={10} paddingHorizontal="$1" paddingVertical="$0.5">
          <Feather name="search" size={18} color="#778599" style={{ marginLeft: 8 }} />
          <Input 
            flex={1}
            placeholder="Search articles..."
            borderWidth={0}
            backgroundColor="transparent"
            onChangeText={onTextInputChange}
          />
          
          {/* REPOSITIONED FILTER BUTTON INSIDE THE HEADER WRAPPER */}
          {hasActiveFilters && (
            <Button 
              chromeless 
              onPress={onFilterReset} 
              paddingHorizontal="$2" 
              paddingVertical="$1" 
              marginRight="$2"
            >
              <Text color="#4D6360" fontWeight="700" fontSize={12}>Clear All</Text>
            </Button>
          )}
        </XStack>

        {/* ... remaining notification/menu buttons code exactly same ... */}
      </XStack>
    </YStack>
  );
};