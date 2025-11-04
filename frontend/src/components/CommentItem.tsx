import React, {useState} from 'react';
import {ActivityIndicator, TouchableOpacity} from 'react-native';
import {YStack, XStack, Text, Avatar, Paragraph, View} from 'tamagui';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';
import {FontAwesome, Fontisto} from '@expo/vector-icons';
import moment from 'moment';
import ArticleFloatingMenu from './AnimatedMenu';
import {PRIMARY_COLOR} from '../helper/Theme';
import {Comment} from '../type';
import {GET_STORAGE_DATA} from '../helper/APIUtils';

export default function CommentItem({
  item,
  isSelected,
  userId,
  setSelectedCommentId,
  handleEditAction,
  deleteAction,
  handleLikeAction,
  commentLikeLoading,
  handleMentionClick,
  handleReportAction,
  isFromArticle,
}: {
  item: Comment;
  isSelected: Boolean;
  userId: string;
  setSelectedCommentId: (id: string) => void;
  handleEditAction: (comment: Comment) => void;
  deleteAction: (comment: Comment) => void;
  handleLikeAction: (comment: Comment) => void;
  commentLikeLoading: Boolean;
  handleMentionClick: (user_handle: string) => void;
  handleReportAction: (commentId: string, authorId: string) => void;
  isFromArticle: boolean | undefined;
}) {
  const width = useSharedValue(0);
  const yValue = useSharedValue(60);
  const isMenuVisible = useSharedValue(false);

  const menuStyle = useAnimatedStyle(() => ({
    width: width.value,
    transform: [{translateY: yValue.value}],
  }));

  //console.log("Item", item);

  const handleAnimation = () => {
    if (!isMenuVisible.value) {
      width.value = withTiming(280, {duration: 250});
      yValue.value = withTiming(0, {duration: 250});
      isMenuVisible.value = true;
      setSelectedCommentId(item._id);
    } else {
      width.value = withTiming(0, {duration: 250});
      yValue.value = withTiming(100, {duration: 250});
      isMenuVisible.value = false;
      setSelectedCommentId('');
    }
  };

  const formatWithOrdinal = (date: string) =>
    moment(date).format('D MMM, ddd, h:mm a');

  // Render mentions inline
  const renderTextWithMentions = (text: string) => {
    const regex = /(@\w+)/g;
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <TouchableOpacity key={index} onPress={() => handleMentionClick(part)}>
          <Text color="$blue10" fontWeight="700">
            {part}
          </Text>
        </TouchableOpacity>
      ) : (
        <Text key={index}>{part}</Text>
      ),
    );
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
      mt="$2">
      {/* Floating Menu */}
      <Animated.View
        pointerEvents={isMenuVisible.value ? 'auto' : 'none'}
        style={[
          menuStyle,
          {
            position: 'absolute',
            top: 5,
            right: 0,
            zIndex: 10,
            backgroundColor: 'transparent',
          },
        ]}>
        <ArticleFloatingMenu
          isVisible={isMenuVisible.value}
          items={[
            {
              name: 'Report',
              action: () => {
                handleReportAction(item._id, item.userId._id);
                handleAnimation();
              },
              icon: 'aim',
            },
            ...(userId === item.userId._id && isSelected && !isFromArticle
              ? [
                  {
                    name: 'Edit',
                    action: () => {
                      handleEditAction(item);
                      handleAnimation();
                    },
                    icon: 'edit',
                  },
                  {
                    name: 'Delete',
                    action: () => {
                      deleteAction(item);
                      handleAnimation();
                    },
                    icon: 'delete',
                  },
                ]
              : []),
          ]}
          top={1}
          left={1}
        />
      </Animated.View>

      {/* Main Comment Layout */}
      <XStack alignItems="flex-start" space="$3">
        {/* Profile Image */}
        <Avatar circular size="$5">
          <Avatar.Image
            accessibilityLabel={item.userId?.user_handle || 'User Avatar'}
            src={
              item.userId?.Profile_image
                ? item.userId.Profile_image.startsWith('https')
                  ? item.userId.Profile_image
                  : `${GET_STORAGE_DATA}/${item.userId.Profile_image}`
                : 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500'
            }
          />
          <Avatar.Fallback backgroundColor="#ccc" />
        </Avatar>

        {/* Comment Content */}
        <YStack flex={1} space="$1.5">
          <XStack alignItems="center" justifyContent="space-between">
            <XStack alignItems="center" space="$2">
              <Text fontWeight="700" color="$gray12" fontSize={18}>
                {item.userId.user_handle}
              </Text>
              {item.isEdited && (
                <Text color="$gray9" fontSize={15}>
                  (edited)
                </Text>
              )}
            </XStack>

            <TouchableOpacity onPress={handleAnimation}>
              <Entypo name="dots-three-vertical" size={18} color="#666" />
            </TouchableOpacity>
          </XStack>

          <Paragraph color="$gray11" fontSize={16}>
            {renderTextWithMentions(item.content)}
          </Paragraph>

          <Text color="$gray9" fontSize="$3">
            Last updated {formatWithOrdinal(item.updatedAt)}
          </Text>

          {/* Like & Actions */}
          <XStack alignItems="center" space="$2" marginTop="$2">
            {commentLikeLoading && isSelected ? (
              <ActivityIndicator size="small" color={PRIMARY_COLOR} />
            ) : (
              <TouchableOpacity
                onPress={() => {
                  width.value = withTiming(0, {duration: 250});
                  yValue.value = withTiming(100, {duration: 250});
                  setSelectedCommentId(item._id);
                  handleLikeAction(item);
                }}>
                {item.likedUsers.some(id => id === userId) ? (
                  <Fontisto name="heart" size={18} color={PRIMARY_COLOR} />
                ) : (
                  <FontAwesome name="heart-o" size={20} color={'#757575'} />
                )}
              </TouchableOpacity>
            )}
            <Text color="$gray10" fontSize="$4">
              {item.likedUsers.length}
            </Text>
          </XStack>
        </YStack>
      </XStack>
    </YStack>
  );
}
