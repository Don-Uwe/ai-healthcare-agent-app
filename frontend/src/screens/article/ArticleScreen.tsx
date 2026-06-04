import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  Dimensions,
  Share,
  useColorScheme,
} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {PRIMARY_COLOR} from '../../helper/Theme';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ArticleData, ArticleScreenProp} from '../../type';
import {useDispatch, useSelector} from 'react-redux';
import {hp} from '../../helper/Metric';
import {GET_IMAGE, GET_STORAGE_DATA} from '../../helper/APIUtils';
import Loader from '../../components/Loader';
import Snackbar from 'react-native-snackbar';

import {
  formatCount,
  handleExternalClick,
  retrieveItem,
  StatusEnum,
  storeItem,
} from '../../helper/Utils';
//import CommentScreen from '../CommentScreen';
import Tts from 'react-native-tts';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import {setUserHandle} from '../../store/UserSlice';
import {FontAwesome5} from '@expo/vector-icons';
import AutoHeightWebView from '@brown-bear/react-native-autoheight-webview';
import LottieView from 'lottie-react-native';

import {useGetArticleDetails} from '@/src/hooks/useGetArticleDetail';
import {useGetArticleContent} from '@/src/hooks/useGetArticleContent';
import {useGetProfile} from '@/src/hooks/useGetProfile';
import {useLikeArticle} from '@/src/hooks/useLikeArticle';
import {useUpdateFollowStatusByArticle} from '@/src/hooks/useUpdateFollowStatus';
import {useUpdateReadEvent} from '@/src/hooks/useUpdateReadEvent';
import {useUpdateViewCount} from '@/src/hooks/useUpdateViewCount';
import {useSaveArticle} from '@/src/hooks/useSaveArticle';
import {useSocket} from '../../contexts/SocketContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const CHUNK_SIZE = 120;

