/* eslint-disable react-native/no-inline-styles */
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import React, {useRef, useState} from 'react';
import {useQuery, useMutation} from '@tanstack/react-query';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {PRIMARY_COLOR} from '../../helper/Theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ArticleData, ArticleScreenProp} from '../../type';
import {useSelector} from 'react-redux';
import WebView from 'react-native-webview';
import {hp} from '../../helper/Metric';
import {
  BASE_URL,
  FOLLOW_USER,
  GET_ARTICLE_BY_ID,
  GET_PROFILE_IMAGE_BY_ID,
  GET_STORAGE_DATA,
  LIKE_ARTICLE,
  UPDATE_READ_EVENT,
} from '../../helper/APIUtils';
import axios from 'axios';
import Loader from '../../components/Loader';
import {setArticle} from '../../store/articleSlice';
import Snackbar from 'react-native-snackbar';

import { formatCount } from '../../helper/Utils';


const ArticleScreen = ({navigation, route}: ArticleScreenProp) => {
  const insets = useSafeAreaInsets();
  const {articleId, authorId} = route.params;
  const {user_id, user_token} = useSelector((state: any) => state.user);
  const [readEventSave, setReadEventSave] = useState(false);
  const [webViewHeight, setWebViewHeight] = useState(0);

  const webViewRef = useRef<WebView>(null);

  const {
    data: article,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ['get-article-by-id'],
    queryFn: async () => {
      const response = await axios.get(`${GET_ARTICLE_BY_ID}/${articleId}`, {
        headers: {
          Authorization: `Bearer ${user_token}`,
        },
      });

      return response.data.article as ArticleData;
    },
  });

  console.log('View Users', article?.viewUsers);

  const handleLike = () => {
    if (article) {
      updateLikeMutation.mutate();
    } else {
      Alert.alert('Article not found');
    }
  };

  const handleFollow = () => {
    updateFollowMutation.mutate();
  };

  const updateFollowMutation = useMutation({
    mutationKey: ['update-follow-status'],

    mutationFn: async () => {
      if (!user_token || user_token === '') {
        Alert.alert('No token found');
        return;
      }
      const res = await axios.post(
        FOLLOW_USER,
        {
          followUserId: authorId,
          //user_id: user_id,
        },
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );
      return res.data as any;
    },

    onSuccess: () => {
      //console.log('follow success');
      refetchFollowers();
      // refetchProfile();
    },

    onError: err => {
      console.log('Update Follow mutation error', err);
      Alert.alert('Try Again!');
      //console.log('Follow Error', err);
    },
  });

  const updateLikeMutation = useMutation({
    mutationKey: ['update-like-status'],

    mutationFn: async () => {
      if (!user_token || user_token === '') {
        Alert.alert('No token found');
        return;
      }
      const res = await axios.post(
        LIKE_ARTICLE,
        {
          article_id: article?._id,
          //user_id: user_id,
        },
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );
      return res.data.article as ArticleData;
    },

    onSuccess: data => {
      // dispatch(setArticle({article: data}));
      refetch();
    },

    onError: err => {
      Alert.alert('Try Again!');
      console.log('Like Error', err);
    },
  });

  const updateReadEventMutation = useMutation({
    mutationKey: ['update-read-event-status'],

    mutationFn: async () => {
      if (!user_token || user_token === '') {
        Alert.alert('No token found');
        return;
      }
      const res = await axios.post(
        UPDATE_READ_EVENT,
        {
          article_id: article?._id,
          //user_id: user_id,
        },
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );
      return res.data as any;
    },

    onSuccess: () => {
      console.log('Read Event Updated');
      setReadEventSave(true);
      //Alert.alert('Your Read status updated'); For debug purpose
      Snackbar.show({
        text: 'Your read status updated.',
        duration: Snackbar.LENGTH_SHORT,
      });
    },

    onError: err => {
      console.log('Update Read Status mutation error', err);
      //Alert.alert('Try Again!');
      //console.log('Follow Error', err);
      Snackbar.show({
        text: 'Failed to update your read status.',
        duration: Snackbar.LENGTH_SHORT,
      });
    },
  });

  console.log('author id', authorId);
  const {data: authorFollowers, refetch: refetchFollowers} = useQuery({
    queryKey: ['authorFollowers'],
    queryFn: async () => {
      const response = await axios.get(
        `${BASE_URL}/user/${authorId}/followers`,
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );

      return response.data.followers as string[];
    },
  });

  const {data: profile_image} = useQuery({
    queryKey: ['author_profile_image'],
    queryFn: async () => {
      const response = await axios.get(
        `${GET_PROFILE_IMAGE_BY_ID}/${authorId}`,
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );
      console.log('Response', response);
      return response.data.profile_image as string;
    },
  });

  const cssCode = `
  const style = document.createElement('style');
  style.innerHTML = \`
    body {
      font-size: 46px;
      line-height: 1.5;
      color: #333;
    }
  \`;
  document.head.appendChild(style);
`;

  const contentSource = article?.content?.startsWith('http')
    ? {uri: article.content}
    : {html: article?.content};

  if (isLoading) {
    return <Loader />;
  }
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        onScroll={e => {
          var windowHeight = Dimensions.get('window').height,
            height = e.nativeEvent.contentSize.height,
            offset = e.nativeEvent.contentOffset.y;
          if (windowHeight + offset >= height) {
            //ScrollEnd,
            console.log('ScrollEnd');
            if (article && !readEventSave) {
              updateReadEventMutation.mutate();
            }
          }
        }}
        contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.imageContainer}>
          {article && article?.imageUtils && article?.imageUtils.length > 0 ? (
            <Image
              source={{uri: article?.imageUtils[0]}}
              style={styles.image}
            />
          ) : (
            <Image
              source={require('../../assets/article_default.jpg')}
              style={styles.image}
            />
          )}
          {updateLikeMutation.isPending ? (
            <ActivityIndicator size={40} color={PRIMARY_COLOR} />
          ) : (
            <TouchableOpacity
              onPress={handleLike}
              style={[
                styles.likeButton,
                {
                  backgroundColor: 'white',
                },
              ]}>
              <FontAwesome
                name="heart"
                size={34}
                color={
                  article &&
                  article?.likedUsers &&
                  article?.likedUsers?.some(user => user._id === user_id)
                    ? PRIMARY_COLOR
                    : 'black'
                }
              />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.contentContainer}>
          {article && (
            <Text style={{...styles.viewText, marginBottom: 10}}>
              {article && article?.viewUsers.length
                ? article.viewUsers.length > 1

                  ? `${formatCount(article.viewUsers.length)} views`
                  : `${article.viewUsers.length} view`
                : '0 view'}
            </Text>
          )}
          {article && article?.tags && (
            <Text style={styles.categoryText}>
              {article.tags.map(tag => tag.name).join(' | ')}
            </Text>
          )}

          {article && (
            <>
              <Text style={styles.titleText}>{article?.title}</Text>
              <View style={styles.avatarsContainer}>
                <View style={styles.avatar} />
                <View style={[styles.avatar, styles.avatarOverlap]} />
                <View style={[styles.avatar, styles.avatarDoubleOverlap]} />
                <View style={[styles.avatar, styles.avatarTripleOverlap]}>
                  <Text style={styles.moreText}>
                    +
                    {article?.likedUsers
                      ? formatCount(article.likedUsers.length)
                      : 0}
                  </Text>
                </View>
              </View>
            </>
          )}
          <View style={styles.descriptionContainer}>
            <WebView
              style={{
                padding: 7,
                width: '99%',
                height: hp(2000),
                justifyContent: 'center',
                alignItems: 'center',
              }}
              ref={webViewRef}
              originWhitelist={['*']}
              injectedJavaScript={cssCode}
              source={contentSource}
              textZoom={100}
            />
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom:
              Platform.OS === 'ios' ? insets.bottom : insets.bottom + 20,
          },
        ]}>
        <View style={styles.authorContainer}>
          <TouchableOpacity
            onPress={() => {
              if (article && article?.authorId) {
                navigation.navigate('UserProfileScreen', {
                  authorId: article?.authorId,
                });
              }
            }}>
            {profile_image && profile_image !== '' ? (
              <Image
                source={{
                  uri: profile_image.startsWith('http')
                    ? `${profile_image}`
                    : `${GET_STORAGE_DATA}/${profile_image}`,
                }}
                style={styles.authorImage}
              />
            ) : (
              <Image
                source={{
                  uri: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
                }}
                style={styles.authorImage}
              />
            )}
          </TouchableOpacity>
          <View>
            <Text style={styles.authorName}>
              {article ? article?.authorName : ''}
            </Text>
            <Text style={styles.authorFollowers}>
              {authorFollowers ? authorFollowers.length : 0} followers
            </Text>
          </View>
        </View>
        {article &&
          user_id !== article.authorId &&
          (updateFollowMutation.isPending ? (
            <ActivityIndicator size={40} color={PRIMARY_COLOR} />
          ) : (
            <TouchableOpacity
              style={styles.followButton}
              onPress={handleFollow}>
              <Text style={styles.followButtonText}>
                {authorFollowers && authorFollowers.includes(user_id)
                  ? 'Following'
                  : 'Follow'}
              </Text>
            </TouchableOpacity>
          ))}
      </View>
    </View>
  );
};

