import React, {useState} from 'react';
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
import { PRIMARY_COLOR } from '../helper/Theme';

const CommentScreen = ({navigation, route}: CommentScreenProp) => {
  // State to store the list of comments
  const [comments, setComments] = useState([
    {
      id: '1',
      username: 'Alice',
      avatar: '👩‍💻',
      comment: 'Love this piece! Very inspiring!',
      timestamp: '2 hours ago',
    },
    {
      id: '2',
      username: 'Bob',
      avatar: '👨‍🎨',
      comment: 'Amazing work, keep it up!',
      timestamp: '4 hours ago',
    },
    {
      id: '3',
      username: 'Charlie',
      avatar: '👩‍🎤',
      comment: 'I could feel the emotion in your words!',
      timestamp: '1 day ago',
    },
  ]);

  const [newComment, setNewComment] = useState('');

  const handleCommentSubmit = () => {
    if (!newComment.trim()) {
      Alert.alert('Please enter a comment before submitting.');
      return;
    }

    const newCommentObj = {
      id: (comments.length + 1).toString(),
      username: 'You', // Can be dynamically set based on the user
      avatar: '🧑‍💻', // Placeholder avatar
      comment: newComment,
      timestamp: 'Just now', // This can be dynamically generated with a timestamp function
    };

    // Add the new comment to the state
    setComments([newCommentObj, ...comments]);
    setNewComment(''); // Clear the input field after submitting
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>💬 Leave a Feedback</Text>

      {/* Comments List */}
      <FlatList
        data={comments}
        renderItem={({item}) => (
          <View style={styles.commentContainer}>
            <Text style={styles.avatar}>{item.avatar}</Text>
            <View style={styles.commentContent}>
              <Text style={styles.username}>{item.username}</Text>
              <Text style={styles.comment}>{item.comment}</Text>
              <Text style={styles.timestamp}>{item.timestamp}</Text>
            </View>
          </View>
        )}
        keyExtractor={item => item.id}
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
    padding: 20,
    backgroundColor: '#F9F9F9',
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
