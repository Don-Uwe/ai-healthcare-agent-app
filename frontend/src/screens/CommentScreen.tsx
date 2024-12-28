import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import {CommentScreenProp} from '../type';
import {PRIMARY_COLOR} from '../helper/Theme';
import io from 'socket.io-client';
import {Comment} from '../type';
import {useSelector} from 'react-redux';
import Loader from '../components/Loader';
import CommentItem from '../components/CommentItem';

const CommentScreen = ({navigation, route}: CommentScreenProp) => {
  const socket = io('http://51.20.1.81:8084');
  //const socket = useSocket();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const flatListRef = useRef<FlatList<Comment>>(null);
  const {user_id} = useSelector((state: any) => state.user);
  const [selectedCommentId, setSelectedCommentId] = useState<string>('');
  const [editMode, setEditMode] = useState<Boolean>(false);
  const [editCommentId, setEditCommentId] = useState<string | null>(null);
  const [commentLoading, setCommentLoading] = useState<Boolean>(false);
  const [commentLikeLoading, setCommentLikeLoading] = useState<Boolean>(false);

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

    socket.on('error', () => {
      console.log('connection error');
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
          if (flatListRef.current) {
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
      setComments(prevComments =>
        prevComments.filter(comment => comment.id !== data.commentId),
      );
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
        content: newComment,
        parentCommentId: null,
      };

      console.log('Comment emitting', newCommentObj);
      // Emit the new comment to the backend via socket
      socket.emit('comment', newCommentObj);

      setNewComment(''); // Clear the input field after submitting
    }
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
          />
        )}
        keyExtractor={item => item._id}
        style={styles.commentsList}
      />

      {/* New Comment Input */}
      <TextInput
        style={styles.textInput}
        placeholder="Add a comment..."
        multiline
        value={newComment}
        onChangeText={setNewComment}
      />

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

  profileImage: {
    height: 60,
    width: 60,
    borderRadius: 30,
    objectFit: 'cover',
    resizeMode: 'contain',
    marginHorizontal: 4,
  },
  commentContent: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
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
