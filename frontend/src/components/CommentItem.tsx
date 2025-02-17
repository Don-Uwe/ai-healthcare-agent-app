import React from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {Comment} from '../type';
import {GET_STORAGE_DATA} from '../helper/APIUtils';
import moment from 'moment';

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import ArticleFloatingMenu from './ArticleFloatingMenu';
import Entypo from 'react-native-vector-icons/Entypo';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {PRIMARY_COLOR} from '../helper/Theme';

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
}: {
  item: Comment;
  isSelected: Boolean;
  userId: string;
  setSelectedCommentId: (id: string) => void;
  handleEditAction: (comment: Comment) => void;
  deleteAction: (comment: Comment) => void;
  handleLikeAction: (comment: Comment) => void;
  commentLikeLoading: Boolean;
  handleMentionClick: (user_handle: string) => void; // on mention user handle click view profile
  handleReportAction: (commentId: string, authorId: string) => void;
}) {
  const width = useSharedValue(0);
  const yValue = useSharedValue(60);

  const menuStyle = useAnimatedStyle(() => {
    return {
      width: width.value,
      transform: [{translateY: yValue.value}],
    };
  });

  const handleAnimation = () => {
    if (width.value === 0) {
      width.value = withTiming(300, {duration: 300});
      yValue.value = withTiming(-1, {duration: 300});
      setSelectedCommentId(item._id);
    } else {
      width.value = withTiming(0, {duration: 300});
      yValue.value = withTiming(100, {duration: 300});
      setSelectedCommentId('');
    }
  };

  const formatWithOrdinal = date => {
    return moment(date).format('D MMM, ddd, h:mm a');
  };

  // Function to render mentions and normal text in the same line
  const renderTextWithMentions = (text: string) => {
    const regex = /(@\w+)/g; // Match mentions starting with '@'
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (part.match(regex)) {
        // If it's a mention, style it differently

        return (
          <TouchableOpacity
            key={index}
            onPress={() => {
              handleMentionClick(part);
            }}>
            <Text key={index} style={styles.mention}>
              {part}
            </Text>
          </TouchableOpacity>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  };

  return (
    <View style={styles.commentContainer}>
      {userId === item.userId._id && isSelected && (
        <Animated.View style={[menuStyle, styles.shareIconContainer]}>
          <ArticleFloatingMenu
            items={[
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
              {
                name: 'Report',
                action: () => {
                  handleReportAction(item._id, item.userId._id);
                  handleAnimation();
                },
                icon: 'infocirlce',
              },
            ]}
          />
        </Animated.View>
      )}

      {userId === item.userId._id && (
        <TouchableOpacity
          style={styles.shareIconContainer}
          onPress={() => handleAnimation()}>
          <Entypo name="dots-three-vertical" size={20} color={'black'} />
        </TouchableOpacity>
      )}
      {item.userId && item.userId.Profile_image ? (
        <Image
          source={{
            uri: item.userId.Profile_image.startsWith('https')
              ? item.userId.Profile_image
              : `${GET_STORAGE_DATA}/${item.userId.Profile_image}`,
          }}
          style={[
            styles.profileImage,
            !item.userId.Profile_image && {
              borderWidth: 0.5,
              borderColor: 'black',
            },
          ]}
        />
      ) : (
        <Image
          source={{
            uri: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
          }}
          style={[
            styles.profileImage,
            {borderWidth: 0.5, borderColor: 'black'},
          ]}
        />
      )}

      <View style={styles.commentContent}>
        <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
          <Text style={styles.username}>{item.userId.user_handle}</Text>
          {item.isEdited && (
            <Text style={{...styles.comment, marginStart: 4, marginTop: 2}}>
              (edited)
            </Text>
          )}
        </View>

        <Text style={styles.comment}>
          {renderTextWithMentions(item.content)}
        </Text>
        <Text style={styles.timestamp}>
          Last updated {formatWithOrdinal(item.updatedAt)}
        </Text>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            padding: 2,
          }}>
          {commentLikeLoading && isSelected ? (
            <ActivityIndicator size="small" color={PRIMARY_COLOR} />
          ) : (
            <TouchableOpacity
              onPress={() => {
                width.value = withTiming(0, {duration: 300});
                yValue.value = withTiming(100, {duration: 300});
                setSelectedCommentId(item._id);
                handleLikeAction(item);
              }}>
              {item.likedUsers.length > 0 &&
              item.likedUsers.some(id => id === userId) ? (
                <AntDesign name="like1" size={19} color={'black'} />
              ) : (
                <AntDesign name="like2" size={19} color={'black'} />
              )}
            </TouchableOpacity>
          )}
          <Text style={styles.likeCount}>{item.likedUsers.length}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
    marginTop: 5, // Reduced top margin
  },
  profileImage: {
    height: 50,
    width: 50,
    borderRadius: 30,
    objectFit: 'cover',
    resizeMode: 'contain',
    marginHorizontal: 6,
  },
  commentContent: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginEnd: 4, // Small gap between user handle and content
  },
  comment: {
    fontSize: 15,
    color: '#555',
    marginVertical: 0, // Remove vertical margin for no extra space
  },
  likeCount: {
    fontSize: 14,
    color: '#666',
    marginStart: 3,
    marginVertical: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
  },
  mention: {
    color: 'blue', // Mention text color
    fontWeight: 'bold',
    paddingTop: 4,
  },
  shareIconContainer: {
    position: 'absolute',
    top: 1,
    right: 7,
    zIndex: 1,
  },
});
