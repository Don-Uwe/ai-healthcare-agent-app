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
  FlatList,
} from 'react-native';
import {useEffect, useRef, useState} from 'react';
import {useQuery, useMutation} from '@tanstack/react-query';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {PRIMARY_COLOR} from '../../helper/Theme';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ArticleData, ArticleScreenProp, User} from '../../type';
import {useDispatch, useSelector} from 'react-redux';
import WebView from 'react-native-webview';
import {hp, wp} from '../../helper/Metric';
import {
  FOLLOW_USER,
  GET_ARTICLE_BY_ID,
  GET_ARTICLE_CONTENT,
  GET_PROFILE_API,
  GET_PROFILE_IMAGE_BY_ID,
  GET_STORAGE_DATA,
  LIKE_ARTICLE,
  UPDATE_READ_EVENT,
  UPDATE_VIEW_COUNT,
} from '../../helper/APIUtils';
import axios from 'axios';
import Loader from '../../components/Loader';
import Snackbar from 'react-native-snackbar';

//import io from 'socket.io-client';
import {Comment} from '../../type';
import {formatCount} from '../../helper/Utils';
//import CommentScreen from '../CommentScreen';
import Tts from 'react-native-tts';
import CommentItem from '../../components/CommentItem';
import {setUserHandle} from '../../store/UserSlice';
import {io} from 'socket.io-client';
import Config from 'react-native-config';

