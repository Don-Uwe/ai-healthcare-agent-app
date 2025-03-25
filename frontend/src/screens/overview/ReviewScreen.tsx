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
  FlatList,
  Pressable,
} from 'react-native';
import React, {FC, useEffect, useRef, useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {
  BUTTON_COLOR,
  ON_PRIMARY_COLOR,
  PRIMARY_COLOR,
} from '../../helper/Theme';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ArticleData, ReviewScreenProp, User} from '../../type';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {useDispatch, useSelector} from 'react-redux';
import WebView from 'react-native-webview';
import {hp, wp} from '../../helper/Metric';
import {
  GET_ARTICLE_BY_ID,
  GET_PROFILE_API,
  GET_STORAGE_DATA,
} from '../../helper/APIUtils';
import axios from 'axios';

//import io from 'socket.io-client';

import {useSocket} from '../../../SocketContext';
//import CommentScreen from '../CommentScreen';
import {
  MentionSuggestionsProps,
  replaceMentionValues,
} from 'react-native-controlled-mentions';
import CommentItem from '../../components/CommentItem';
import {setUserHandle} from '../../store/UserSlice';
import {actions, RichEditor, RichToolbar} from 'react-native-pell-rich-editor';
import {
  createFeebackHTMLStructure,
  createHTMLStructure,
  StatusEnum,
} from '../../helper/Utils';
import ReviewItem from '../../components/ReviewItem';

