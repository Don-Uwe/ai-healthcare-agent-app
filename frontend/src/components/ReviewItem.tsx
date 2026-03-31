import React from 'react';
import {Comment} from '../type';
import moment from 'moment';
import {Avatar, XStack, YStack, Text, Paragraph} from 'tamagui';
import {GET_STORAGE_DATA} from '../helper/APIUtils';

export default function ReviewItem({item}: {item: Comment}) {


  const formatWithOrdinal = date => {
    return moment(date).format('D MMM, ddd, h:mm a');
  };


  return (
    <YStack
      space="$3"
      marginBottom="$4"
      elevation={5}
      style={{
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 3},
        shadowOpacity: 0.1,
        shadowRadius: 8,
        backgroundColor: 'white',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0',
      }}
      paddingHorizontal={16}
      paddingVertical={14}
      marginTop="$2">
      {/* Main Comment Layout */}
      <XStack alignItems="flex-start" space="$3">
        {/* Profile Image */}
        <Avatar circular size="$6">
          <Avatar.Image
            accessibilityLabel={
              item.adminId
                ? item.adminId?.user_handle || 'Admin Avatar'
                : item.userId?.user_handle || 'User Avatar'
            }
            src={
              //  If Admin Exists  Use Admin Avatar
              item.adminId?.Profile_avtar
                ? item.adminId.Profile_avtar.startsWith('https')
                  ? item.adminId.Profile_avtar
                  : `${GET_STORAGE_DATA}/${item.adminId.Profile_avtar}`
                : //  Else If User Exists  Use User Avatar
                item.userId?.Profile_image
                ? item.userId.Profile_image.startsWith('https')
                  ? item.userId.Profile_image
                  : `${GET_STORAGE_DATA}/${item.userId.Profile_image}`
                : //  Fallback
                  'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500'
            }
          />
          <Avatar.Fallback backgroundColor="#E0E0E0" />
        </Avatar>

        {/* Comment Content */}
        <YStack flex={1} space="$2">
          <XStack alignItems="center" justifyContent="space-between">
            <XStack alignItems="center" space="$2">
              <Text fontWeight="800" color="#1A1A1A" fontSize={17} letterSpacing={0.3}>
                {item.adminId ? item.adminId.user_handle : item.userId.user_handle}
              </Text>
              {item.isEdited && (
                <Text color="$gray9" fontSize={13} fontStyle="italic">
                  (edited)
                </Text>
              )}
            </XStack>
          </XStack>

          <Paragraph color="#4A4A4A" fontSize={15} lineHeight={22}>
            {item.content}
          </Paragraph>

          <Text color="#999" fontSize={13} marginTop="$1">
            Last updated {formatWithOrdinal(item.updatedAt)}
          </Text>
        </YStack>
      </XStack>
    </YStack>
  );
}


