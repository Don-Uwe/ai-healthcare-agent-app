import {
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
  FlatList,
  Dimensions,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../../helper/Theme';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ReviewScreenProp, Comment} from '../../type';
import {useDispatch, useSelector} from 'react-redux';
import {hp, wp} from '../../helper/Metric';
import {
  GET_IMAGE,
  GET_STORAGE_DATA,
  SOCKET_PROD,
} from '../../helper/APIUtils';

import {setUserHandle} from '../../store/UserSlice';
import {handleExternalClick, StatusEnum} from '../../helper/Utils';
import ReviewItem from '../../components/ReviewItem';
import {io} from 'socket.io-client';
import {Button, Spinner, Text, YStack, TextArea} from 'tamagui';
import AutoHeightWebView from '@brown-bear/react-native-autoheight-webview';
import {useGetArticleDetails} from '@/src/hooks/useGetArticleDetail';
import {useGetArticleContent} from '@/src/hooks/useGetArticleContent';
import {useGetProfile} from '@/src/hooks/useGetProfile';
import {useGetLoadReviewComments} from '@/src/hooks/useGetLoadReviewComments';

const ReviewScreen = ({navigation, route}: ReviewScreenProp) => {
  const insets = useSafeAreaInsets();
  const {articleId, authorId, recordId} = route.params;
  const {user_token} = useSelector((state: any) => state.user);
  const {isConnected} = useSelector((state: any) => state.isConnected);

  const [feedback, setFeedback] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const {data: user} = useGetProfile();
  const {data: article, refetch} = useGetArticleDetails(articleId);

  const {data: articleContent} = useGetArticleContent(recordId);

  const socket = io(`${SOCKET_PROD}`);
  const dispatch = useDispatch();

  const [comments, setComments] = useState<Comment[]>([]);

  const flatListRef = useRef<FlatList<Comment>>(null);

  const {data: loadComments, isLoading} = useGetLoadReviewComments(
    articleId,
    undefined,
    isConnected,
  );

  useEffect(() => {
    setComments(loadComments ?? []);
  }, [loadComments]);

  useEffect(() => {
    refetch();
  }, [articleId, refetch]);

  const noDataHtml = '<p>No Data found</p>';

  if (user) {
    dispatch(setUserHandle(user.user_handle));
  }

  useEffect(() => {
    // socket.emit('load-review-comments', {articleId: route.params.articleId});

    socket.on('connect', () => {
      console.log('connection established');
    });

    socket.on('error', data => {
      console.log('connection error', data);
    });

    socket.on('new-feedback', data => {
      setLoading(false);

      setComments(prevComments => {
        const newComments = [data, ...prevComments];
        if (flatListRef.current && newComments.length > 1) {
          flatListRef?.current.scrollToIndex({index: 0, animated: true});
        }

        return newComments;
      });
    });

    return () => {
      socket.off('review-comments');
      socket.off('new-feedback');
      socket.off('error');
    };
  }, [socket, route.params.articleId]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.imageContainer}>
          {article && article?.imageUtils && article?.imageUtils.length > 0 ? (
            <Image
              source={{
                uri: article?.imageUtils[0].startsWith('https')
                  ? article?.imageUtils[0]
                  : `${GET_IMAGE}/${article?.imageUtils[0]}`,
              }}
              style={styles.image}
            />
          ) : (
            <Image
              source={require('../../../assets/images/no_results.jpg')}
              style={styles.image}
            />
          )}

          {article?.status !== StatusEnum.DISCARDED && (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('ArticleDescriptionScreen', {
                  article: article,
                  htmlContent: articleContent ? articleContent : noDataHtml,
                });
              }}
              style={[
                styles.likeButton,
                {
                  backgroundColor: 'white',
                },
              ]}>
              <FontAwesome5 name="pencil-alt" size={24} color={PRIMARY_COLOR} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.contentContainer}>
          {article && article?.tags && (
            <Text style={styles.categoryText}>
              {article.tags.map(tag => tag.name).join(' | ')}
            </Text>
          )}

          {article && (
            <>
              <Text style={styles.titleText}>{article?.title}</Text>
            </>
          )}
          <View style={styles.descriptionContainer}>
            <AutoHeightWebView
              style={{
                width: Dimensions.get('window').width - 15,
                marginTop: 35,
                marginBottom: 30,
              }}
              customStyle={`* { font-family: 'Times New Roman'; } p { font-size: 16px; }`}
              onSizeUpdated={size => console.log(size.height)}
              files={[
                {
                  href: 'cssfileaddress',
                  type: 'text/css',
                  rel: 'stylesheet',
                },
              ]}
              originWhitelist={['*']}
              source={{html: articleContent ?? noDataHtml}}
              scalesPageToFit={true}
              viewportContent={'width=device-width, user-scalable=no'}
              onShouldStartLoadWithRequest={handleExternalClick}
            />
          </View>
        </View>

        {article?.status !== StatusEnum.DISCARDED &&
          article?.reviewer_id !== null && (
            <YStack
              padding={wp(4)}
              marginTop={hp(1.5)}
              borderRadius={16}
              space="$3"
              backgroundColor="#F8F9FA"
              borderWidth={1}
              borderColor="#E0E0E0">
              <Text fontSize={17} fontWeight="700" color="#1A1A1A" marginBottom="$2">
                💬 Add a Comment
              </Text>
              <TextArea
                placeholder="Share your thoughts or ask a question..."
                value={feedback}
                onChangeText={setFeedback}
                multiline
                height={hp(16)}
                fontSize={wp(4.5)}
                paddingVertical={12}
                paddingHorizontal={14}
                borderRadius={12}
                borderWidth={2}
                borderColor={PRIMARY_COLOR}
                backgroundColor="#fff"
                textAlignVertical="top"
              />

              {feedback.length > 0 && (
                <YStack alignItems="flex-end" marginTop={hp(0.5)}>
                  {loading ? (
                    <Spinner size="large" color={PRIMARY_COLOR} />
                  ) : (
                    <Button
                      size="$4"
                      width="40%"
                      height={48}
                      backgroundColor={PRIMARY_COLOR}
                      color="#fff"
                      borderRadius={12}
                      onPress={() => {
                        setLoading(true);

                        socket.emit('add-review-comment', {
                          articleId: article?._id,
                          reviewer_id: article?.reviewer_id,
                          feedback: feedback,
                          isReview: false,
                          isNote: true,
                        });

                        setFeedback('');
                      }}>
                      <Text color="#ffffff" fontSize={16} fontWeight="700">
                        Post Comment
                      </Text>
                    </Button>
                  )}
                </YStack>
              )}
            </YStack>
          )}

        {/* LOADING SECTION */}
        {isLoading ? (
          <YStack
            padding={wp(4)}
            marginTop={hp(1)} // reduced
            alignItems="center"
            space="$2">
            <Spinner size="small" color="#8FA3C0" />
            <Text color="#8FA3C0" fontSize={wp(4)} fontWeight="500">
              Loading comments...
            </Text>
          </YStack>
        ) : (
          <YStack padding={wp(4)} marginTop={hp(0.5)}>
            {comments?.map((item, index) => (
              <ReviewItem key={index} item={item} />
            ))}
          </YStack>
        )}
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
              //  if (article && article?.authorId) {
              navigation.navigate('UserProfileScreen', {
                authorId: authorId,
              });
            }}>
            {user && user.Profile_image && user.Profile_image !== '' ? (
              <Image
                source={{
                  uri: user.Profile_image.startsWith('http')
                    ? `${user.Profile_image}`
                    : `${GET_STORAGE_DATA}/${user.Profile_image}`,
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
            <Text style={styles.authorName}>{user ? user?.user_name : ''}</Text>
            <Text style={styles.authorFollowers}>
              {user && user.followers
                ? user.followers.length > 1
                  ? `${user.followers.length} followers`
                  : `${user.followers.length} follower`
                : '0 follower'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};
export default ReviewScreen;

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

  profileImage: {
    height: 70,
    width: 70,
    borderRadius: 100,
    objectFit: 'cover',
    resizeMode: 'contain',
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
    backgroundColor: PRIMARY_COLOR,
  },
  moreText: {
    fontSize: hp(4),
    fontWeight: '700',
    color: 'white',
  },
  descriptionContainer: {
    flex: 1,
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
    backgroundColor: ON_PRIMARY_COLOR,
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

  commentsList: {
    flex: 1,
    marginBottom: 20,
  },

  textInput: {
    height: hp(19),
    borderColor: PRIMARY_COLOR,
    borderWidth: 1.5,
    borderRadius: 8,
    fontSize: wp(5),
    marginHorizontal: 6,
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
  editIconContainer: {
    position: 'absolute',
    top: 16,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 5,
  },
  inputContainer: {
    // height: 200,
    overflow: 'hidden',
    //backgroundColor: 'red',
    //padding: hp(1),
    //borderColor: '#000',
    // borderWidth: 0.5,
    // padding: wp(6),
    marginHorizontal: wp(4),
  },
  editor: {
    backgroundColor: 'blue',
    borderColor: 'black',
    marginHorizontal: 4,
  },
  rich: {
    //minHeight: 700,
    flex: 1,
    backgroundColor: ON_PRIMARY_COLOR,
  },
  richBar: {
    height: 45,
    backgroundColor: PRIMARY_COLOR,
    marginTop: 0,
    marginBottom: hp(0.8),
  },
});