const ArticleScreen = ({navigation, route}: ArticleScreenProp) => {
  const insets = useSafeAreaInsets();
  const {articleId, authorId, recordId} = route.params;
  const {user_id, user_token} = useSelector((state: any) => state.user);
  const [readEventSave, setReadEventSave] = useState(false);

  const socket = io(`${Config.SOCKET_URL}`);
  const dispatch = useDispatch();

  const [comments, setComments] = useState<Comment[]>([]);
  // const [newComment, setNewComment] = useState('');
  const flatListRef = useRef<FlatList<Comment>>(null);
  // const {user_id} = useSelector((state: any) => state.user);
  const [selectedCommentId, setSelectedCommentId] = useState<string>('');
  const [commentLikeLoading, setCommentLikeLoading] = useState<Boolean>(false);
  const [webviewHeight, setWebViewHeight] = useState(0);
  const [speechingMode, setSpeechingMode] = useState(false);

  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    updateViewCountMutation.mutate();

    // Tts.requestInstallData();
   // const subscription = Tts.addEventListener('Tts-finish', event => {
      //finishEvent();
    //});
    return () => {
      Tts.stop();
     // subscription;
    };
  }, []);

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

  const {data: user} = useQuery({
    queryKey: ['get-my-profile'],
    queryFn: async () => {
      const response = await axios.get(`${GET_PROFILE_API}`, {
        headers: {
          Authorization: `Bearer ${user_token}`,
        },
      });
      return response.data.profile as User;
    },
  });

  //console.log('Recordid', recordId);
  const {data: htmlContent} = useQuery({
    queryKey: ['get-publish-article-content'],
    queryFn: async () => {
      const response = await axios.get(`${GET_ARTICLE_CONTENT}/${recordId}`, {
        headers: {
          Authorization: `Bearer ${user_token}`,
        },
      });

      //console.log('HTML RES', response.data);
      return response.data.htmlContent as string;
    },
  });

  const noDataHtml = '<p>No Data found</p>';

  if (user) {
    dispatch(setUserHandle(user.user_handle));
  }
  const updateViewCountMutation = useMutation({
    mutationKey: ['update-view-count'],
    mutationFn: async () => {
      if (user_token === '') {
        Alert.alert('No token found');
        return;
      }
      const res = await axios.post(
        UPDATE_VIEW_COUNT,
        {
          article_id: articleId,
        },
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );

      return res.data.article as ArticleData;
    },
    onSuccess: async () => {},

    onError: error => {
      console.log('Update View Count Error', error);
      Alert.alert('Internal server error, try again!');
    },
  });

  // console.log('View Users', article?.viewUsers);

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
          //followUserId: authorId,
          //user_id: user_id,
          articleId: articleId,
        },
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );
      return res.data.followStatus as boolean;
    },

    onSuccess: data => {
      //console.log('follow success');
      if (data) {
        socket.emit('notification', {
          type: 'userFollow',
          userId: authorId,
          message: {
            title: `${user?.user_handle} has followed you`,
            body: '',
          },
        });
      }
      refetch();
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

      return res.data.data as {
        article: ArticleData;
        likeStatus: boolean;
      };
    },

    onSuccess: data => {
      // dispatch(setArticle({article: data}));

      if (data?.likeStatus) {
        socket.emit('notification', {
          type: 'likePost',
          userId: data?.article?.authorId,
          articleId: data?.article?._id,
          podcastId: null,
          articleRecordId: data?.article?.pb_recordId,
          title: user
            ? `${user?.user_handle} liked your post`
            : 'Someone liked your post',
          message: data?.article?.title,
        });
      }
      refetch();
    },

    onError: err => {
      Alert.alert('Try Again!');
      console.log('Like Error', err);
    },
  });

  //  console.log('Response', article?.authorId.followers);

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

  useEffect(() => {
    //console.log('Fetching comments for articleId:', route.params.articleId);
    socket.emit('fetch-comments', {articleId: route.params.articleId});

    socket.on('connect', () => {
      console.log('connection established');
    });

    socket.on('comment-processing', () => {
      // setCommentLoading(data);
    });

    socket.on('like-comment-processing', (data) => {
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

  useEffect(() => {
    if (htmlContent) {
      /*
      let source = article?.content?.endsWith('.html')
        ? {uri: `${GET_STORAGE_DATA}/${article.content}`}
        : {html: article?.content};

      const fetchContentLength = async () => {
        const length = await getContentLength(source);
        console.log('Content Length:', length);

        setWebViewHeight(length); //Add some buffer to the height calculation
      };

      fetchContentLength();
      */
      setWebViewHeight(htmlContent.length);
    } else {
      setWebViewHeight(noDataHtml.length);
    }
  }, [htmlContent]);

  //const handleEditAction = (comment: Comment) => {
    // setNewComment(comment.content);
    // setEditMode(true);
    //setEditCommentId(comment._id);
  //};

  const handleMentionClick = (user_handle: string) => {
    //console.log('user handle', user_handle);
    navigation.navigate('UserProfileScreen', {
      authorId: '',
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

  const handleReportAction = (commentId: string, authorId: string) => {
    navigation.navigate('ReportScreen', {
      articleId: articleId.toString(),
      authorId: authorId,
      commentId: commentId,
      podcastId: null
    });
  };

  // console.log('author id', authorId);

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
      //console.log('Response', response);
      return response.data.profile_image as string;
    },
  });

  async function convertHtmlToPlainText(html: string) {
    // Remove inline styles
    var modifiedHtml = html.replace(/ style="[^"]*"/g, '');

    // Remove <style> blocks and their content
    modifiedHtml = modifiedHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/g, '');

    // Replace &nbsp; with a space
    modifiedHtml = modifiedHtml.replace(/&nbsp;/g, ' ');

    // Remove all other HTML tags
    var plainText = modifiedHtml.replace(/<[^>]*>/g, '');

    return plainText;
  }

  const speakSection = async (_language = 'en-US', content: string) => {
    // Tts.requestInstallData();
    Tts.setDefaultPitch(0.6);

    //if (content.endsWith('.html')) {
    //const response = await fetch(`${GET_STORAGE_DATA}/${content}`);
    // content = await response.text();
    //}

    const res = await convertHtmlToPlainText(content);

    if (res) {
      Tts.getInitStatus().then(() => {
        const textChunks = res.split(' ');
        let chunkIndex = 0;

        const speakNextChunk = () => {
          if (chunkIndex < textChunks.length) {
            const chunk = textChunks
              .slice(chunkIndex, chunkIndex + 100)
              .join(' ');

            Tts.speak(chunk);

            Tts.addEventListener('tts-finish', () => {
              chunkIndex += 100;
              speakNextChunk();
            });

            Tts.addEventListener('tts-error', error => {
              console.error('TTS Error:', error);
            });
          }
        };

        speakNextChunk();
      });
    }
  };

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

  // const contentSource = article?.content?.endsWith('.html')
  //  ? {uri: `${GET_STORAGE_DATA}/${article.content}`}
  //  : {html: article?.content};

  // Function to get the content length based on the type of content (URI or HTML)

  /*
  const getContentLength = async contentSource => {
    if (contentSource.uri) {
      try {
        const response = await fetch(contentSource.uri);
        const content = await response.text();
        return content.length - 4000;
      } catch (error) {
        console.error('Error fetching URI:', error);
        return 0;
      }
    } else if (contentSource.html) {
      return contentSource.html.length;
    }
    return 0; // Return 0 if no valid content source
  };
  */

  if (isLoading) {
    return <Loader />;
  }

  //console.log('Comment', comments);
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
            // console.log('ScrollEnd');
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

          <TouchableOpacity
            onPress={() => {
              setSpeechingMode(!speechingMode);

              if (!speechingMode) {
                // setCartoonModalVisible(true);
                // prepareSection();
                if (htmlContent) {
                  speakSection('en-US', htmlContent);
                }
              } else {
                Tts.stop();
              }
            }}
            style={[
              styles.playButton,
              {
                backgroundColor: 'white',
              },
            ]}>
            <FontAwesome
              name={!speechingMode ? 'play' : 'pause'}
              size={30}
              color={PRIMARY_COLOR}
            />
          </TouchableOpacity>
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
                <View style={styles.avatar}>
                  {/** 3rd image will be display here */}
                  {article?.likedUsers && article?.likedUsers.length >= 3 ? (
                    <Image
                      source={{
                        uri: article?.likedUsers[
                          article?.likedUsers.length - 1
                        ].Profile_image.startsWith('https')
                          ? article?.likedUsers[article?.likedUsers.length - 1]
                              .Profile_image
                          : `${GET_STORAGE_DATA}/${
                              article?.likedUsers[
                                article?.likedUsers.length - 1
                              ].Profile_image
                            }`,
                      }}
                      style={[
                        styles.profileImage,
                        !article?.likedUsers[2].Profile_image && {
                          borderWidth: 0.5,
                          borderColor: 'black',
                        },
                      ]}
                    />
                  ) : (
                    <>
                      {article?.likedUsers &&
                        article?.likedUsers.length >= 1 && (
                          <Image
                            source={{
                              uri: article?.likedUsers[
                                article?.likedUsers.length - 1
                              ].Profile_image.startsWith('https')
                                ? article?.likedUsers[
                                    article?.likedUsers.length - 1
                                  ].Profile_image
                                : `${GET_STORAGE_DATA}/${
                                    article?.likedUsers[
                                      article?.likedUsers.length - 1
                                    ].Profile_image
                                  }`,
                            }}
                            style={[
                              styles.profileImage,
                              !article?.likedUsers[
                                article?.likedUsers.length - 1
                              ].Profile_image && {
                                borderWidth: 0.5,
                                borderColor: 'black',
                              },
                            ]}
                          />
                        )}
                    </>
                  )}
                </View>
                <View style={[styles.avatar, styles.avatarOverlap]}>
                  {/** 2nd image will be display here */}

                  {article?.likedUsers && article?.likedUsers.length >= 2 ? (
                    <Image
                      source={{
                        uri: article?.likedUsers[
                          article?.likedUsers.length - 2
                        ].Profile_image.startsWith('https')
                          ? article?.likedUsers[article?.likedUsers.length - 2]
                              .Profile_image
                          : `${GET_STORAGE_DATA}/${
                              article?.likedUsers[
                                article?.likedUsers.length - 2
                              ].Profile_image
                            }`,
                      }}
                      style={[
                        styles.profileImage,
                        !article?.likedUsers[article?.likedUsers.length - 2]
                          .Profile_image && {
                          borderWidth: 0.5,
                          borderColor: 'black',
                        },
                      ]}
                    />
                  ) : (
                    <>
                      {article?.likedUsers &&
                        article?.likedUsers.length >= 1 && (
                          <Image
                            source={{
                              uri: article?.likedUsers[
                                article?.likedUsers.length - 1
                              ].Profile_image.startsWith('https')
                                ? article?.likedUsers[
                                    article?.likedUsers.length - 1
                                  ].Profile_image
                                : `${GET_STORAGE_DATA}/${
                                    article?.likedUsers[
                                      article?.likedUsers.length - 1
                                    ].Profile_image
                                  }`,
                            }}
                            style={[
                              styles.profileImage,
                              !article?.likedUsers[
                                article?.likedUsers.length - 1
                              ].Profile_image && {
                                borderWidth: 0.5,
                                borderColor: 'black',
                              },
                            ]}
                          />
                        )}
                    </>
                  )}
                </View>
                <View style={[styles.avatar, styles.avatarDoubleOverlap]}>
                  {/** 1st Image  will be display here */}
                  {article?.likedUsers && article?.likedUsers.length >= 1 && (
                    <Image
                      source={{
                        uri: article?.likedUsers[0].Profile_image.startsWith(
                          'https',
                        )
                          ? article?.likedUsers[0].Profile_image
                          : `${GET_STORAGE_DATA}/${article?.likedUsers[0].Profile_image}`,
                      }}
                      style={[
                        styles.profileImage,
                        !article?.likedUsers[0].Profile_image && {
                          borderWidth: 0.5,
                          borderColor: 'black',
                        },
                      ]}
                    />
                  )}
                </View>
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
                //width: '99%',
                minHeight: webviewHeight - 2500,
                // flex:7,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              ref={webViewRef}
              originWhitelist={['*']}
              injectedJavaScript={cssCode}
              source={{html: htmlContent ? htmlContent : noDataHtml}}
              textZoom={100}
            />
          </View>
        </View>

        <View style={{padding: wp(4), marginTop: hp(4.5)}}>
          {comments?.map((item, index) => (
            <CommentItem
              key={index}
              item={item}
              isSelected={selectedCommentId === item._id}
              userId={user_id}
              setSelectedCommentId={setSelectedCommentId}
              handleEditAction={()=>{
                //handleEditAction
              }}
              deleteAction={handleDeleteAction}
              handleLikeAction={handleLikeAction}
              commentLikeLoading={commentLikeLoading}
              handleMentionClick={handleMentionClick}
              handleReportAction={handleReportAction}
              isFromArticle={true}
            />
          ))}
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
              //  if (article && article?.authorId) {
              navigation.navigate('UserProfileScreen', {
                authorId: authorId,
                author_handle: undefined,
              });
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
              {article?.authorId.followers
                ? article?.authorId.followers.length > 1
                  ? `${article?.authorId.followers.length} followers`
                  : `${article?.authorId.followers.length} follower`
                : '0 follower'}
            </Text>
            {article &&
              article.contributors &&
              article.contributors.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    //   dispatch(setSocialUserId(''));
                    navigation.navigate('SocialScreen', {
                      type: 3,
                      articleId: Number(article?._id),
                      social_user_id: undefined,
                    });
                  }}>
                  <Text style={styles.contributorTextStyle}>
                    See all contributors
                  </Text>
                </TouchableOpacity>
              )}
          </View>
        </View>
        {article &&
          user_id !== article.authorId._id &&
          (updateFollowMutation.isPending ? (
            <ActivityIndicator size={40} color={PRIMARY_COLOR} />
          ) : (
            <TouchableOpacity
              style={styles.followButton}
              onPress={handleFollow}>
              <Text style={styles.followButtonText}>
                {article.authorId.followers &&
                article.authorId.followers.some(user => user._id === user_id)
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
    right: 70,
    borderRadius: 50,
  },

  playButton: {
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

  commentsList: {
    flex: 1,
    marginBottom: 20,
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
  contributorTextStyle: {
    fontWeight: '500',
    color: PRIMARY_COLOR,
    marginTop: hp(0.5),
    fontSize: 14,
  },
});
