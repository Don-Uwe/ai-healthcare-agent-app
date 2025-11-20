import {FC, useEffect, useMemo, useRef, useState} from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Pressable,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  TextInput,
  Keyboard,
  Platform,
} from 'react-native';
// eslint-disable-next-line import/no-duplicates
import {PodcastData, PodcastDiscussionProp, User, Comment} from '../type';
import {PRIMARY_COLOR} from '../helper/Theme';
//import io from 'socket.io-client';
import {useSelector} from 'react-redux';
import Loader from '../components/Loader';
import CommentItem from '../components/CommentItem';
import {useSocket} from '../../SocketContext';
import {
  useMentions,
  replaceTriggerValues,
  TriggersConfig,
  PatternsConfig,
  SuggestionsProvidedProps,
  parseValue,
} from 'react-native-controlled-mentions';
import {
  GET_IMAGE,
  GET_PODCAST_DETAILS,
  GET_STORAGE_DATA,
} from '../helper/APIUtils';
import {
  Button,
  H3,
  Paragraph,
  ScrollView,
  YStack,
  Text,
  View,
  Image,
} from 'tamagui';
import {SafeAreaView} from 'react-native-safe-area-context';
import {wp} from '../helper/Metric';
import {useQuery} from '@tanstack/react-query';
import axios from 'axios';

