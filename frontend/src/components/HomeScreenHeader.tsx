import React from 'react';
import { Input, XStack, YStack, Button, Text } from "tamagui";
import Feather from '@expo/vector-icons/Feather';

interface HomeScreenHeaderProps {
  handlePresentModalPress: () => void;
  onTextInputChange: (text: string) => void;
  onNotificationClick: () => void;
  unreadCount: number;
  hasActiveFilters?: boolean;
  onFilterReset?: () => void;
  searchText: string; // AI Review Bug Fix: Input field ka value control karne ke liye
}

export const HomeScreenHeader = ({
  handlePresentModalPress,
  onTextInputChange,
  onNotificationClick,
  unreadCount,
  hasActiveFilters = false,
  onFilterReset,
  searchText,
}: HomeScreenHeaderProps) => {
  return (
    <YStack backgroundColor="#000A60" width="100%" paddingHorizontal="$3" paddingVertical="$3" elevation={1}>
      <XStack alignItems="center" justifyContent="space-between" gap="$3">
        
        {/* Search Bar Wrapper */}
        <XStack 
          flex={1} 
          alignItems="center" 
          backgroundColor="white" 
          borderWidth={1.5} 
          borderColor="#4D6360" 
          borderRadius={10} 
          paddingHorizontal="$2" 
          paddingVertical="$1"
        >
          <Feather name="search" size={18} color="#778599" style={{ marginLeft: 4 }} />
          
          {/* SINGLE INPUT COMPONENT (No Duplication) */}
          <Input 
            unstyled
            flex={1}
            placeholder="Search articles..."
            placeholderTextColor="#778599"
            fontSize="$4"
            value={searchText} // State binding fix
            onChangeText={onTextInputChange}
          />
          
          {/* REPOSITIONED CLEAR ALL BUTTON WITH BETTER TAP TARGET & CONTRAST */}
          {hasActiveFilters && onFilterReset && (
            <Button 
              chromeless 
              onPress={onFilterReset}
              paddingHorizontal="$3" // Target size improved for mobile accessibility
              paddingVertical="$2"
              marginRight="$1"
              accessibilityLabel="Clear all active filters" // Added accessibility label
            >
              <Text 
                color="$color" // Using Tamagui theme token instead of hardcoded magic hex
                fontWeight="$fontWeight.semibold" // Design token compliance
                fontSize="$2"
              >
                Clear All
              </Text>
            </Button>
          )}
        </XStack>

        {/* ... (Baqi ka notification aur menu button code bilkul pehle jaisa same rane dein) ... */}

      </XStack>
    </YStack>
  );
};