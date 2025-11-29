import React, {FC, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';

import {YStack, H3, Paragraph, Button, Image, Text} from 'tamagui';
import {CommentScreenProp, User, Comment} from '../type';
import {PRIMARY_COLOR} from '../helper/Theme';
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
import {GET_IMAGE, GET_STORAGE_DATA} from '../helper/APIUtils';
import {SafeAreaView} from 'react-native-safe-area-context';
import {wp} from '../helper/Metric';
import {showAlert} from '../store/alertSlice';

const CommentScreen = ({navigation, route}: CommentScreenProp) => {
  const socket = useSocket();
  const {articleId, mentionedUsers, article} = route.params;
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const flatListRef = useRef<FlatList<Comment>>(null);
  const {user_id} = useSelector((state: any) => state.user);
  const [selectedCommentId, setSelectedCommentId] = useState<string>('');
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editCommentId, setEditCommentId] = useState<string | null>(null);
  const [commentLoading, setCommentLoading] = useState<boolean>(false);
  const [commentLikeLoading, setCommentLikeLoading] = useState<boolean>(false);
  const [mentions, setMentions] = useState<User[]>([]);
  const dispatch = useDispatch();

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

  useEffect(() => {
    socket.emit('fetch-comments', {articleId: route.params.articleId});

    socket.on('connect', () => console.log('connection established'));
    // socket.on('comment-processing', (data: boolean) => setCommentLoading(data));
    socket.on('like-comment-processing', (data: boolean) =>
      setCommentLikeLoading(data),
    );
    socket.on('error', data => console.log('connection error', data));

    socket.on('fetch-comments', data => {
      if (data.articleId === route.params.articleId) {
        setComments(data.comments);
      }
    });

    socket.on('comment', data => {
      if (data.articleId === route.params.articleId) {
        setComments(prev => {
          const newList = [data.comment, ...prev];
          if (flatListRef.current && newList.length > 1) {
            flatListRef.current.scrollToIndex({index: 0, animated: true});
          }
          return newList;
        });
      }
    });

    socket.on('new-reply', data => {
      if (data.articleId === route.params.articleId) {
        setComments(prev =>
          prev.map(comment =>
            comment._id === data.parentCommentId
              ? {...comment, replies: [...comment.replies, data.reply]}
              : comment,
          ),
        );
      }
    });

    socket.on('edit-comment', data => {
      setComments(prev =>
        prev.map(comment =>
          comment._id === data._id ? {...comment, ...data} : comment,
        ),
      );
    });

    socket.on('like-comment', data => {
      setComments(prev =>
        prev.map(comment =>
          comment._id === data._id ? {...comment, ...data} : comment,
        ),
      );
    });

    socket.on('delete-comment', data => {
      setComments(prev => prev.filter(c => c._id !== data.commentId));
    });

    return () => {
      socket.off('fetch-comments');
      socket.off('comment');
      socket.off('new-reply');
      socket.off('edit-comment');
      socket.off('delete-comment');
      socket.off('like-comment');
    };
  }, [socket, route.params.articleId]);

  const handleEditAction = (comment: Comment) => {
    setNewComment(comment.content);
    setEditMode(true);
    setEditCommentId(comment._id);
  };

  const handleMentionClick = (user_handle: string) => {
    navigation.navigate('UserProfileScreen', {
      author_handle: user_handle.substring(1),
    });
  };

  const handleDeleteAction = (comment: Comment) => {
    Alert.alert(
      'Alert',
      'Are you sure you want to delete this comment?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'OK',
          onPress: () =>
            socket.emit('delete-comment', {
              commentId: comment._id,
              articleId: route.params.articleId,
              userId: user_id,
            }),
        },
      ],
      {cancelable: false},
    );
  };

  const handleLikeAction = (comment: Comment) => {
    socket.emit('like-comment', {
      commentId: comment._id,
      articleId: route.params.articleId,
      userId: user_id,
    });
  };

  const handleCommentSubmit = () => {
    if (!newComment.trim()) {
      dispatch(
        showAlert({
          title: 'Alert!',
          message: 'Please enter a comment before submitting.',
        }),
      );
      // Alert.alert('Please enter a comment before submitting.');
      
      return;
    }

    const formatted = replaceTriggerValues(newComment, ({name}) => `@${name}`);

    if (editMode && editCommentId) {
      socket.emit('edit-comment', {
        commentId: editCommentId,
        content: formatted,
        articleId: route.params.articleId,
        userId: user_id,
      });
      setEditMode(false);
      setEditCommentId(null);
    } else {
      const newCommentObj = {
        userId: user_id,
        articleId: route.params.articleId,
        content: formatted,
        parentCommentId: null,
        mentionedUsers: mentions,
      };
      socket.emit('comment', newCommentObj);
    }
    setNewComment('');
  };

  const handleReportAction = (commentId: string, authorId: string) => {
    navigation.navigate('ReportScreen', {
      articleId: articleId.toString(),
      authorId,
      commentId,
      podcastId: null,
    });
  };

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

  if (commentLoading) return <Loader />;

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
                {article.title}
              </H3>

              <Image
                source={{
                  uri: article?.imageUtils[0].startsWith('http')
                    ? article?.imageUtils[0]
                    : `${GET_IMAGE}/${article?.imageUtils[0]}`,
                }}
                style={{
                  width: '100%',
                  height: 180,
                  borderRadius: 8,
                }}
              />

              <Button
                onPress={() =>
                  navigation.navigate('ArticleScreen', {
                    articleId: Number(article._id),
                    authorId: article.authorId.toString(),
                    recordId: article.pb_recordId,
                  })
                }
                backgroundColor={PRIMARY_COLOR}
                pressStyle={{opacity: 0.9}}
                borderRadius="$4"
                size={'$6'}
                mt="$2"
                paddingVertical={'$3'}
                elevation="$2">
                <Text color="white" fontWeight="600" fontSize={16}>
                  View Full Article
                </Text>
              </Button>
              <Paragraph color="$gray10" fontSize={17}>
                {article.description}
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
  container: {flex: 1, padding: 10, backgroundColor: '"#f8f9fb"'},
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 30,
  },
  commentsList: {flex: 1, marginBottom: 20},
  profileImage2: {
    height: 30,
    width: 30,
    borderRadius: 15,
    resizeMode: 'cover',
    marginRight: 8,
  },
  username2: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
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
    marginTop: wp(1),
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {fontSize: 18, color: '#fff', fontWeight: 'bold'},
});

export default CommentScreen;