const PodcastDiscussion = ({navigation, route}: PodcastDiscussionProp) => {
  const socket = useSocket();
  const {podcastId, mentionedUsers} = route.params;
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const flatListRef = useRef<FlatList<Comment>>(null);
  const {user_id, user_token} = useSelector((state: any) => state.user);
  const [selectedCommentId, setSelectedCommentId] = useState<string>('');
  const [editMode, setEditMode] = useState<Boolean>(false);
  const [editCommentId, setEditCommentId] = useState<string | null>(null);
  const [commentLoading, setCommentLoading] = useState<Boolean>(false);
  const [commentLikeLoading, setCommentLikeLoading] = useState<Boolean>(false);
  const [mentions, setMentions] = useState<User[]>([]);

  const {data: podcast, refetch} = useQuery({
    queryKey: ['get-podcast-details'],
    queryFn: async () => {
      try {
        if (user_token === '') {
          throw new Error('No token found');
        }
        const response = await axios.get(
          `${GET_PODCAST_DETAILS}?podcast_id=${podcastId}`,
          {
            headers: {
              Authorization: `Bearer ${user_token}`,
            },
          },
        );
        return response.data as PodcastData;
      } catch (err) {
        console.error('Error fetching podcast:', err);
      }
    },
  });

  // mention triggers for v3
  // Create as constants outside component or memoize with useMemo
  const triggersConfig: TriggersConfig<'mention' | 'hashtag'> = {
    mention: {
      trigger: '@',
      textStyle: {fontWeight: 'bold', color: 'blue'},
    },
    hashtag: {
      trigger: '#',
      allowedSpacesCount: 0,
      textStyle: {fontWeight: 'bold', color: 'grey'},
    },
  };

  const patternsConfig: PatternsConfig = {
    url: {
      pattern:
        /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi,
      textStyle: {color: 'blue'},
    },
  };

  // useMentions hook for v3
  const {textInputProps, triggers} = useMentions({
    value: newComment,
    onChange: setNewComment,
    triggersConfig,
    patternsConfig,
  });

  const Suggestions: FC<SuggestionsProvidedProps & {suggestions: User[]}> = ({
    keyword,
    onSelect,
    suggestions,
  }) => {
    if (keyword == null) {
      return null;
    }

    return (
      <View>
        {suggestions
          .filter(one =>
            one.user_handle
              .toLocaleLowerCase()
              .includes(keyword.toLocaleLowerCase()),
          )
          .map(one => (
            <Pressable
              key={one._id}
              onPress={() => {
                onSelect({id: one._id, name: one.user_handle});
                setMentions(prev => [...prev, one]);
              }}
              style={{flex: 0, padding: 12, flexDirection: 'row'}}>
              {one.Profile_image ? (
                <Image
                  source={{
                    uri: one.Profile_image.startsWith('https')
                      ? one.Profile_image
                      : `${GET_STORAGE_DATA}/${one.Profile_image}`,
                  }}
                  style={[
                    styles.profileImage2,
                    !one.Profile_image && {
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
                    styles.profileImage2,
                    {borderWidth: 0.5, borderColor: 'black'},
                  ]}
                />
              )}

              <Text style={styles.username2}>{one.user_handle}</Text>
            </Pressable>
          ))}
      </View>
    );
  };

  const usedUserIds = useMemo(
    () =>
      parseValue(newComment, [triggersConfig.mention]).parts.reduce(
        (acc, part) => {
          if (part.data?.id) {
            acc.push(part.data.id);
          }
          return acc;
        },
        [] as string[],
      ),
    [newComment, triggersConfig.mention],
  );

  const filteredUsers = useMemo(
    () => mentionedUsers.filter(user => !usedUserIds.includes(user._id)),
    [mentionedUsers, usedUserIds],
  );

  // const renderSuggestions: FC<MentionSuggestionsProps> = ({
  //   keyword,
  //   onSuggestionPress,
  // }) => {
  //   if (keyword == null) {
  //     return null;
  //   }

  //   return (
  //     <View>
  //       {mentionedUsers
  //         .filter(
  //           one =>
  //             one.user_handle
  //               .toLocaleLowerCase()
  //               .includes(keyword.toLocaleLowerCase()) ||
  //             one.user_name
  //               .toLocaleLowerCase()
  //               .includes(keyword.toLocaleLowerCase()),
  //         )
  //         .map(one => (
  //           <Pressable
  //             key={one._id}
  //             onPress={() => {
  //               onSuggestionPress({id: one._id, name: one.user_handle});
  //               setMentions(prev => [...prev, one]);
  //             }}
  //             style={{flex: 0, padding: 12, flexDirection: 'row'}}>
  //             {one.Profile_image ? (
  //               <Image
  //                 source={{
  //                   uri: one.Profile_image.startsWith('https')
  //                     ? one.Profile_image
  //                     : `${GET_STORAGE_DATA}/${one.Profile_image}`,
  //                 }}
  //                 style={[
  //                   styles.profileImage2,
  //                   !one.Profile_image && {
  //                     borderWidth: 0.5,
  //                     borderColor: 'black',
  //                   },
  //                 ]}
  //               />
  //             ) : (
  //               <Image
  //                 source={{
  //                   uri: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
  //                 }}
  //                 style={[
  //                   styles.profileImage2,
  //                   {borderWidth: 0.5, borderColor: 'black'},
  //                 ]}
  //               />
  //             )}

  //             <Text style={styles.username2}>{one.user_handle}</Text>
  //           </Pressable>
  //         ))}
  //     </View>
  //   );
  // };

  useEffect(() => {
    //console.log('Fetching comments for articleId:', route.params.articleId);
    socket.emit('fetch-comments', {podcastId: route.params.podcastId});

    socket.on('connect', () => {
      console.log('connection established');
    });

    socket.on('comment-processing', (data: boolean) => {
      setCommentLoading(data);
    });

    socket.on('like-comment-processing', (data: boolean) => {
      setCommentLikeLoading(data);
    });

    socket.on('error', data => {
      console.log('connection error', data);
    });

    socket.on('fetch-comments', data => {
      console.log('comment loaded');
      if (data.podcastId === route.params.podcastId) {
        setComments(data.comments);
      }
    });

    // Listen for new comments
    socket.on('comment', data => {
      //console.log('new comment loaded', data);
      if (data.podcastId === route.params.podcastId) {
        setComments(prevComments => {
          const newComments = [data.comment, ...prevComments];
          if (flatListRef.current && newComments.length > 1) {
            flatListRef?.current.scrollToIndex({index: 0, animated: true});
          }

          return newComments;
        });
      }
    });

    // Listen for new replies
    socket.on('new-reply', data => {
      if (data.podcastId === route.params.podcastId) {
        setComments(prevComments => {
          return prevComments.map(comment =>
            comment._id === data.parentCommentId
              ? {...comment, replies: [...comment.replies, data.reply]}
              : comment,
          );
        });
      }
    });

    // Listen to edit comment updates (e.g., when replies are added)
    socket.on('edit-comment', data => {
      setComments(prevComments => {
        return prevComments.map(comment =>
          comment._id === data._id
            ? {...comment, ...data} // update the comment with new data
            : comment,
        );
      });
    });

    // Listen to like and dislike comment
    socket.on('like-comment', data => {
      setComments(prevComments => {
        return prevComments.map(comment =>
          comment._id === data._id ? {...comment, ...data} : comment,
        );
      });
    });

    socket.on('delete-comment', data => {
      setComments(prevComments =>
        prevComments.filter(comment => comment._id !== data.commentId),
      );

      //console.log('Comments Length', comments.length);
    });

    return () => {
      socket.off('fetch-comments');
      socket.off('comment');
      socket.off('new-reply');
      socket.off('edit-comment');
      socket.off('delete-comment');
      socket.off('like-comment');
    };
  }, [socket, route.params.podcastId]);

  const handleEditAction = (comment: Comment) => {
    setNewComment(comment.content);
    setEditMode(true);
    setEditCommentId(comment._id);
  };

  const handleMentionClick = (user_handle: string) => {
    //console.log('user handle', user_handle);
    //navigation.navigate('UserProfileScreen', {
    //  author_handle: user_handle.substring(1),
    //});
  };

  const handleDeleteAction = (comment: Comment) => {
    //commentId, articleId, userId
    Alert.alert(
      'Alert',
      'Are you sure you want to delete this comment.',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            socket.emit('delete-comment', {
              commentId: comment._id,
              podcastId: route.params.podcastId,
              userId: user_id,
            });
          },
        },
      ],
      {cancelable: false},
    );
  };

  const handleLikeAction = (comment: Comment) => {
    socket.emit('like-comment', {
      commentId: comment._id,
      podcastId: route.params.podcastId,
      userId: user_id,
    });
  };

  const handleCommentSubmit = () => {
    if (!newComment.trim()) {
      Alert.alert('Please enter a comment before submitting.');
      return;
    }

    if (editMode) {
      if (editCommentId) {
        console.log('Edit Comment Id', editCommentId);
        console.log('Edit Comment ', newComment);
        console.log('Podcast Id', route.params.podcastId);
        console.log('User Id', user_id);

        socket.emit('edit-comment', {
          commentId: editCommentId,
          content: newComment,
          podcastId: route.params.podcastId,
          userId: user_id,
        });

        setNewComment('');
        setEditCommentId(null);
        setEditMode(false);
      } else {
        Alert.alert('Error: Comment Not Found');
      }
    } else {
      const formatted = replaceTriggerValues(newComment, ({name}) => `@${name}`);
      const newCommentObj = {
        userId: user_id,
        podcastId: route.params.podcastId,
        content: formatted,
        parentCommentId: null,
        mentionedUsers: mentions,
      };

      console.log('Comment emitting', newCommentObj);
      // Emit the new comment to the backend via socket
      socket.emit('comment', newCommentObj);

      setNewComment('');
    }
  };

  const handleReportAction = (commentId: string, authorId: string) => {
    navigation.navigate('ReportScreen', {
      articleId: '',
      authorId: authorId,
      commentId: commentId,
      podcastId: podcastId,
    });
  };
  if (commentLoading) {
    return <Loader />;
  }

  return (
    <ScrollView
      style={{flex: 1}}
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: 120,
        paddingHorizontal: 10,
        backgroundColor: '#f8f9fb',
      }}
      showsVerticalScrollIndicator={false}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <SafeAreaView
            style={{flex: 1, backgroundColor: '#f8f9fb', padding: wp(0.2)}}>
            {/* Header Section */}
            <YStack space="$3">
              <H3 fontSize={19} color="black" fontWeight={'600'}>
                {podcast?.title}
              </H3>

              <Image
                source={{
                  uri: podcast?.cover_image.startsWith('http')
                    ? podcast?.cover_image
                    : `${GET_IMAGE}/${podcast?.cover_image}`,
                }}
                style={{
                  width: '100%',
                  height: 180,
                  borderRadius: 8,
                }}
              />

              <Button
                onPress={() =>
                  navigation.navigate('PodcastDetail', {
                    trackId: podcastId,
                    audioUrl: podcast?.audio_url ?? '',
                  })
                }
                backgroundColor={PRIMARY_COLOR}
                pressStyle={{opacity: 0.9}}
                borderRadius="$4"
                size={'$6'}
                marginTop="$2"
                paddingVertical={'$3'}
                elevation="$2">
                <Text color="white" fontWeight="600" fontSize={16}>
                  View Full Podcast Details
                </Text>
              </Button>
              <Paragraph color="$gray10" fontSize={17}>
                {podcast?.description}
              </Paragraph>

              <Suggestions suggestions={filteredUsers} {...triggers.mention} />

              <TextInput
                {...textInputProps}
                style={styles.textInput}
                placeholder="Add a comment..."
                multiline
              />

              {newComment.length > 0 && (
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleCommentSubmit}>
                  <Text style={styles.submitButtonText}>
                    {editMode ? '✏️ Update Comment' : '⏩ Submit Comment'}
                  </Text>
                </TouchableOpacity>
              )}
              <YStack marginTop="$4" space="$3">
                <Text fontWeight="600" fontSize={20}>
                  {comments.length} Comments
                </Text>

                {comments.map(item => (
                  <CommentItem
                    key={item._id}
                    item={item}
                    isSelected={selectedCommentId === item._id}
                    userId={user_id}
                    setSelectedCommentId={setSelectedCommentId}
                    handleEditAction={handleEditAction}
                    deleteAction={handleDeleteAction}
                    handleLikeAction={handleLikeAction}
                    commentLikeLoading={commentLikeLoading}
                    handleMentionClick={handleMentionClick}
                    handleReportAction={handleReportAction}
                    isFromArticle={false}
                  />
                ))}
              </YStack>
            </YStack>
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#FFFFFF',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  commentsList: {
    flex: 1,
    marginBottom: 20,
  },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
  },
  avatar: {
    fontSize: 30,
    marginRight: 10,
    alignSelf: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginEnd: 4, // Small gap between user handle and content
  },
  profileImage: {
    height: 60,
    width: 60,
    borderRadius: 30,
    objectFit: 'cover',
    resizeMode: 'contain',
    marginHorizontal: 4,
  },

  profileImage2: {
    height: 30,
    width: 30,
    borderRadius: 15,
    objectFit: 'cover',
    resizeMode: 'contain',
    marginHorizontal: 4,
  },
  commentContent: {
    flex: 1,
  },
  username2: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    alignSelf: 'center',
  },
  comment: {
    fontSize: 14,
    color: '#555',
    marginVertical: 5,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
  },
  replyContainer: {
    marginLeft: 20,
    marginTop: 10,
  },
  replyText: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
  },
  textInput: {
    height: 100,
    borderColor: '#ccc',
    fontSize: wp(5),
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: PRIMARY_COLOR,
    padding: 15,
    marginTop: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default PodcastDiscussion;
