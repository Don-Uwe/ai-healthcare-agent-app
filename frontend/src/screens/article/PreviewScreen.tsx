import React, {useState} from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {BUTTON_COLOR} from '../../helper/Theme';
import {
  ContentSuggestionResponse,
  PocketBaseResponse,
  PreviewScreenProp,
} from '../../type';
import {createHTMLStructure, handleExternalClick} from '../../helper/Utils';
import {useMutation} from '@tanstack/react-query';
import ImageResizer from '@bam.tech/react-native-image-resizer';

import axios from 'axios';
import Loader from '../../components/Loader';
import {
  GET_IMAGE,
  RENDER_SUGGESTION,
  UPLOAD_ARTICLE_TO_POCKETBASE,
  UPLOAD_IMPROVEMENT_TO_POCKETBASE,
} from '../../helper/APIUtils';
import {useDispatch, useSelector} from 'react-redux';
import useUploadImage from '../../hooks/useUploadImage';
import {setSuggestion} from '../../store/dataSlice';
import Snackbar from 'react-native-snackbar';
import AutoHeightWebView from '@brown-bear/react-native-autoheight-webview';
import {useGetProfile} from '@/src/hooks/useGetProfile';
import {usePostArticleData} from '@/src/hooks/usePostArticle';
import {useSubmitImprovement} from '@/src/hooks/useSubmitImprovement';
import {useSubmitSuggestedChanges} from '@/src/hooks/useSubmitSuggestedChanges';

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

  const [imageUtil, setImageUtil] = useState<string>('');
  const [imageUtils, setImageUtils] = useState<string[]>([]);

  const {user_token, user_id} = useSelector((state: any) => state.user);
  const {suggestion, suggestionAccepted} = useSelector(
    (state: any) => state.data,
  );

  const {isConnected} = useSelector((state: any) => state.network);
  const dispatch = useDispatch();

  const {mutate: postMutation, isPending: postMutationPending} =
    usePostArticleData();
  const {mutate: improvementMutation, isPending: improvementMutationPending} =
    useSubmitImprovement();

  const {mutate: submitChangesMutation, isPending: submitChangesPending} =
    useSubmitSuggestedChanges();

  const {uploadImage, loading} = useUploadImage();

  const {data: user} = useGetProfile();
  // console.log(selectedGenres);

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            //createPostMutation.mutate();
            if (isConnected) {
              handlePostSubmit();
            } else {
              Snackbar.show({
                text: 'Please check your internet connection',
                duration: Snackbar.LENGTH_SHORT,
              });
            }
          }}>
          <Text style={styles.textWhite}>Submit</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

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

      let resultImages: string[] = [];

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
          resultImages.push(`${GET_IMAGE}/${uploadedUrl}` || '');
          finalArticle = finalArticle.replace(
            localImage,
            `${GET_IMAGE}/${uploadedUrl}`,
          );
        }
      }

      setImageUtils([imageUtil, ...resultImages]);

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


  const renderSuggestionMutation = useMutation({
    mutationKey: ['render-suggestion-key'],
    mutationFn: async () => {
      // console.log("htmlContent", article);
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
          submitChangesMutation(
            {
              article: data.html_file,
              title: title,
              userId: articleData
                ? typeof articleData.authorId === 'string'
                  ? articleData.authorId
                  : articleData.authorId._id
                : '',
              authorName: authorName,
              articleId: articleData?._id,
              tags: selectedGenres,
              imageUtils: imageUtils,
              description: description,
            },
            {
              onSuccess: data => {
                // User will not get notified, until the article published

                Snackbar.show({
                  text: 'Article submitted for review',
                  duration: Snackbar.LENGTH_SHORT,
                });

                navigation.navigate('TabNavigation');
              },
              onError: error => {
                console.log('Article post Error', error);
                // console.log(error);

                Alert.alert('Failed to upload your post');
              },
            },
          );
        } else {
          postMutation(
            {
              title: title,
              authorName: authorName,
              authorId: user?._id ?? '',
              content: data.html_file,
              tags: selectedGenres,
              imageUtils: imageUtils,
              description: description,
              pb_recordId: data.recordId,
              allow_podcast: true,
              language: 'en-IN',
            },
            {
              onSuccess: () => {
                Snackbar.show({
                  text: 'Article added successfully',
                  duration: Snackbar.LENGTH_SHORT,
                });

                navigation.navigate('TabNavigation');
              },

              onError: error => {
                console.log('Article post Error', error);
                // console.log(error);

                Snackbar.show({
                  text: 'Failed to upload your post',
                  duration: Snackbar.LENGTH_SHORT,
                });
              },
            },
          );
        }
      } else {
        Snackbar.show({
          text: 'Failed to upload your post',
          duration: Snackbar.LENGTH_SHORT,
        });
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
        improvementMutation(
          {
            edited_content: data.html_file,
            recordId: data.recordId,
            requestId: requestId ?? '',
            imageUtils: imageUtils,
          },
          {
            onSuccess: data => {
              Snackbar.show({
                text: 'Changes submitted for review',
                duration: Snackbar.LENGTH_SHORT,
              });

              navigation.navigate('TabNavigation');
            },
            onError: error => {
              console.log('Article post Error', error);

              Alert.alert('Error', 'Failed to upload your post');
            },
          },
        );
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
    postMutationPending ||
    submitChangesPending ||
    improvementMutationPending ||
    loading
  ) {
    return <Loader />;
  }
  return (
    <View style={styles.container}>
      {/* AI Review Card with Modern Design */}
      <View style={styles.aiReviewCard}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>✨</Text>
        </View>
        <Text style={styles.reviewTitle}>Article Ready for Review</Text>
        <Text style={styles.reviewSubtext}>
          Enhance your content with AI-powered suggestions and improvements
        </Text>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => {
            if (isConnected) {
              renderSuggestionMutation.mutate();
            } else {
              Snackbar.show({
                text: 'Please check your internet connection',
                duration: Snackbar.LENGTH_SHORT,
              });
            }
          }}
          activeOpacity={0.8}>
          <Text style={styles.continueButtonText}>Get AI Suggestions</Text>
        </TouchableOpacity>
      </View>

      {/* Preview Label */}
      <View style={styles.previewHeader}>
        <Text style={styles.previewLabel}>Preview</Text>
      </View>

      {/* Article Preview */}
      <View style={styles.articlePreviewContainer}>
        <AutoHeightWebView
          style={styles.webView}
          
          onSizeUpdated={size => console.log(size.height)}
          files={[
            {
              href: 'cssfileaddress',
              type: 'text/css',
              rel: 'stylesheet',
            },
          ]}
          originWhitelist={['*']}
          source={{
            html: createHTMLStructure(
              title,
              article,
              selectedGenres,
              '',
              user ? user?.user_name : '',
            ),
          }}
          scalesPageToFit={true}
          viewportContent={'width=device-width, user-scalable=no'}
          onShouldStartLoadWithRequest={handleExternalClick}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  textWhite: {
    fontWeight: '700',
    fontSize: 16,
    color: 'white',
  },
  button: {
    marginRight: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: BUTTON_COLOR,
    borderRadius: 8,
    shadowColor: BUTTON_COLOR,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  aiReviewCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 32,
  },
  reviewTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  reviewSubtext: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  continueButton: {
    backgroundColor: BUTTON_COLOR,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: BUTTON_COLOR,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    minWidth: 200,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  previewHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  articlePreviewContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  webView: {
    width: Dimensions.get('window').width - 32,
  },
});
