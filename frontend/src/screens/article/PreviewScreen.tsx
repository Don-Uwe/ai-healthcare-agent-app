import React, {useRef} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {WebView} from 'react-native-webview';
import {PRIMARY_COLOR} from '../../helper/Theme';
import {ArticleData, PreviewScreenProp, User} from '../../type';
import {createHTMLStructure} from '../../helper/Utils';
import {useMutation, useQuery} from '@tanstack/react-query';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import RNFS from 'react-native-fs';
import axios from 'axios';
import Loader from '../../components/Loader';
import {GET_IMAGE, GET_PROFILE_API, POST_ARTICLE} from '../../helper/APIUtils';
import {useSelector} from 'react-redux';
import useUploadImage from '../../../hooks/useUploadImage';

import {useSocket} from '../../../SocketContext';
//import io from 'socket.io-client';

export default function PreviewScreen({navigation, route}: PreviewScreenProp) {
  const {article, title, authorName, selectedGenres, localImages} =
    route.params;

  //const socket = io('http://51.20.1.81:8084');
  const socket = useSocket();

  const webViewRef = useRef<WebView>(null);
  const {user_token} = useSelector((state: any) => state.user);

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
      console.log('User Profile', response.headers);
      // console.log('Respon)
      return response.data.profile as User;
    },
  });

  const handlePostSubmit = async () => {
    let finalArticle = article;
    let imageUtil = '';

    // Resize and confirm for all images before uploading
    try {
      const confirmation = await new Promise(resolve => {
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

      if (!confirmation) {
        Alert.alert('Post discarded');
        navigation.navigate('TabNavigation');
      }

      // Process each local image
      for (let i = 0; i < localImages.length; i++) {
        const localImage = localImages[i];

        // Resize the image
        const resizedImageUri = await ImageResizer.createResizedImage(
          localImage,
          1000,
          1000,
          'JPEG',
          100,
        );

        // Upload the resized image
        const uploadedUrl = await uploadImage(resizedImageUri.uri);
        // console.log('Uploaded Url',uploadedUrl);
        if (i === 0) {
          imageUtil = `${GET_IMAGE}/${uploadedUrl}`;
          continue;
        }
        finalArticle = finalArticle.replace(
          localImage,
          `${GET_IMAGE}/${uploadedUrl}`,
        );
      }

      console.log('Final Article', finalArticle);
      createPostMutation.mutate({
        article: finalArticle,
        image: imageUtil,
      });
    } catch (err) {
      console.error('Image processing failed:', err);
      Alert.alert('Error', 'Could not process the images.');
      return; // Exit on error
    }

    // console.log(finalArticle);
  };

  const createPostMutation = useMutation({
    mutationKey: ['create-post-key'],
    mutationFn: async ({article, image}: {article: string; image: string}) => {
      const response = await axios.post(
        POST_ARTICLE,
        {
          title: title,
          authorName: authorName,
          authorId: user?._id,
          content: article,
          tags: selectedGenres,
          imageUtils: [image],
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
      socket.emit('notification', {
        type: 'openPost',
        postId: data._id,
        authorId: user?._id,
        message: {
          title: `${user?.user_handle} posted a new article`,
          body: title,
        },
      });
      Alert.alert('Article added sucessfully');

      navigation.navigate('TabNavigation');
    },
    onError: error => {
      console.log('Article post Error', error);
      // console.log(error);

      Alert.alert('Failed to upload your post');
    },
  });

  const createAndUploadHtmlFile = async () => {
    const filePath = `${RNFS.DocumentDirectoryPath}/${title.substring(
      0,
      7,
    )}.html`;

    try {
      // Step 1: Create the HTML file
      await RNFS.writeFile(filePath, article, 'utf8');
      Alert.alert('Success', `HTML file created at: ${filePath}`);

      // Step 2: Upload the file
      const formData = new FormData();
      formData.append('file', {
        uri: filePath,
        type: 'text/html', // Change if necessary
        name: `${title.substring(0, 7)}.html`,
      });

      const response = await axios.post(UPLOAD_STORAGE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Upload Success', `File uploaded: ${response.data}`);
    } catch (error) {
      Alert.alert('Error', `Operation failed: ${error.message}`);
    }
  };

  // Vultr post
  if (createPostMutation.isPending || loading) {
    return <Loader />;
  }
  return (
    <View style={styles.container}>
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
});


