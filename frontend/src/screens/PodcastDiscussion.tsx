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
import {useDispatch, useSelector} from 'react-redux';
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
  H3,
  Paragraph,
  YStack,
  Text,
  View,
  Image,
} from 'tamagui';
import {SafeAreaView} from 'react-native-safe-area-context';
import {wp} from '../helper/Metric';
import {useQuery} from '@tanstack/react-query';
import axios from 'axios';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';

const PodcastDiscussion = ({navigation, route}: PodcastDiscussionProp) => {
  const socket = useSocket();
  const dispatch = useDispatch();
  const {podcastId, mentionedUsers} = route.params;
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const flatListRef = useRef<FlatList<Comment>>(null);
  const {user_id, user_token} = useSelector((state: any) => state.user);
  const [selectedCommentId, setSelectedCommentId] = useState<string>('');
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editCommentId, setEditCommentId] = useState<string | null>(null);
  const [commentLoading, setCommentLoading] = useState<boolean>(false);
  const [commentLikeLoading, setCommentLikeLoading] = useState<boolean>(false);
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
      // dispatch(
      //   showAlert({
      //     title: '',
      //     message: 'Please enter a comment before submitting.',
      //   }),
      // );
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
      const formatted = replaceTriggerValues(
        newComment,
        ({name}) => `@${name}`,
      );
      const newCommentObj = {
        userId: user_id,
        podcastId: route.params.podcastId,
        content: formatted,
        parentCommentId: null,
        mentionedUsers: mentions,
      };

     // console.log('Comment emitting', newCommentObj);
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
    <KeyboardAwareScrollView
      style={styles.scrollView}
      bottomOffset={50}
      showsVerticalScrollIndicator={false}
      extraKeyboardSpace={20}
      contentContainerStyle={styles.scrollContent}>
      <SafeAreaView style={styles.safeArea}>
        <YStack gap="$3">
          {/* Article Title Card */}
          <View style={styles.podcastTitleCard}>
            <H3 fontSize={20} color="#1F2937" fontWeight={'700'}>
              {podcast?.title}
            </H3>
          </View>

          {/* Article Image */}
          <View style={styles.imageContainer}>
            <Image
              source={{
                uri: podcast?.cover_image.startsWith('http')
                  ? podcast?.cover_image
                  : `${GET_IMAGE}/${podcast?.cover_image}`,
              }}
              style={styles.podcastImage}
            />
          </View>

          {/* View Article Button */}
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('PodcastDetail', {
                trackId: podcastId,
                audioUrl: podcast?.audio_url ?? '',
              })
            }
            style={styles.viewPodcastButton}
            activeOpacity={0.8}>
            <Text style={styles.viewPodcastText}> 🎧 Listen Now</Text>
          </TouchableOpacity>

          {/* Article Description */}
          <View style={styles.descriptionCard}>
            <Paragraph color="#4B5563" fontSize={15} lineHeight={22}>
              {podcast?.description}
            </Paragraph>
          </View>

          {/* Mention Suggestions */}
          <Suggestions suggestions={filteredUsers} {...triggers.mention} />

          {/* Comment Input */}
          <TextInput
            {...textInputProps}
            style={styles.textInput}
            placeholder="Add a comment..."
            placeholderTextColor="#9CA3AF"
            multiline
          />

          {/* Submit Button */}
          {newComment.length > 0 && (
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleCommentSubmit}
              activeOpacity={0.8}>
              <Text style={styles.submitButtonText}>
                {editMode ? 'Update Comment' : 'Submit Comment'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Comments Section Header */}
          <View style={styles.commentsHeader}>
            <Text style={styles.commentsHeaderText}>
              {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
            </Text>
          </View>

          {/* Comments List */}
          <YStack marginTop="$2" gap="$3">
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
                handleMentionClick={()=>{

                }}
                handleReportAction={handleReportAction}
                isFromArticle={false}
              />
            ))}
          </YStack>
        </YStack>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
 
};

const styles = StyleSheet.create({
  scrollView: {
    width: '100%',
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120,
    paddingHorizontal: 16,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  podcastTitleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  imageContainer: {
    position: 'relative',
  },
  podcastImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },

  viewPodcastButton: {
    backgroundColor: PRIMARY_COLOR,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: PRIMARY_COLOR,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  viewPodcastText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  descriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  commentsHeader: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    marginTop: 8,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY_COLOR,
  },
  commentsHeaderText: {
    fontWeight: '700',
    fontSize: 18,
    color: '#1F2937',
  },
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

  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginVertical: 10,
  },
  authorImage: {
    height: 45,
    width: 45,
    borderRadius: 45,
  },
  authorName: {
    fontWeight: '700',
    fontSize: 15,
  },
  authorFollowers: {
    fontWeight: '400',
    fontSize: 13,
  },
  followButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 12,
    borderRadius: 20,
    paddingVertical: 8,
  },
  followButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
