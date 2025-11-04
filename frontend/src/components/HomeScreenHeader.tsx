import React from 'react';
import { Input, XStack, YStack, Button, Text, View } from 'tamagui';
import { Feather, AntDesign, Ionicons } from '@expo/vector-icons';
import { PRIMARY_COLOR } from '../helper/Theme';
import { HomeScreenHeaderProps } from '../type';

export const HomeScreenHeader = ({
  handlePresentModalPress,
  onTextInputChange,
  onNotificationClick,
  unreadCount,
}: HomeScreenHeaderProps) => {
  return (
    <YStack bg="#000A60" w="100%" px="$4" py="$3" elevation={1}>
      <XStack ai="center" jc="space-between" space="$3">
        {/* Search Bar */}
        <XStack
          flex={1}
          ai="center"
          bg="white"
          borderWidth={1.5}
          borderColor={'#4D6360'}
          borderRadius={10}
          px="$2"
          py="$0.5"
          jc="space-between"
          shadowColor="rgba(0,0,0,0.05)"
        >
          <Feather name="search" size={18} color="#778599" />
          <Input
            unstyled
            flex={1}
            marginLeft="$2"
            placeholder="Search articles..."
            placeholderTextColor="#778599"
            onChangeText={onTextInputChange}
            fontSize="$4"
          />
          <Button unstyled onPress={handlePresentModalPress}>
            <AntDesign name="menu-fold" size={20} color={'#191C1B'} />
          </Button>
        </XStack>

        {/* Notification */}
        <Button unstyled onPress={onNotificationClick} position="relative" p={0}>
          <Ionicons name="notifications" size={38} color={'white'} />
          {unreadCount > 0 && (
            <View
              position="absolute"
              top={1}
              right={1}
              w={20}
              h={20}
              br={10}
              bg="red"
              ai="center"
              jc="center"
            >
              <Text color="white" fontSize={12} fontWeight="700">
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </Button>
      </XStack>
    </YStack>
  );
};




export default HomeScreenHeader;
