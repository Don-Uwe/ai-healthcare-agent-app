import React from 'react';
import { Input, XStack, YStack, Button, Text } from "tamagui";
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import { HomeScreenHeaderProps } from '../types'; // Purani types file mapping back as bot requested

const HomeScreenHeader = ({
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
        
        {/* Left Side Menu Button - Restored! */}
        <Button chromeless onPress={handlePresentModalPress} padding="$0">
          <AntDesign name="menu-fold" size={24} color="white" />
        </Button>

        {/* Center Search Bar Wrapper */}
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
          
          <Input 
            unstyled
            flex={1}
            placeholder="Search articles..."
            placeholderTextColor="#778599"
            fontSize="$4"
            value={searchText}
            onChangeText={onTextInputChange}
            accessibilityLabel="Search articles"
          />
          
          {hasActiveFilters && onFilterReset && (
            <Button 
              chromeless 
              onPress={onFilterReset}
              paddingHorizontal="$3"
              paddingVertical="$2"
              marginRight="$1"
              accessibilityLabel="Clear all active filters"
            >
              <Text 
                color="$color"
                fontWeight="$fontWeight.semibold"
                fontSize="$2"
              >
                Clear All
              </Text>
            </Button>
          )}
        </XStack>

        {/* Right Side Notification Bell with Unread Badge - Restored! */}
        <Button chromeless onPress={onNotificationClick} padding="$0" position="relative">
          <Ionicons name="notifications-outline" size={24} color="white" />
          {unreadCount > 0 && (
            <XStack 
              position="absolute" 
              top={-4} 
              right={-4} 
              backgroundColor="red" 
              borderRadius={10} 
              width={16} 
              height={16} 
              alignItems="center" 
              justifyContent="center"
            >
              <Text color="white" fontSize={10} fontWeight="bold">
                {unreadCount}
              </Text>
            </XStack>
          )}
        </Button>

      </XStack>
    </YStack>
  );
};

export default HomeScreenHeader; // Restored default export to prevent component breaking!