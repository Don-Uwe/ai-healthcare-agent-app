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
      elevation={3}
      style={{
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        backgroundColor: 'white',
        borderRadius: 8,
      }}
      paddingHorizontal={10}
      paddingVertical={6}
      shadowColor={'white'}
      //borderBottomWidth={1}
      //borderColor="$gray5"
      marginTop="$2">
      {/* Main Comment Layout */}
      <XStack alignItems="flex-start" space="$3">
        {/* Profile Image */}
        <Avatar circular size="$5">
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
          <Avatar.Fallback backgroundColor="#ccc" />
        </Avatar>

        {/* Comment Content */}
        <YStack flex={1} space="$1.5">
          <XStack alignItems="center" justifyContent="space-between">
            <XStack alignItems="center" space="$2">
              <Text fontWeight="700" color="$gray12" fontSize={18}>
                {item.adminId ? item.adminId.user_handle : item.userId.user_handle}
              </Text>
              {item.isEdited && (
                <Text color="$gray9" fontSize={15}>
                  (edited)
                </Text>
              )}
            </XStack>
          </XStack>

          <Paragraph color="$gray11" fontSize={16}>
            {item.content}
          </Paragraph>

          <Text color="$gray9" fontSize="$3">
            Last updated {formatWithOrdinal(item.updatedAt)}
          </Text>
        </YStack>
      </XStack>
    </YStack>
  );
}