export default ArticleScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 0,
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  scrollViewContent: {
    marginBottom: 10,
    flexGrow: 0,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    height: 300,
    width: '100%',
    objectFit: 'cover',
  },
  likeButton: {
    padding: 10,
    position: 'absolute',
    bottom: -25,
    right: 20,
    borderRadius: 50,
  },
  contentContainer: {
    marginTop: 25,
    paddingHorizontal: 16,
  },
  categoryText: {
    fontWeight: '400',
    fontSize: 12,
    color: '#6C6C6D',
    textTransform: 'uppercase',
  },
  viewText: {
    fontWeight: '500',
    fontSize: 14,
    color: '#6C6C6D',
  },
  titleText: {
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 5,
  },
  avatarsContainer: {
    position: 'relative',
    flex: 1,
    height: 70,
    marginTop: 10,
  },
  avatar: {
    height: 70,
    width: 70,
    borderRadius: 100,
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'white',
    backgroundColor: '#D9D9D9',
  },
  avatarOverlap: {
    left: 15,
  },
  avatarDoubleOverlap: {
    left: 30,
  },
  avatarTripleOverlap: {
    left: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: {
    fontSize: 20,
    fontWeight: '400',
  },
  descriptionContainer: {
    flex: 0,
    marginTop: 10,
  },

  webView: {
    flex: 1,
    width: '100%',
    margin: 0,
    padding: 0,
  },
  descriptionText: {
    fontWeight: '400',
    color: '#6C6C6D',
    fontSize: 15,
    textAlign: 'justify',
  },
  footer: {
    backgroundColor: '#EDE9E9',
    position: 'relative',
    bottom: 0,
    zIndex: 10,
    borderTopEndRadius: 30,
    borderTopStartRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  authorImage: {
    height: 50,
    width: 50,
    borderRadius: 50,
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
    paddingHorizontal: 15,
    borderRadius: 20,
    paddingVertical: 10,
  },
  followButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