const ReviewScreen = ({navigation, route}: ReviewScreenProp) => {
  const insets = useSafeAreaInsets();
  const {articleId, authorId} = route.params;
  const {user_token} = useSelector((state: any) => state.user);
  const RichText = useRef();
  const [feedback, setFeedback] = useState('');
  const [webviewHeight, setWebViewHeight] = useState(0);

  const socket = useSocket();
  const dispatch = useDispatch();

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const flatListRef = useRef<FlatList<Comment>>(null);
  const [selectedCommentId, setSelectedCommentId] = useState<string>('');
  const [editMode, setEditMode] = useState<Boolean>(false);
  const [editCommentId, setEditCommentId] = useState<string | null>(null);
  const [commentLoading, setCommentLoading] = useState<Boolean>(false);
  const [commentLikeLoading, setCommentLikeLoading] = useState<Boolean>(false);
  const [mentions, setMentions] = useState<User[]>([]);

  const webViewRef = useRef<WebView>(null);

  function handleHeightChange(_height) {
    // console.log("editor height change:", height);
  }

  function editorInitializedCallback() {
    RichText.current?.registerToolbar(function (_items) {
      // items contain all the actions that are currently active
      // console.log(
      //   'Toolbar click, selected items (insert end callback):',
      //   items,
      // );
    });
  }
  const {data: article} = useQuery({
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

  if (user) {
    dispatch(setUserHandle(user.user_handle));
  }

  useEffect(() => {
    socket.emit('load-review-comments', {articleId: route.params.articleId});

    socket.on('connect', () => {
      console.log('connection established');
    });

    socket.on('error', data => {
      console.log('connection error', data);
    });

    socket.on('review-comments', data => {
      console.log('comment loaded');
      if (data.articleId === route.params.articleId) {
        setComments(data.comments);
      }
    });

    // Listen for new comments
    socket.on('new-feedback', data => {
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

    return () => {
      socket.off('review-comments');
      socket.off('new-feedback');
      socket.off('error');
    };
  }, [socket, route.params.articleId]);

  const commentTests = [
    {
      _id: '1',
      id: '1',
      articleId: 101,
      userId: {_id: 'u1', name: 'Author', email: 'author@example.com'},
      content:
        '<h4>Thank you for your feedback! I will make the changes you suggested.</h4>',
      createdAt: '2025-03-20T10:00:00Z',
      updatedAt: '2025-03-20T10:00:00Z',
      parentCommentId: '',
      replies: [],
      likedUsers: [],
      status: 'published',
      isEdited: false,
      isReview: false,
      isNote: false,
    },
    {
      _id: '2',
      id: '2',
      articleId: 101,
      userId: {_id: 'u2', name: 'Moderator', email: 'moderator@example.com'},
      content:
        '<h4>The article looks good, but there are a few areas that need clarification regarding your <strong>main argument</strong> in the second section.</h4>',
      createdAt: '2025-03-20T10:15:00Z',
      updatedAt: '2025-03-20T10:15:00Z',
      parentCommentId: '',
      replies: [],
      likedUsers: [],
      status: 'review',
      isEdited: false,
      isReview: true,
      isNote: false,
    },
    {
      _id: '3',
      id: '3',
      articleId: 101,
      userId: {_id: 'u1', name: 'Author', email: 'author@example.com'},
      content:
        '<h4>I see, I will rework that section to make my argument clearer. I’ll also provide more <em>evidence</em> to support my points.</h4>',
      createdAt: '2025-03-20T10:30:00Z',
      updatedAt: '2025-03-20T10:30:00Z',
      parentCommentId: '2',
      replies: [],
      likedUsers: [],
      status: 'published',
      isEdited: false,
      isReview: false,
      isNote: false,
    },
    {
      _id: '4',
      id: '4',
      articleId: 101,
      userId: {_id: 'u2', name: 'Moderator', email: 'moderator@example.com'},
      content:
        '<h4>Great! Make sure to provide more context on the <strong>statistics</strong> you used. The readers might need additional clarification on how the data supports your claim.</h4>',
      createdAt: '2025-03-20T10:45:00Z',
      updatedAt: '2025-03-20T10:45:00Z',
      parentCommentId: '3',
      replies: [],
      likedUsers: [],
      status: 'review',
      isEdited: false,
      isReview: true,
      isNote: false,
    },
    {
      _id: '5',
      id: '5',
      articleId: 101,
      userId: {_id: 'u1', name: 'Author', email: 'author@example.com'},
      content:
        '<h4>Understood! I’ll work on providing more context for the statistics. Thanks again for the constructive feedback.</h4>',
      createdAt: '2025-03-20T11:00:00Z',
      updatedAt: '2025-03-20T11:00:00Z',
      parentCommentId: '4',
      replies: [],
      likedUsers: [],
      status: 'published',
      isEdited: false,
      isReview: false,
      isNote: false,
    },
    {
      _id: '6',
      id: '6',
      articleId: 101,
      userId: {_id: 'u2', name: 'Moderator', email: 'moderator@example.com'},
      content:
        "<h4>You're welcome! Once you make those changes, the article will be much clearer. Looking forward to seeing the updated version!</h4>",
      createdAt: '2025-03-20T11:15:00Z',
      updatedAt: '2025-03-20T11:15:00Z',
      parentCommentId: '5',
      replies: [],
      likedUsers: [],
      status: 'review',
      isEdited: false,
      isReview: true,
      isNote: false,
    },
  ];

  useEffect(() => {
    if (article) {
      let source = article?.content?.endsWith('.html')
        ? {uri: `${GET_STORAGE_DATA}/${article.content}`}
        : {html: article?.content};

      const fetchContentLength = async () => {
        const length = await getContentLength(source);
        console.log('Content Length:', length);

        //setWebViewHeight(length * 1.2); //Add some buffer to the height calculation
        setWebViewHeight(length);
      };

      fetchContentLength();
    }
  }, [article]);

  // console.log('author id', authorId);

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

  const contentSource = article?.content?.endsWith('.html')
    ? {uri: `${GET_STORAGE_DATA}/${article.content}`}
    : {html: article?.content};

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

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
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

          {article?.status !== StatusEnum.DISCARDED && (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('ArticleDescriptionScreen', {
                  article: article,
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
            <WebView
              style={{
                padding: 7,
                //width: '99%',
                minHeight: webviewHeight,
                // flex:7,
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
        {article?.status !== StatusEnum.DISCARDED &&
          article?.reviewer_id !== null && (
            <View style={styles.inputContainer}>
              <RichToolbar
                style={[styles.richBar]}
                editor={RichText}
                disabled={false}
                iconTint={'white'}
                selectedIconTint={'black'}
                disabledIconTint={'purple'}
                iconSize={30}
                actions={[
                  actions.setBold,
                  actions.setItalic,
                  actions.setUnderline,
                  actions.setStrikethrough,
                  actions.heading1,
                  actions.heading2,
                  actions.heading3,
                  actions.heading4,
                  actions.heading5,
                  actions.heading6,
                  actions.alignLeft,
                  actions.alignCenter,
                  actions.alignRight,
                  actions.insertBulletsList,
                  actions.insertOrderedList,
                  actions.insertLink,
                  actions.table,
                  actions.undo,
                  actions.redo,
                  actions.blockquote,
                ]}
                iconMap={{
                  [actions.setStrikethrough]: ({tintColor}) => (
                    <FontAwesome
                      name="strikethrough"
                      color={tintColor}
                      size={26}
                    />
                  ),
                  [actions.alignLeft]: ({tintColor}) => (
                    <Feather name="align-left" color={tintColor} size={35} />
                  ),
                  [actions.alignCenter]: ({tintColor}) => (
                    <Feather name="align-center" color={tintColor} size={35} />
                  ),
                  [actions.alignRight]: ({tintColor}) => (
                    <Feather name="align-right" color={tintColor} size={35} />
                  ),
                  [actions.undo]: ({tintColor}) => (
                    <Ionicons name="arrow-undo" color={tintColor} size={35} />
                  ),
                  [actions.redo]: ({tintColor}) => (
                    <Ionicons name="arrow-redo" color={tintColor} size={35} />
                  ),
                  [actions.heading1]: ({tintColor}) => (
                    <Text style={[styles.tib, {color: tintColor}]}>H1</Text>
                  ),
                  [actions.heading2]: ({tintColor}) => (
                    <Text style={[styles.tib, {color: tintColor}]}>H2</Text>
                  ),
                  [actions.heading3]: ({tintColor}) => (
                    <Text style={[styles.tib, {color: tintColor}]}>H3</Text>
                  ),
                  [actions.heading4]: ({tintColor}) => (
                    <Text style={[styles.tib, {color: tintColor}]}>H4</Text>
                  ),
                  [actions.heading5]: ({tintColor}) => (
                    <Text style={[styles.tib, {color: tintColor}]}>H5</Text>
                  ),
                  [actions.heading6]: ({tintColor}) => (
                    <Text style={[styles.tib, {color: tintColor}]}>H6</Text>
                  ),
                  [actions.blockquote]: ({tintColor}) => (
                    <Entypo name="quote" color={tintColor} size={35} />
                  ),
                }}
              />
              <RichEditor
                disabled={false}
                containerStyle={styles.editor}
                ref={RichText}
                style={styles.rich}
                placeholder={'Start conversation with admin'}
                initialContentHTML={feedback}
                onChange={text => setFeedback(text)}
                editorInitializedCallback={editorInitializedCallback}
                onHeightChange={handleHeightChange}
                initialHeight={300}
              />

              {feedback.length > 0 && (
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={() => {
                    // emit socket event for feedback
                    const ans = createFeebackHTMLStructure(feedback);
                    socket.emit('add-review-comment', {
                      articleId: article?._id,
                      reviewer_id: article?.reviewer_id,
                      feedback: ans,
                      isReview: false,
                      isNote: true,
                    });
                  }}>
                  <Text style={styles.submitButtonText}>Post</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

        {article?.reviewer_id === null ? (
          <View style={{padding: wp(6), marginTop: hp(4.5)}}>
            <Text style={{...styles.authorName, marginBottom:5}}> Test Conversations</Text>
            {commentTests?.map((item, index) => (
              <ReviewItem key={index} item={item} />
            ))}
          </View>
        ):(
          <View style={{padding: wp(6), marginTop: hp(4.5)}}>
          {comments?.map((item, index) => (
            <ReviewItem key={index} item={item} />
          ))}
        </View> 
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
    //borderRadius: 8,
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
    height: 300,
    overflow: 'hidden',
    //backgroundColor: 'red',
    //padding: hp(1),
    borderColor: '#000',
    borderWidth: 0.5,
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
    backgroundColor: BUTTON_COLOR,
    marginTop: 0,
    marginBottom: hp(0.8),
  },
});
