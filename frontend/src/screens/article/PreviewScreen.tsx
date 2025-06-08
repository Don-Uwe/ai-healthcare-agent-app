import React, {useRef, useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {WebView} from 'react-native-webview';
import {PRIMARY_COLOR} from '../../helper/Theme';
import {
  ArticleData,
  ContentSuggestionResponse,
  PocketBaseResponse,
  PreviewScreenProp,
  User,
} from '../../type';
import {createHTMLStructure} from '../../helper/Utils';
import {useMutation, useQuery} from '@tanstack/react-query';
import ImageResizer from '@bam.tech/react-native-image-resizer';

import axios from 'axios';
import Loader from '../../components/Loader';
import {
  GET_IMAGE,
  GET_PROFILE_API,
  POST_ARTICLE,
  RENDER_SUGGESTION,
  SUBMIT_IMPROVEMENT,
  SUBMIT_SUGGESTED_CHANGES,
  UPLOAD_ARTICLE_TO_POCKETBASE,
  UPLOAD_IMPROVEMENT_TO_POCKETBASE,
} from '../../helper/APIUtils';
import {useDispatch, useSelector} from 'react-redux';
import useUploadImage from '../../../hooks/useUploadImage';
import {setSuggestion} from '../../store/articleSlice';
import Snackbar from 'react-native-snackbar';

//import io from 'socket.io-client';

export default function PreviewScreen({navigation, route}: PreviewScreenProp) {
  const {
    article,
    title,
    description,
    authorName,
    selectedGenres,
    localImages,
    articleData,
    requestId,
    pb_record_id,
  } = route.params;

  //const socket = io('http://51.20.1.81:8084');
  const [imageUtil, setImageUtil] = useState<string>('');

  const webViewRef = useRef<WebView>(null);
  const {user_token, user_id} = useSelector((state: any) => state.user);
  const {suggestion, suggestionAccepted} = useSelector(
    (state: any) => state.article,
  );
  const dispatch = useDispatch();

  const {uploadImage, loading} = useUploadImage();
  // console.log(selectedGenres);

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            //createPostMutation.mutate();
            handlePostSubmit();
          }}>
          <Text style={styles.textWhite}>Post</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const {data: user} = useQuery({
    queryKey: ['userInfo'],
    queryFn: async () => {
      const response = await axios.get(GET_PROFILE_API, {
        headers: {
          Authorization: `Bearer ${user_token}`,
        },
      });
      //console.log('User Profile', response.headers);
      // console.log('Respon)
      return response.data.profile as User;
    },
  });

  const handlePostSubmit = async () => {
    let finalArticle =
      suggestionAccepted && suggestion !== '' ? suggestion : article;
    let imageUtil = '';

    // Resize and confirm for all images before uploading
    try {
      // Show confirmation alert
      const confirmation = await showConfirmationAlert();
      if (!confirmation) {
        Alert.alert('Post discarded');
        navigation.navigate('TabNavigation');
        return;
      }

      // Process each local image
      for (let i = 0; i < localImages.length; i++) {
        const localImage = localImages[i];

        let uploadedUrl: string | undefined;

        if (localImage.includes('api/getfile')) {
          uploadedUrl = localImage;
        } else {
          // Resize the image and handle the upload
          const resizedImageUri = await resizeImage(localImage);

          uploadedUrl = await uploadImage(resizedImageUri?.uri);
        }

        if (i === 0 && imageUtil.length === 0) {
          imageUtil = uploadedUrl?.includes('api/getfile')
            ? uploadedUrl
            : `${GET_IMAGE}/${uploadedUrl}`;
        } else {
          finalArticle = finalArticle.replace(
            localImage,
            `${GET_IMAGE}/${uploadedUrl}`,
          );
        }
      }

      // Submit Improvement
      if (requestId) {
        uploadImprovementToPocketbase.mutate({
          htmlContent: finalArticle,
        });
      }
      // Submit changes or create a new post
      else {
        // Submit new article
        setImageUtil(imageUtil);
        uploadArticleToPocketbase.mutate({
          htmlContent: finalArticle,
        });
      }
    } catch (err) {
      console.error('Image processing failed:', err);
      Alert.alert('Error', 'Could not process the images.');
    }
  };

  // Helper function to show confirmation alert
  const showConfirmationAlert = () => {
    return new Promise(resolve => {
      Alert.alert(
        'Create Post',
        'Please confirm you want to upload this post.',
        [
          {
            text: 'Cancel',
            onPress: () => resolve(false),
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: () => resolve(true),
          },
        ],
        {cancelable: false},
      );
    });
  };

  // Helper function to resize an image
  const resizeImage = async localImage => {
    try {
      const resizedImageUri = await ImageResizer.createResizedImage(
        localImage,
        1000, // Width
        1000, // Height
        'JPEG', // Format
        100, // Quality
      );
      return resizedImageUri;
    } catch (err) {
      console.error('Failed to resize image:', err);
      // throw new Error('Image resizing failed');
    }
  };

  const createPostMutation = useMutation({
    mutationKey: ['create-post-key'],
    mutationFn: async ({
      article,
      recordId,
    }: {
      article: string;
      recordId: string;
    }) => {
      const response = await axios.post(
        POST_ARTICLE,
        {
          title: title,
          authorName: authorName,
          authorId: user?._id,
          content: article,
          tags: selectedGenres,
          imageUtils: [imageUtil],
          description: description,
          pb_recordId: recordId,
        },
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );
      console.log(article);
      return response.data.newArticle as ArticleData;
    },

    onSuccess: data => {
      // User will not get notified, until the article published
      /*
      socket.emit('notification', {
        type: 'openPost',
        postId: data._id,
        authorId: user?._id,
        message: {
          title: `${user?.user_handle} posted a new article`,
          body: title,
        },
      });
      */
      Alert.alert('Article added sucessfully');

      navigation.navigate('TabNavigation');
    },
    onError: error => {
      console.log('Article post Error', error);
      // console.log(error);

      Alert.alert('Failed to upload your post');
    },
  });

  // submit suggested changes

  const submitChangesMutation = useMutation({
    mutationKey: ['submit-post-key'],
    mutationFn: async ({article}: {article: string}) => {
      const response = await axios.post(
        SUBMIT_SUGGESTED_CHANGES,
        {
          title: title,
          userId: articleData?.authorId,
          authorName: authorName,
          articleId: articleData?._id,
          content: article,
          tags: selectedGenres,
          imageUtils: [imageUtil],
          description: description,
        },
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );
      return response.data.newArticle as ArticleData;
    },

    onSuccess: data => {
      // User will not get notified, until the article published

      Alert.alert('Article updated sucessfully');

      navigation.navigate('TabNavigation');
    },
    onError: error => {
      console.log('Article post Error', error);
      // console.log(error);

      Alert.alert('Failed to upload your post');
    },
  });

  // Submit Improvement
  const submitImprovementMutation = useMutation({
    mutationKey: ['submiit-improvemeny-key'],
    mutationFn: async ({
      edited_content,
      recordId,
    }: {
      edited_content: string;
      recordId: string;
    }) => {
      const response = await axios.post(
        SUBMIT_IMPROVEMENT,
        {
          requestId: requestId,
          edited_content: edited_content,
          pb_recordId: recordId,
        },
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );
      // console.log(article);
      return response.data.newArticle as ArticleData;
    },

    onSuccess: data => {
      Alert.alert('Changes submitted for review');

      navigation.navigate('TabNavigation');
    },
    onError: error => {
      console.log('Article post Error', error);
      // console.log(error);

      Alert.alert('Failed to upload your post');
    },
  });

  const renderSuggestionMutation = useMutation({
    mutationKey: ['render-suggestion-key'],
    mutationFn: async () => {
      const response = await axios.post(
        RENDER_SUGGESTION,
        {
          text: article,
        },
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );
      return response.data as ContentSuggestionResponse;
    },

    onSuccess: data => {
      // User will not get notified, until the article published
      if (data.full_html) {
        dispatch(setSuggestion({suggestion: data.suggestion}));

        navigation.navigate('RenderSuggestion', {
          htmlContent: data.full_html,
        });
      } else {
        Snackbar.show({
          text: 'Failed to load suggestions, try again!',
          duration: Snackbar.LENGTH_SHORT,
        });
      }
    },
    onError: error => {
      console.log('Article suggestion Error', error);

      Snackbar.show({
        text: 'Failed to load suggestions, try again!',
        duration: Snackbar.LENGTH_SHORT,
      });
    },
  });

  const uploadArticleToPocketbase = useMutation({
    mutationKey: ['upload-article-to-pocketbase-key'],
    mutationFn: async ({htmlContent}: {htmlContent: string}) => {
      const response = await axios.post(
        UPLOAD_ARTICLE_TO_POCKETBASE,
        {
          title: title,
          htmlContent: htmlContent,
          record_id: articleData ? articleData.pb_recordId : null,
        },
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );
      console.log('Response', response.data);
      return response.data as PocketBaseResponse;
    },

    onSuccess: (data: PocketBaseResponse) => {
      if (data.html_file) {
        if (articleData) {
          submitChangesMutation.mutate({
            article: data.html_file,
          });
        } else {
          createPostMutation.mutate({
            article: data.html_file,
            recordId: data.recordId,
          });
        }
      } else {
        Alert.alert('Failed to upload your post');
      }
    },
    onError: error => {
      console.log('Article post Error pb', error.message);
      // console.log(error);

      Alert.alert('Failed to upload your post');
    },
  });

  const uploadImprovementToPocketbase = useMutation({
    mutationKey: ['upload-improvement-to-pocketbase-key'],
    mutationFn: async ({htmlContent}: {htmlContent: string}) => {
      const response = await axios.post(
        UPLOAD_IMPROVEMENT_TO_POCKETBASE,
        {
          title: title,
          htmlContent: htmlContent,
          article_id: articleData ? articleData.pb_recordId : null,
          record_id: pb_record_id,
          improvement_id: requestId,
          user_id: user_id,
        },
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );
      // console.log(article);
      return response.data as PocketBaseResponse;
    },

    onSuccess: (data: PocketBaseResponse) => {
      if (data.html_file) {
        submitImprovementMutation.mutate({
          edited_content: data.html_file,
          recordId: data.recordId,
        });
      } else {
        Alert.alert('Failed to upload your post');
      }
    },
    onError: error => {
      console.log('Article post Error', error);
      // console.log(error);

      Alert.alert('Failed to upload your post');
    },
  });

  if (
    renderSuggestionMutation.isPending ||
    uploadImprovementToPocketbase.isPending ||
    uploadArticleToPocketbase.isPending ||
    createPostMutation.isPending ||
    submitChangesMutation.isPending ||
    submitImprovementMutation.isPending ||
    loading
  ) {
    return <Loader />;
  }
  return (
    <View style={styles.container}>
      <View style={styles.aiReviewBox}>
        <Text style={styles.reviewTitle}>✅ Your Post Is Ready to Review</Text>
        <Text style={styles.reviewSubtext}>
          Want to make it even better? Check your post with our AI Assistant’s
          suggestions.
        </Text>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => {
            renderSuggestionMutation.mutate();
          }}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
      <WebView
        style={{
          padding: 20,
          margin: 10,
          width: '99%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        ref={webViewRef}
        originWhitelist={['*']}
        source={{
          html: createHTMLStructure(
            title,
            article,
            selectedGenres,
            '',
            user ? user?.user_name : '',
          ),
        }} // author name required
        javaScriptEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  text: {
    fontWeight: 'bold',
    fontSize: 20,
  },

  textWhite: {
    fontWeight: '600',
    fontSize: 17,
    color: 'white',
  },
  button: {
    marginRight: 10,
    paddingHorizontal: 8,
    paddingVertical: 7,
    backgroundColor: PRIMARY_COLOR,
    width: 75,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },

  aiReviewBox: {
    backgroundColor: '#f0f8ff',
    padding: 16,
    margin: 8,
    borderRadius: 10,
    borderColor: '#d0e6ff',
    borderWidth: 1,
    alignItems: 'center',
  },

  reviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 6,
  },

  reviewSubtext: {
    fontSize: 14,
    color: '#34495e',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },

  continueButton: {
    backgroundColor: '#1e90ff',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },

  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
