import React, {FC, useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Pressable,
  TextInput,
} from 'react-native';

import {YStack, H3, Paragraph, Image, Text} from 'tamagui';
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
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';

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
      authorId: undefined
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
      // dispatch(
      //   showAlert({
      //     title: 'Alert!',
      //     message: 'Please enter a comment before submitting.',
      //   }),
      // );
      Alert.alert('Please enter a comment before submitting.');

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
      <View style={styles.suggestionsContainer}>
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
              style={styles.suggestionItem}>
              {one.Profile_image ? (
                <Image
                  source={{
                    uri: one.Profile_image.startsWith('https')
                      ? one.Profile_image
                      : `${GET_STORAGE_DATA}/${one.Profile_image}`,
                  }}
                  style={styles.profileImage2}
                />
              ) : (
                <Image
                  source={{
                    uri: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
                  }}
                  style={styles.profileImage2}
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
    <KeyboardAwareScrollView
      style={styles.scrollView}
      bottomOffset={50}
      showsVerticalScrollIndicator={false}
      extraKeyboardSpace={20}
      contentContainerStyle={styles.scrollContent}>
      <SafeAreaView style={styles.safeArea}>
        <YStack gap="$3">
          {/* Article Title Card */}
          <View style={styles.articleTitleCard}>
            <H3 fontSize={20} color="#1F2937" fontWeight={'700'}>
              {article.title}
            </H3>
          </View>

          {/* Article Image */}
          <View style={styles.imageContainer}>
            <Image
              source={{
                uri: article?.imageUtils[0].startsWith('http')
                  ? article?.imageUtils[0]
                  : `${GET_IMAGE}/${article?.imageUtils[0]}`,
              }}
              style={styles.articleImage}
            />
          </View>

          {/* View Article Button */}
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ArticleScreen', {
                articleId: Number(article._id),
                authorId: article.authorId.toString(),
                recordId: article.pb_recordId,
              })
            }
            style={styles.viewArticleButton}
            activeOpacity={0.8}>
            <Text style={styles.viewArticleText}>
              View Full Article
            </Text>
          </TouchableOpacity>

          {/* Article Description */}
          <View style={styles.descriptionCard}>
            <Paragraph color="#4B5563" fontSize={15} lineHeight={22}>
              {article.description}
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
                handleMentionClick={handleMentionClick}
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
  articleTitleCard: {
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
  articleImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  viewArticleButton: {
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
  viewArticleText: {
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
  suggestionsContainer: {
    maxHeight: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  suggestionItem: {
    flex: 0,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  profileImage2: {
    height: 36,
    width: 36,
    borderRadius: 18,
    resizeMode: 'cover',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  username2: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  textInput: {
    minHeight: 100,
    fontSize: 15,
    borderRadius: 12,
    padding: 16,
    textAlignVertical: 'top',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    color: '#1F2937',
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: PRIMARY_COLOR,
    padding: 16,
    marginTop: 8,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: PRIMARY_COLOR,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  submitButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
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
});

export default CommentScreen;
