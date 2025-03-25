import React, {FC, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Pressable,
} from 'react-native';
import {CommentScreenProp, User} from '../type';
import {PRIMARY_COLOR} from '../helper/Theme';
//import io from 'socket.io-client';
import {Comment} from '../type';
import {useSelector} from 'react-redux';
import Loader from '../components/Loader';
import CommentItem from '../components/CommentItem';
import {useSocket} from '../../SocketContext';
import {
  MentionInput,
  MentionSuggestionsProps,
  replaceMentionValues,
} from 'react-native-controlled-mentions';
import {GET_STORAGE_DATA} from '../helper/APIUtils';

const CommentScreen = ({navigation, route}: CommentScreenProp) => {
  //const socket = io('http://51.20.1.81:8084');
  const socket = useSocket();
  const {articleId, mentionedUsers} = route.params;
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const flatListRef = useRef<FlatList<Comment>>(null);
  const {user_id} = useSelector((state: any) => state.user);
  const [selectedCommentId, setSelectedCommentId] = useState<string>('');
  const [editMode, setEditMode] = useState<Boolean>(false);
  const [editCommentId, setEditCommentId] = useState<string | null>(null);
  const [commentLoading, setCommentLoading] = useState<Boolean>(false);
  const [commentLikeLoading, setCommentLikeLoading] = useState<Boolean>(false);
  const [mentions, setMentions] = useState<User[]>([]);

  //console.log('Mentioned users', mentionedUsers);
  const renderSuggestions: FC<MentionSuggestionsProps> = ({
    keyword,
    onSuggestionPress,
  }) => {
    if (keyword == null) {
      return null;
    }

    return (
      <View>
        {mentionedUsers
          .filter(
            one =>
              one.user_handle
                .toLocaleLowerCase()
                .includes(keyword.toLocaleLowerCase()) ||
              one.user_name
                .toLocaleLowerCase()
                .includes(keyword.toLocaleLowerCase()),
          )
          .map(one => (
            <Pressable
              key={one._id}
              onPress={() => {
                onSuggestionPress({id: one._id, name: one.user_handle});
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
  useEffect(() => {
    //console.log('Fetching comments for articleId:', route.params.articleId);
    socket.emit('fetch-comments', {articleId: route.params.articleId});

    socket.on('connect', () => {
      console.log('connection established');
    });

    socket.on('comment-processing', (data: boolean) => {
      setCommentLoading(data);
    });

    socket.on('like-comment-processing', (data: boolean) => {
      setCommentLikeLoading(data);
    });

    socket.on('error', (data) => {
      console.log('connection error', data);
    });

    socket.on('fetch-comments', data => {
      console.log('comment loaded');
      if (data.articleId === route.params.articleId) {
        setComments(data.comments);
      }
    });

    // Listen for new comments
    socket.on('comment', data => {
      console.log('new comment loaded', data);
      if (data.articleId === route.params.articleId) {
        setComments(prevComments => {
          const newComments = [data.comment, ...prevComments];
          // Scroll to the first index after adding the new comment
          if (flatListRef.current && newComments.length > 1) {
            flatListRef?.current.scrollToIndex({index: 0, animated: true});
          }

          return newComments;
        });
      }
    });

    // Listen for new replies
    socket.on('new-reply', data => {
      if (data.articleId === route.params.articleId) {
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
      //console.log('Delete Comment Data', data);

      //console.log('Comments Length before', comments.length);
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
  }, [socket, route.params.articleId]);

  const handleEditAction = (comment: Comment) => {
    setNewComment(comment.content);
    setEditMode(true);
    setEditCommentId(comment._id);
  };

  const handleMentionClick = (user_handle: string) => {
    //console.log('user handle', user_handle);
    navigation.navigate('UserProfileScreen', {
      author_handle: user_handle.substring(1),
    });
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
              articleId: route.params.articleId,
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
      articleId: route.params.articleId,
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
        console.log('Article Id', route.params.articleId);
        console.log('User Id', user_id);

        socket.emit('edit-comment', {
          commentId: editCommentId,
          content: newComment,
          articleId: route.params.articleId,
          userId: user_id,
        });

        setNewComment('');
        setEditCommentId(null);
        setEditMode(false);
      } else {
        Alert.alert('Error: Comment Not Found');
      }
    } else {
      const newCommentObj = {
        userId: user_id,
        articleId: route.params.articleId,
        content: replaceMentionValues(newComment, ({name}) => `@${name}`),
        parentCommentId: null,
        mentionedUsers: mentions,
      };

      console.log('Comment emitting', newCommentObj);
      // Emit the new comment to the backend via socket
      socket.emit('comment', newCommentObj);

      setNewComment(''); // Clear the input field after submitting
    }
  };

  const handleReportAction = (commentId: string, authorId: string) => {
    navigation.navigate('ReportScreen', {
      articleId: articleId.toString(),
      authorId: authorId,
      commentId: commentId,
    });
  };
  if (commentLoading) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>💬 Leave a Feedback</Text>

      {/* Comments List */}
      <FlatList
        ref={flatListRef}
        data={comments}
        renderItem={({item}) => (
          <CommentItem
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
          />
        )}
        keyExtractor={item => item._id}
        style={styles.commentsList}
      />

      <MentionInput
        value={newComment}
        onChange={setNewComment}
        style={styles.textInput}
        placeholder="Add a comment..."
        partTypes={[
          {
            trigger: '@', // Should be a single character like '@' or '#'
            renderSuggestions,
            textStyle: {fontWeight: 'bold', color: 'blue'}, // The mention style in the input
          },
        ]}
      />
      {/* New Comment Input */}

      {/* Submit Button */}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleCommentSubmit}>
        <Text style={styles.submitButtonText}>⏩ Submit Comment</Text>
      </TouchableOpacity>
    </View>
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

export default CommentScreen;