const ArticleScreen = ({navigation, route}: ArticleScreenProp) => {
  const {articleId, authorId, recordId} = route.params;
  const {user_id, isGuest} = useSelector((state: any) => state.user);
  const isDarkMode = useColorScheme() === 'dark';
  const [readEventSave, setReadEventSave] = useState(false);
  const [fontScale, setFontScale] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.5);
  const [playerVisible, setPlayerVisible] = useState(false);
  const chunkIndexRef = useRef(0);
  const wordsRef = useRef<string[]>([]);

  const {mutate: followMutation, isPending: followMutationPending} =
    useUpdateFollowStatusByArticle();

  const {mutate: updateReadEvent} = useUpdateReadEvent(articleId);

  const {mutate: updateViewCount} = useUpdateViewCount(articleId ?? 0);

  const socket = useSocket();
  const dispatch = useDispatch();

  const {data: user} = useGetProfile();
  const {
    data: article,
    isLoading: articleLoading,
    refetch,
  } = useGetArticleDetails(articleId);

  const resolvedRecordId = article?.pb_recordId || recordId;
  const {data: articleContent} = useGetArticleContent(resolvedRecordId);

  const {mutate: likeMutation, isPending: likeMutationPending} = useLikeArticle(
    Number(articleId),
  );

  const {mutate: saveMutation, isPending: saveMutationPending} = useSaveArticle(
    Number(articleId),
  );

  const FONT_SCALE_KEY = 'article_font_scale';
  const FONT_SCALE_MIN = 0.8;
  const FONT_SCALE_MAX = 1.6;
  const FONT_SCALE_STEP = 0.1;
  const BASE_FONT_SIZE = 16;

  const likedUsers = article?.likedUsers ?? [];
  const totalLikes = likedUsers.length;

  const clampFontScale = (value: number) =>
    Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, value));

  const persistFontScale = async (value: number) => {
    try {
      await storeItem(FONT_SCALE_KEY, value.toFixed(2));
    } catch (error) {
      console.error('Failed to persist font scale:', error);
    }
  };

  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedPersistFontScale = useCallback(
    debounce(persistFontScale, 300),
    [],
  );

  const handleDecreaseFont = () => {
    const nextValue = clampFontScale(fontScale - FONT_SCALE_STEP);
    setFontScale(nextValue);
    debouncedPersistFontScale(nextValue);
  };

  const handleIncreaseFont = () => {
    const nextValue = clampFontScale(fontScale + FONT_SCALE_STEP);
    setFontScale(nextValue);
    debouncedPersistFontScale(nextValue);
  };

  useEffect(() => {
    if (!isGuest) {
      updateViewCount(articleId, {
        onError: error => {
          console.log('Update View Count Error', error);
        },
      });
    }
    return () => {
      setIsPlaying(false);
      setIsPaused(false);
      setPlayerVisible(false);
      Tts.stop();
      Tts.removeAllListeners('tts-finish');
      Tts.removeAllListeners('tts-error');
    };
  }, [articleId, isGuest, updateViewCount]);

  useEffect(() => {
    refetch();
  }, [articleId, refetch]);

  const noDataHtml = '<p>No Data found</p>';

  useEffect(() => {
    if (user) {
      dispatch(setUserHandle(user.user_handle));
    }
  }, [dispatch, user]);

  useEffect(() => {
    let isMounted = true;

    const loadFontScale = async () => {
      try {
        const storedValue = await retrieveItem(FONT_SCALE_KEY);
        if (!isMounted || !storedValue) return;

        const parsed = Number(storedValue);
        if (!Number.isNaN(parsed)) {
          setFontScale(clampFontScale(parsed));
        }
      } catch (error) {
        console.error('Failed to load font scale:', error);
      }
    };

    loadFontScale();

    return () => {
      isMounted = false;
    };
  }, []);

  // --- Settings ---
  const handleLike = () => {
    if (isGuest) {
      navigation.navigate('GuestPlaceholderScreen', {
        title: 'Sign In Required',
        description: 'Please sign in or sign up to like this article.',
        iconName: 'heart',
      });
      return;
    }
    if (article) {
      likeMutation(undefined, {
        onSuccess: (data: {article: ArticleData; likeStatus: boolean}) => {
          if (data?.likeStatus && socket) {
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
        onError: (err: any) => {
          console.log('error', err);
          Snackbar.show({
            text: 'Something went wrong, try again!',
            duration: Snackbar.LENGTH_LONG,
          });
        },
      });
    } else {
      Alert.alert('Article not found');
    }
  };

  const handleFollow = () => {
    if (isGuest) {
      navigation.navigate('GuestPlaceholderScreen', {
        title: 'Sign In Required',
        description: 'Please sign in or sign up to follow this author.',
        iconName: 'user-plus',
      });
      return;
    }
    //  updateFollowMutation.mutate();

    followMutation(articleId.toString(), {
      onSuccess: data => {
        //console.log('follow success');
        if (data && socket) {
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
        Snackbar.show({
          text: 'Something went wrong, Try again!',
          duration: Snackbar.LENGTH_SHORT,
        });
      },
    });
  };

  const handleSave = () => {
    if (isGuest) {
      navigation.navigate('GuestPlaceholderScreen', {
        title: 'Sign In Required',
        description: 'Please sign in or sign up to save this article.',
        iconName: 'bookmark',
      });
      return;
    }
    if (article) {
      saveMutation(undefined, {
        onSuccess: () => {
          refetch();
          Snackbar.show({
            text: article.savedUsers?.includes(user_id)
              ? 'Article removed from saved'
              : 'Article saved successfully!',
            duration: Snackbar.LENGTH_SHORT,
          });
        },
        onError: (err: any) => {
          console.log('error', err);
          Snackbar.show({
            text: 'Something went wrong, try again!',
            duration: Snackbar.LENGTH_LONG,
          });
        },
      });
    } else {
      Alert.alert('Article not found');
    }
  };

  const handleTranslateArticle = () => {
    if (isGuest) {
      navigation.navigate('GuestPlaceholderScreen', {
        title: 'Sign In Required',
        description: 'Please sign in or sign up to translate this article.',
        iconName: 'translate',
      });
      return;
    }
    if (!article) {
      Alert.alert('Article not found');
      return;
    }

    if (!articleContent) {
      Snackbar.show({
        text: 'Article content is still loading. Please try again.',
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }

    navigation.navigate('ArticleDescriptionScreen', {
      article,
      htmlContent: articleContent,
      translationSource: {
        sourceArticleId: article._id,
        sourceArticleRecordId: article.pb_recordId || recordId || '',
        sourceLanguage: article.language || 'en-IN',
        sourceTitle: article.title,
      },
    });
  };

  const handleImproveArticle = () => {
    if (isGuest) {
      navigation.navigate('GuestPlaceholderScreen', {
        title: 'Sign In Required',
        description: 'Please sign in or sign up to improve this article.',
        iconName: 'auto-fix',
      });
      return;
    }
    if (!article) {
      Alert.alert('Article not found');
      return;
    }
    if (!articleContent) {
      Snackbar.show({
        text: 'Article content is still loading. Please try again.',
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }
    navigation.navigate('EditorScreen', {
      title: article.title,
      description: article.description,
      selectedGenres: article.tags,
      imageUtils: article.imageUtils[0],
      articleData: article,
      requestId: undefined,
      pb_record_id: article.pb_recordId,
      authorName: user?.user_handle ?? '',
      htmlContent: articleContent,
      language: article.language,
    });
  };

  async function convertHtmlToPlainText(html: string) {
    let modifiedHtml = html.replace(/ style="[^"]*"/g, '');

    modifiedHtml = modifiedHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/g, '');

    modifiedHtml = modifiedHtml.replace(/&nbsp;/g, ' ');

    let plainText = modifiedHtml.replace(/<[^>]*>/g, '');

    return plainText;
  }

  const ensureLanguageInstalled = async (lang: string) => {
    Snackbar.show({
      text: `Checking if language ${lang} is installed.`,
      duration: Snackbar.LENGTH_SHORT,
    });
    const voices = await Tts.voices();

    const voice = voices.find(v => v.language === lang && !v.notInstalled);

    if (voice) {
      await Tts.setDefaultVoice(voice.id);
      return true;
    }

    if (Platform.OS === 'android') {
      Tts.requestInstallData();
    }

    return false;
  };

  const speakNextChunk = () => {
    const words = wordsRef.current;
    const chunkIndex = chunkIndexRef.current;
    if (chunkIndex >= words.length) {
      // All chunks spoken — hide the floating player and reset state
      setIsPlaying(false);
      setIsPaused(false);
      setPlayerVisible(false);
      Tts.removeAllListeners('tts-finish');
      Tts.removeAllListeners('tts-error');
      return;
    }
    const chunk = words.slice(chunkIndex, chunkIndex + CHUNK_SIZE).join(' ');
    chunkIndexRef.current = chunkIndex + CHUNK_SIZE;
    Tts.speak(chunk);
  };

  const speakSection = async (_language = 'en-IN', content: string) => {
    try {
      await Tts.stop();
      Tts.removeAllListeners('tts-finish');
      Tts.removeAllListeners('tts-error');

      const ready = await ensureLanguageInstalled(_language);
      if (!ready) return;

      await Tts.setDefaultLanguage(_language);
      Tts.setDefaultPitch(1.0);
      Tts.setDefaultRate(speechRate);

      const plainText = await convertHtmlToPlainText(content);
      if (!plainText) return;

      const words = plainText.trim().split(/\s+/);
      wordsRef.current = words;
      chunkIndexRef.current = 0;

      Tts.addEventListener('tts-finish', speakNextChunk);
      Tts.addEventListener('tts-error', e => {
        console.log('TTS Error:', e);
        setIsPlaying(false);
        setIsPaused(false);
        setPlayerVisible(false);
      });

      setIsPlaying(true);
      setIsPaused(false);
      setPlayerVisible(true);
      speakNextChunk();
    } catch (error) {
      console.log('TTS Error:', error);
      setIsPlaying(false);
      setIsPaused(false);
      setPlayerVisible(false);
    }
  };

  const handleTtsPlay = () => {
    if (articleContent) {
      const language = article?.language || 'en-IN';
      speakSection(language, articleContent);
    }
  };

  const handleTtsPause = async () => {
    try {
      if (isPaused) {
        // Resume
        setIsPlaying(true);
        setIsPaused(false);
        // Step back one chunk to resume from the interrupted chunk
        chunkIndexRef.current = Math.max(0, chunkIndexRef.current - CHUNK_SIZE);
        
        // Re-attach listeners
        Tts.addEventListener('tts-finish', speakNextChunk);
        Tts.addEventListener('tts-error', e => {
          console.log('TTS Error:', e);
          setIsPlaying(false);
          setIsPaused(false);
          setPlayerVisible(false);
        });
        
        speakNextChunk();
      } else {
        // Pause
        Tts.removeAllListeners('tts-finish');
        Tts.removeAllListeners('tts-error');
        await Tts.stop();
        setIsPlaying(false);
        setIsPaused(true);
      }
    } catch (e) {
      console.log('TTS Pause/Resume Error:', e);
    }
  };

  const handleTtsStop = async () => {
    try {
      await Tts.stop();
      Tts.removeAllListeners('tts-finish');
      Tts.removeAllListeners('tts-error');
      wordsRef.current = [];
      chunkIndexRef.current = 0;
      setIsPlaying(false);
      setIsPaused(false);
      setPlayerVisible(false);
    } catch (e) {
      console.log('TTS Stop Error:', e);
    }
  };

  const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5];
  const SPEED_LABELS: Record<number, string> = {
    0.5: '0.5x',
    0.75: '0.75x',
    1.0: '1x',
    1.25: '1.25x',
    1.5: '1.5x',
  };

  const handleSpeedChange = () => {
    const currentIndex = SPEED_OPTIONS.indexOf(speechRate);
    const nextRate = SPEED_OPTIONS[(currentIndex + 1) % SPEED_OPTIONS.length];
    setSpeechRate(nextRate);
    Tts.setDefaultRate(nextRate);
    // Restart current position with new speed if currently playing
    if (isPlaying && !isPaused) {
      Tts.removeAllListeners('tts-finish');
      Tts.removeAllListeners('tts-error');
      // Step back one chunk so we replay current chunk at new speed
      // Note: Rewind is approximate and might read earlier parts of a smaller previous chunk.
      chunkIndexRef.current = Math.max(0, chunkIndexRef.current - CHUNK_SIZE);
      Tts.stop().then(() => {
        Tts.addEventListener('tts-finish', speakNextChunk);
        Tts.addEventListener('tts-error', e => {
          console.log('TTS Error:', e);
          setIsPlaying(false);
          setIsPaused(false);
          setPlayerVisible(false);
        });
        speakNextChunk();
      });
    }
  };

  if (articleLoading) {
    return <Loader />;
  }

  const articleFontSize = BASE_FONT_SIZE * fontScale;
  const articleCustomStyle = `
    body { font-family: 'Times New Roman'; font-size: ${articleFontSize}px; line-height: 1.6; }
    p, li { font-size: ${articleFontSize}px; }
    img, video, iframe { max-width: 100%; height: auto; }
  `;

  const footerColors = {
    background: isDarkMode ? '#111827' : '#ffffff',
    border: isDarkMode ? '#1f2937' : '#E5E5E5',
    pillBackground: isDarkMode ? '#1f2937' : '#F3F4F6',
    activePillBackground: isDarkMode ? '#3b82f6' : '#EFF6FF',
    text: isDarkMode ? '#d1d5db' : '#4b5563',
    activeText: PRIMARY_COLOR,
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.imageContainer}>
        {article && article?.imageUtils && article?.imageUtils.length > 0 ? (
          <Image
            source={{
              uri: article?.imageUtils[0].startsWith('http')
                ? article?.imageUtils[0]
                : `${GET_IMAGE}/${article?.imageUtils[0]}`,
            }}
            style={styles.image}
          />
        ) : (
          <Image
            source={require('../../assets/images/no_results.jpg')}
            style={styles.image}
          />
        )}
        {likeMutationPending ? (
          <LoadingSpinner size={40} />
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
            if (playerVisible) {
              handleTtsStop();
            } else {
              handleTtsPlay();
            }
          }}
          style={[
            styles.playButton,
            {
              backgroundColor: 'white',
            },
          ]}>
          <FontAwesome5
            name={'headphones'}
            size={30}
            color={playerVisible ? PRIMARY_COLOR : 'black'}
          />
        </TouchableOpacity>

        {isPlaying && (
          <View style={styles.botContainer}>
            <LottieView
              source={require('../../assets/LottieAnimation/TalkBotAnimation.json')}
              autoPlay
              loop={isPlaying}
              style={{width: 200, height: 200}}
            />
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        onScroll={e => {
          let windowHeight = Dimensions.get('window').height,
            height = e.nativeEvent.contentSize.height,
            offset = e.nativeEvent.contentOffset.y;
          if (windowHeight + offset >= height) {
            if (
              article &&
              !readEventSave &&
              !isGuest &&
              article.status === StatusEnum.PUBLISHED
            ) {
              updateReadEvent(undefined, {
                onSuccess: () => {
                  console.log('Read Event Updated');
                  setReadEventSave(true);
                  Snackbar.show({
                    text: 'Your read status updated.',
                    duration: Snackbar.LENGTH_SHORT,
                  });
                },
                onError: err => {
                  console.log('Update Read Status mutation error', err);
                  Snackbar.show({
                    text: 'Failed to update your read status.',
                    duration: Snackbar.LENGTH_SHORT,
                  });
                },
              });
            }
          }
        }}
        contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.contentContainer}>
          {article && (
            <Text style={{...styles.viewText, marginBottom: 10}}>
              {article?.viewCount
                ? article.viewCount > 1
                : `${article.viewCount} view`}
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
              <View style={styles.fontSizeControls}>
                <Text style={styles.fontSizeLabel}>Text size</Text>
                <View style={styles.fontSizeButtons}>
                  <TouchableOpacity
                    onPress={handleDecreaseFont}
                    accessibilityRole="button"
                    accessibilityLabel="Decrease article font size"
                    hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                    style={styles.fontSizeButton}>
                    <Text style={styles.fontSizeButtonText}>A-</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleIncreaseFont}
                    accessibilityRole="button"
                    accessibilityLabel="Increase article font size"
                    hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                    style={styles.fontSizeButton}>
                    <Text style={styles.fontSizeButtonText}>A+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.avatarsContainer}>
                {totalLikes >= 3 && (
                  <View style={styles.avatar}>
                    <Image
                      source={{
                        uri: likedUsers[
                          totalLikes - 3
                        ].Profile_image.startsWith('https')
                          ? likedUsers[totalLikes - 3].Profile_image
                          : `${GET_STORAGE_DATA}/${likedUsers[totalLikes - 3].Profile_image}`,
                      }}
                      style={[
                        styles.profileImage,
                        !likedUsers[totalLikes - 3].Profile_image && {
                          borderWidth: 0.5,
                          borderColor: 'black',
                        },
                      ]}
                    />
                  </View>
                )}

                {totalLikes >= 2 && (
                  <View style={[styles.avatar, styles.avatarOverlap]}>
                    <Image
                      source={{
                        uri: likedUsers[
                          totalLikes - 2
                        ].Profile_image.startsWith('https')
                          ? likedUsers[totalLikes - 2].Profile_image
                          : `${GET_STORAGE_DATA}/${likedUsers[totalLikes - 2].Profile_image}`,
                      }}
                      style={styles.profileImage}
                    />
                  </View>
                )}

                {totalLikes >= 1 && (
                  <View style={[styles.avatar, styles.avatarDoubleOverlap]}>
                    <Image
                      source={{
                        uri: likedUsers[
                          totalLikes - 1
                        ].Profile_image.startsWith('https')
                          ? likedUsers[totalLikes - 1].Profile_image
                          : `${GET_STORAGE_DATA}/${likedUsers[totalLikes - 1].Profile_image}`,
                      }}
                      style={styles.profileImage}
                    />
                  </View>
                )}

                {totalLikes > 3 && (
                  <View style={[styles.avatar, styles.avatarTripleOverlap]}>
                    <Text style={styles.moreText}>+{totalLikes - 3}</Text>
                  </View>
                )}
              </View>
              <View style={styles.descriptionContainer}>
                <AutoHeightWebView
                  style={styles.webView}
                  customStyle={articleCustomStyle}
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
            </>
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, {backgroundColor: footerColors.background}]}>
        {/* Action Bar Row */}
        <View
          style={[
            styles.actionBarFooter,
            {borderBottomColor: footerColors.border},
          ]}>
          <TouchableOpacity
            style={[
              styles.actionButtonFooter,
              {
                backgroundColor:
                  article &&
                  article?.likedUsers &&
                  article?.likedUsers?.some(user => user._id === user_id)
                    ? footerColors.activePillBackground
                    : footerColors.pillBackground,
              },
            ]}
            onPress={handleLike}
            disabled={likeMutationPending}>
            {likeMutationPending ? (
              <LoadingSpinner size={18} />
            ) : (
              <>
                <FontAwesome
                  name="heart"
                  size={18}
                  color={
                    article &&
                    article?.likedUsers &&
                    article?.likedUsers?.some(user => user._id === user_id)
                      ? PRIMARY_COLOR
                      : footerColors.text
                  }
                />
                <Text
                  style={[
                    styles.actionTextFooter,
                    {
                      color:
                        article &&
                        article?.likedUsers &&
                        article?.likedUsers?.some(user => user._id === user_id)
                          ? PRIMARY_COLOR
                          : footerColors.text,
                    },
                  ]}>
                  {article?.likeCount ? formatCount(article.likeCount) : 0}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButtonFooter,
              {backgroundColor: footerColors.pillBackground},
            ]}
            onPress={() => {
              if (isGuest) {
                navigation.navigate('GuestPlaceholderScreen', {
                  title: 'Sign In Required',
                  description:
                    'Please sign in or sign up to view and post comments.',
                  iconName: 'comment',
                });
                return;
              }
              if (article) {
                navigation.navigate('CommentScreen', {
                  articleId: Number(article._id),
                  mentionedUsers: article.mentionedUsers,
                  article: article,
                });
              }
            }}>
            <MaterialCommunityIcons
              name="comment-outline"
              size={18}
              color={footerColors.text}
            />
            <Text style={[styles.actionTextFooter, {color: footerColors.text}]}>
              Comment
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButtonFooter,
              {backgroundColor: footerColors.pillBackground},
            ]}
            onPress={async () => {
              try {
                if (article) {
                  const result = await Share.share({
                    message: `Check out this article: ${article.title}\n\n${article.description}`,
                    title: article.title,
                  });

                  if (result.action === Share.sharedAction) {
                    Snackbar.show({
                      text: 'Article shared successfully!',
                      duration: Snackbar.LENGTH_SHORT,
                    });
                  }
                }
              } catch (error) {
                console.log('Error sharing:', error);
                Snackbar.show({
                  text: 'Failed to share article',
                  duration: Snackbar.LENGTH_SHORT,
                });
              }
            }}>
            <FontAwesome name="share" size={18} color={footerColors.text} />
            <Text style={[styles.actionTextFooter, {color: footerColors.text}]}>
              Share
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButtonFooter,
              {backgroundColor: footerColors.pillBackground},
            ]}
            onPress={handleTranslateArticle}>
            <MaterialCommunityIcons
              name="translate"
              size={18}
              color={footerColors.text}
            />
            <Text style={[styles.actionTextFooter, {color: footerColors.text}]}>
              Translate
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButtonFooter,
              {backgroundColor: footerColors.pillBackground},
            ]}
            onPress={handleImproveArticle}>
            <MaterialCommunityIcons
              name="auto-fix"
              size={18}
              color={footerColors.text}
            />
            <Text style={[styles.actionTextFooter, {color: footerColors.text}]}>
              Improve
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButtonFooter,
              {
                backgroundColor: article?.savedUsers?.includes(user_id)
                  ? footerColors.activePillBackground
                  : footerColors.pillBackground,
              },
            ]}
            onPress={handleSave}
            disabled={saveMutationPending}>
            {saveMutationPending ? (
              <LoadingSpinner size={18} />
            ) : (
              <>
                <Text
                  style={[
                    styles.actionTextFooter,
                    {
                      color: article?.savedUsers?.includes(user_id)
                        ? PRIMARY_COLOR
                        : footerColors.text,
                    },
                  ]}>
                  Save
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/*Improvement row */}

        {/* Author Row */}
        <View style={styles.authorRow}>
          <View style={styles.authorContainer}>
            <TouchableOpacity
              onPress={() => {
                if (isGuest) {
                  navigation.navigate('GuestPlaceholderScreen', {
                    title: 'Sign In Required',
                    description:
                      'Please sign in or sign up to view user profiles.',
                    iconName: 'user',
                  });
                  return;
                }
                navigation.navigate('UserProfileScreen', {
                  authorId: (article?.authorId as any)?._id || authorId,
                  author_handle: undefined,
                });
              }}>
              {(article?.authorId as any)?.Profile_image ? (
                <Image
                  source={{
                    uri: (article?.authorId as any).Profile_image.startsWith(
                      'http',
                    )
                      ? `${(article?.authorId as any).Profile_image}`
                      : `${GET_STORAGE_DATA}/${(article?.authorId as any).Profile_image}`,
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
                {(article?.authorId as any)?.followers
                  ? (article?.authorId as any).followers.length > 1
                    ? `${(article?.authorId as any).followers.length} followers`
                    : `${(article?.authorId as any).followers.length} follower`
                  : '0 follower'}
              </Text>
              {article &&
                article.contributors &&
                article.contributors.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      if (isGuest) {
                        navigation.navigate('GuestPlaceholderScreen', {
                          title: 'Sign In Required',
                          description:
                            'Please sign in or sign up to view all contributors.',
                          iconName: 'users',
                        });
                        return;
                      }
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
            user_id !== (article.authorId as any)?._id &&
            (followMutationPending ? (
              <LoadingSpinner size={40} />
            ) : (
              <TouchableOpacity
                style={styles.followButton}
                onPress={handleFollow}>
                <Text style={styles.followButtonText}>
                  {(article.authorId as any)?.followers &&
                  (article.authorId as any).followers.some(
                    (user: any) => user._id === user_id,
                  )
                    ? 'Following'
                    : 'Follow'}
                </Text>
              </TouchableOpacity>
            ))}
        </View>
      </View>
      {/* Floating TTS Media Player */}
      {playerVisible && (
        <View style={styles.ttsPlayerContainer}>
          <View style={styles.ttsPlayerInner}>
            {/* Speed button */}
            <TouchableOpacity
              style={styles.ttsSpeedButton}
              onPress={handleSpeedChange}>
              <Text style={styles.ttsSpeedText}>
                {SPEED_LABELS[speechRate]}
              </Text>
            </TouchableOpacity>

            {/* Play / Pause button — disabled if neither playing nor paused */}
            <TouchableOpacity
              style={[styles.ttsControlButton, (!isPlaying && !isPaused) && {opacity: 0.4}]}
              onPress={handleTtsPause}
              disabled={!isPlaying && !isPaused}>
              <FontAwesome5
                name={isPaused ? 'play' : 'pause'}
                size={18}
                color={PRIMARY_COLOR}
              />
            </TouchableOpacity>

            {/* Stop button */}
            <TouchableOpacity
              style={styles.ttsControlButton}
              onPress={handleTtsStop}>
              <FontAwesome5 name="stop" size={18} color={'#e53935'} />
            </TouchableOpacity>

            {/* Status label */}
            <Text style={styles.ttsStatusText}>
              {isPaused ? 'Paused' : isPlaying ? 'Playing...' : 'Stopped'}
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
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
    // marginTop: hp(4),
    borderBottomEndRadius: hp(2),
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  scrollViewContent: {
    marginBottom: 10,
    flexGrow: 0,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: 'hidden',
    zIndex: 4,
    elevation: 4,
  },
  image: {
    height: 200,
    width: '100%',
    objectFit: 'cover',
  },
  likeButton: {
    padding: 10,
    position: 'absolute',
    bottom: 4,
    right: 70,
    borderRadius: 50,
  },

  playButton: {
    padding: 10,
    position: 'absolute',
    bottom: 4,
    right: 15,
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
  fontSizeControls: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fontSizeLabel: {
    fontSize: 13,
    color: '#6C6C6D',
    fontWeight: '500',
  },
  fontSizeButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fontSizeButton: {
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#FFFFFF',
  },
  fontSizeButtonText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '600',
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
    position: 'relative',
    bottom: 0,
    zIndex: 10,
    borderTopEndRadius: 20,
    borderTopStartRadius: 20,
    paddingTop: 14,
    paddingBottom: 14,
    paddingHorizontal: 16,
  },
  actionBarFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    marginBottom: 12,
    gap: 8,
  },
  actionButtonFooter: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    gap: 3,
    minHeight: 52,
  },
  actionTextFooter: {
    fontSize: 10,
    fontWeight: '600',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorImage: {
    height: 40,
    width: 40,
    borderRadius: 40,
  },
  authorName: {
    fontWeight: '700',
    fontSize: 14,
  },
  authorFollowers: {
    fontWeight: '400',
    fontSize: 11,
  },
  followButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 12,
    borderRadius: 18,
    paddingVertical: 8,
  },
  followButtonText: {
    color: 'white',
    fontSize: 13,
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

  botContainer: {
    position: 'absolute',
    bottom: 60,
    right: 20,
    zIndex: 100,
  },
  ttsPlayerContainer: {
    position: 'absolute',
    bottom: 155,
    left: 12,
    right: 12,
    zIndex: 200,
    elevation: 12,
  },
  ttsPlayerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  ttsControlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ttsSpeedButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: PRIMARY_COLOR,
  },
  ttsSpeedText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
  },
  ttsStatusText: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
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
