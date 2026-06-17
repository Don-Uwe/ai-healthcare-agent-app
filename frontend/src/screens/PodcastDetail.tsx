import React, {useEffect, useState, useRef} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  View,
  Image,
  useWindowDimensions,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {PodcastDetailScreenProp} from '../type';
import {PRIMARY_COLOR} from '../helper/Theme';
import Slider from '@react-native-community/slider';
import {GlassStyles} from '../styles/GlassStyles';

import {useAudioPlayer} from 'expo-audio';

// GET_IMAGE is defined as `${PROD_URL}/getfile` (resolves to absolute URL: https://uhsocial.in/api/getfile).
// This absolute, securely-configured endpoint ensures that relative resource paths cannot access local device files via traversal.
import {GET_IMAGE} from '../helper/APIUtils';
import {useSelector} from 'react-redux';

import {downloadAudio, formatCount, StatusEnum} from '../helper/Utils';
import Snackbar from 'react-native-snackbar';
import AntDesign from '@expo/vector-icons/AntDesign';
import Share from 'react-native-share';
import {fp} from '../helper/Metric';
import {useSocket} from '../contexts/SocketContext';
import {Feather} from '@expo/vector-icons';
import Loader from '../components/Loader';
import LoadingSpinner from '../components/LoadingSpinner';
import {Theme, XStack, YStack, Text, ScrollView} from 'tamagui';
import LottieView from 'lottie-react-native';
import AudioWaveform from '../components/AudioWaveform';
import {useGetSinglePodcastDetails} from '../hooks/useGetSinglePodcastDetails';
import {useLikePodcast} from '../hooks/useLikePodcast';
import {getPlaybackPosition, savePlaybackPosition} from '../helper/PlaybackManager';

const isAllowedUrl = (urlStr?: string | null): boolean => {
  if (!urlStr) return false;
  if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
    // allow ONLY relative paths
    if (urlStr.includes('://')) return false;
    return true;
  }
  try {
    const match = urlStr.match(/^https?:\/\/([^/?#:]+)/i);
    if (!match) return false;
    const hostname = match[1].toLowerCase();
    return (
      hostname === 'uhsocial.in' ||
      hostname === 'localhost' ||
      hostname === '10.0.2.2'
    );
  } catch (e) {
    return false;
  }
};

const PodcastDetail = ({navigation, route}: PodcastDetailScreenProp) => {
  //const [progress, setProgress] = useState(10);
  // const insets = useSafeAreaInsets();
  const {trackId, audioUrl} = route.params;
 
  const {width, height} = useWindowDimensions();
  const isLandscape = width > height;
  const isTablet = width >= 768;
  const useSplitLayout = isLandscape || isTablet;

  const [playing, setIsPlaying] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const socket = useSocket();
  const {user_token, user_id, user_handle, isGuest} = useSelector(
    (state: any) => state.user,
  );
  const {isConnected} = useSelector((state: any) => state.network);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [networkPaused, setNetworkPaused] = useState(false);
  const [isWaitingForNetwork, setIsWaitingForNetwork] = useState(false);
  const [resumePosition, setResumePosition] = useState<number | null>(null);
  const resumeAttemptedRef = useRef(false);

  const [isLike, setLike] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const {data: podcast, refetch, isLoading: isPodcastLoading, isError: isPodcastError, error: podcastError} = useGetSinglePodcastDetails(trackId);
  const {mutate: likePodcast, isPending: likePodcastPending} = useLikePodcast();

  const defaultFallback = require('../../assets/sounds/funny-cartoon-sound-397415.mp3');

  const getFormattedSource = (url?: string | null) => {
    if (!url) return null;
    if (!isAllowedUrl(url)) {
      console.warn('Blocked untrusted media URL:', url);
      return null;
    }
    return url.startsWith('http') ? url : `${GET_IMAGE}/${url}`;
  };

  const initialSource = getFormattedSource(audioUrl) ?? defaultFallback;
  const [loadedSource, setLoadedSource] = useState<string | number>(initialSource);

  const isRemoteSource =
    typeof loadedSource === 'string' && loadedSource.startsWith('http');

  // only initialize once a valid uri exists
  const player = useAudioPlayer(initialSource);

  useEffect(() => {
    if (podcast?.audio_url) {
      const secureSource = getFormattedSource(podcast.audio_url);
      if (secureSource && secureSource !== loadedSource) {
        try {
          player.replace(secureSource);
          setLoadedSource(secureSource);
        } catch (err) {
          console.warn('Failed to replace player source:', err);
        }
      }
    }
  }, [podcast?.audio_url, player, loadedSource]);

  const saveCurrentPlaybackPosition = () => {
    const currentTime =
      player?.currentTime ?? player?.currentStatus?.currentTime ?? position;
    setResumePosition(currentTime);
    return currentTime;
  };

  const pauseForNetworkLoss = async () => {
    if (!player) return;
    saveCurrentPlaybackPosition();

    try {
      player.pause();
    } catch (err) {
      console.warn('Error pausing playback on network loss:', err);
    }

    setIsPlaying(false);
    setNetworkPaused(true);
    setIsWaitingForNetwork(true);
    resumeAttemptedRef.current = false;
  };

  const handlePlaybackError = async (error: unknown) => {
    const message =
      error instanceof Error ? error.message : String(error ?? 'Unknown error');
    const isNetworkError =
      !isConnected || /network|timeout|offline|connection|unreachable/i.test(message);

    if (isNetworkError && player?.playing && isRemoteSource) {
      await pauseForNetworkLoss();
      Snackbar.show({
        text: 'Playback paused because network was lost. Waiting for reconnection.',
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }

    console.error('Playback error:', error);
    Snackbar.show({
      text: 'Playback error. Please try again.',
      duration: Snackbar.LENGTH_SHORT,
    });
  };

  const restorePlaybackPosition = async (currentTime: number) => {
    if (!player || currentTime <= 0) return;
    try {
      await player.seekTo(currentTime);
      setPosition(currentTime);
    } catch (err) {
      console.warn('Failed to restore playback position after reconnect:', err);
    }
  };

  const attemptAutoResume = async () => {
    if (!player || !networkPaused || !isConnected || resumeAttemptedRef.current) return;
    resumeAttemptedRef.current = true;

    const resumeAt = resumePosition ?? player.currentTime ?? player.currentStatus?.currentTime ?? 0;
    await restorePlaybackPosition(resumeAt);

    try {
      await player.play();
      setIsPlaying(true);
      setNetworkPaused(false);
      setIsWaitingForNetwork(false);
    } catch (err) {
      console.warn('Auto-resume playback failed after reconnect:', err);
    }
  };

useEffect(() => {
  if (!player) return;

  if (!isConnected && player.playing && isRemoteSource) {
    void pauseForNetworkLoss();
    return;
  }

  if (isConnected && networkPaused && !resumeAttemptedRef.current) {
    void attemptAutoResume();
    return;
  }

  if (isConnected && isWaitingForNetwork && !networkPaused) {
    setIsWaitingForNetwork(false);
  }
}, [
  isConnected,
  networkPaused,
  player,
  isRemoteSource,
  isWaitingForNetwork,
]);

useEffect(() => {
  let lastSaveTime = 0;

  const interval = setInterval(() => {
    if (!player) return;

    const status = player.currentStatus;

    if (status?.isLoaded) {
      const currentPos = status.currentTime || 0;
      const totalDur = status.duration || 0;

      setPosition(currentPos);
      setDuration(totalDur);

      // Save playback position every 5 seconds
      if (player.playing) {
        const now = Date.now();

        if (now - lastSaveTime > 5000) {
          savePlaybackPosition(trackId, currentPos, totalDur);
          lastSaveTime = now;
        }
      }
    }
  }, 500);

  return () => clearInterval(interval);
}, [player, trackId]);

// Check for saved position on mount
useEffect(() => {
  if (!player) return;

  let isCancelled = false;

  const checkResume = async () => {
    const saved = await getPlaybackPosition(trackId);

    if (!isCancelled && saved && saved.position > 5) {
      Alert.alert(
        'Resume Podcast',
        `Do you want to resume from ${formatSecTime(saved.position)}?`,
        [
          {
            text: 'Start Over',
            style: 'cancel',
            onPress: async () => {
              await player.seekTo(0);
              setPosition(0);
            },
          },
          {
            text: 'Resume',
            onPress: async () => {
              await player.seekTo(saved.position);
              setPosition(saved.position);
              player.play();
              setIsPlaying(true);
            },
          },
        ]
      );
    }
  };

  const timeout = setTimeout(() => {
    void checkResume();
  }, 500);

  return () => {
    isCancelled = true;
    clearTimeout(timeout);
  };
}, [player, trackId]);

  useEffect(()=>{

    if(podcast){
      setLike(podcast.likedUsers.includes(user_id));
      setLikeCount(podcast.likedUsers.length);
    }
  }, [podcast, user_id])

  const SKIP_TIME = 5; // seconds

  const handleForward = async () => {
    if (!player) return;

    let next = position + SKIP_TIME;

    if (next > duration) {
      next = duration;
    }

    await player.seekTo(next);
    setPosition(next);
  };

  const handleBackward = async () => {
    if (!player) return;

    let next = position - SKIP_TIME;

    if (next < 0) {
      next = 0;
    }

    await player.seekTo(next);
    setPosition(next);
  };

  const formatSecTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${mins < 10 ? '0' : ''}${mins}:${
        secs < 10 ? '0' : ''
      }${secs}`;
    } else {
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
  };
  // For position update (removed redundant interval)

  const handleShare = async () => {
    try {
      const url = `https://uhsocial.in/api/share/podcast?trackId=${podcast?._id}&audioUrl=${podcast?.audio_url}`;
      await Share.open({
        title: podcast?.title,
        message: `${podcast?.title} : Check out this awesome podcast on UltimateHealth app!`,
        // Most Recent APK: 0.7.4
        url: url,
        subject: 'Podcast Sharing',
      });
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while sharing.');

      // dispatch(
      //   showAlert({
      //     title: 'Error!',
      //     message: 'Something went wrong while sharing.',
      //   }),
      // );
    }
  };

  const handlePlay = async () => {
    if (!player || !isConnected) {
      return;
    }

    if (!isConnected && isRemoteSource) {
      setIsWaitingForNetwork(true);
      Snackbar.show({
        text: 'Waiting for network to resume playback.',
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }

    try {
      await player.play();
      setIsPlaying(true);
      setNetworkPaused(false);
      setIsWaitingForNetwork(false);
      resumeAttemptedRef.current = false;
    } catch (err) {
      await handlePlaybackError(err);
    }
  };

 const handlePause = async () => {
  if (!player) return;

  try {
    player.pause();

    // Save exact playback position when user pauses
    await savePlaybackPosition(
      trackId,
      player.currentTime || 0,
      player.duration || 1
    );
  } catch (err) {
    console.warn('Error pausing playback:', err);
  }

  setIsPlaying(false);
  setNetworkPaused(false);
  setIsWaitingForNetwork(false);
  resumeAttemptedRef.current = false;
};
  
 if (isPodcastLoading || isLoading) {
    return <Loader />;
  }

  if (isPodcastError || !podcast) {
    return (
      <View testID="podcast-detail-error" style={styles.errorContainer}>
        <Text color="#F1F5F9" fontSize={18} fontWeight="700">
          Unable to load podcast details.
        </Text>
        <Text color="#94A3B8" fontSize={14} marginTop="$2">
          {podcastError instanceof Error ? podcastError.message : 'Please try again later.'}
        </Text>

        <TouchableOpacity
          testID="podcast-detail-retry-button"
          accessibilityLabel="podcast-detail-retry-button"
          style={styles.retryButton}
          onPress={() => {
            refetch();
          }}>
          <Text color="#0B1425" fontSize={16} fontWeight="800">
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }


  const coverImageEl = (
    <Image
      testID="podcast-cover-image"
      source={{
        uri: getFormattedSource(podcast.cover_image) ?? undefined,
      }}
      style={useSplitLayout ? styles.coverImageLandscape : styles.coverImage}
    />
  );

  const titleEl = (
    <Text
      color="#F1F5F9"
      fontSize={28}
      fontWeight="800">
      {podcast?.title}
    </Text>
  );

  const description = podcast?.description || '';
  const shouldTruncate = description.length > 180;
  const displayDescription = (shouldTruncate && !isDescriptionExpanded)
    ? `${description.slice(0, 180)}...`
    : description;

  const descriptionEl = (
    <YStack>
      <Text
        color="#94A3B8"
        fontSize={16}
        marginTop="$3">
        {displayDescription}
      </Text>
      {shouldTruncate && (
        <TouchableOpacity
          testID="description-toggle-button"
          accessibilityLabel={isDescriptionExpanded ? "Read Less" : "Read More"}
          accessibilityRole="button"
          accessibilityHint="Toggles between expanding and collapsing the full podcast description text"
          onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
          style={styles.readMoreButton}
        >
          <Text color={PRIMARY_COLOR} fontSize={14} fontWeight="700">
            {isDescriptionExpanded ? 'Read Less' : 'Read More'}
          </Text>
        </TouchableOpacity>
      )}
    </YStack>
  );

  const visualizerEl = (
    <YStack alignItems="center" width="100%">
      <View
        accessible={true}
        accessibilityLabel="Audio waveform visualizer"
        accessibilityHint={playing ? "Currently animating, audio is playing" : "Currently paused"}
        style={[
          styles.visualizerContainer,
          GlassStyles.glassContainerDark,
        ]}>
        <AudioWaveform isPlaying={playing} accentColor="#4F46E5" />
      </View>
    </YStack>
  );


  const offlineBannerEl = !isConnected && (
    <View style={styles.offlineBanner}>
      <Text color="#FFFFFF" fontSize={14} fontWeight="600">
        You are offline. Audio playback unavailable.
      </Text>

      <TouchableOpacity
        style={styles.retryAudioButton}
        onPress={() => {
          refetch();
        }}>
        <Text color="#0B1425" fontWeight="700">
          Retry
        </Text>
      </TouchableOpacity>
    </View>
  );

  const sliderEl = (
    <View
      style={[styles.sliderContainer, GlassStyles.glassContainerDark]}>
      <Slider
        testID="podcast-progress-slider"
        accessibilityLabel="podcast-progress-slider"
        accessibilityValue={{
          min: 0,
          max: duration,
          now: position,
        }}
        style={styles.slider}
        minimumValue={0}
        maximumValue={duration}
        value={position}
        minimumTrackTintColor={PRIMARY_COLOR}
        maximumTrackTintColor="#ccc"
        thumbTintColor={PRIMARY_COLOR}
        onSlidingComplete={async v => {
          if (player) {
            await player.seekTo(v);
            setPosition(v);
          }
        }}
      />

      <XStack
        justifyContent="space-between"
        marginTop="$2"
        paddingHorizontal="$2">
        <Text color="#C0C9DA" fontSize={14} fontWeight="600">
          {formatSecTime(position)}
        </Text>
        <Text color="#C0C9DA" fontSize={14} fontWeight="600">
          {formatSecTime(duration)}
        </Text>
      </XStack>
    </View>
  );

  const controlsEl = (
    <View
      style={[styles.controlsContainer, GlassStyles.glassContainerDark]}>
      <XStack justifyContent="space-around" alignItems="center">
        <TouchableOpacity
          testID="podcast-back-button"
          accessibilityLabel="podcast-back-button"
          disabled={!isConnected}
          onPress={handleBackward}
          style={styles.controlButton}>
          <Ionicons name="play-back" size={32} color="#9BB3C8" />
        </TouchableOpacity>

        <TouchableOpacity
          testID="podcast-play-pause-button"
          accessibilityLabel="podcast-play-pause-button"
          disabled={!isConnected}
          onPress={() =>
            player.currentStatus.playing ? handlePause() : handlePlay()
          }
          style={styles.mainPlayButton}>
          {playing ? (
            <Ionicons name="pause" size={40} color="white" />
          ) : (
            <Ionicons name="play" size={40} color="white" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          testID="podcast-forward-button"
          accessibilityLabel="podcast-forward-button"
          disabled={!isConnected}
          onPress={handleForward}
          style={styles.controlButton}>
          <Ionicons name="play-forward" size={32} color="#9BB3C8" />
        </TouchableOpacity>
      </XStack>
    </View>
  );

  const actionsEl = podcast && podcast.status === StatusEnum.PUBLISHED ? (
    <View
      style={[styles.actionsContainer, GlassStyles.glassContainerDark]}>
      <XStack alignItems="center" justifyContent="space-evenly">
        {/* LIKE */}
        {likePodcastPending ? (
          <LoadingSpinner size="small" />
        ) : (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              if (isGuest) {
                navigation.navigate('GuestPlaceholderScreen', {
                  title: 'Sign In Required',
                  description: 'Please sign in or sign up to like this podcast.',
                  iconName: 'heart',
                });
                return;
              }
              likePodcast(trackId, {
                onSuccess: data => {
                  if (data?.likeStatus && podcast) {
                    if (socket) {
                      socket.emit('notification', {
                        type: 'likePost',
                        userId: user_id,
                        articleId: null,
                        podcastId: podcast._id,
                        articleRecordId: null,
                        title: `${user_handle} liked your post`,
                        message: podcast.title,
                      });
                    }
                  }
                  refetch();
                },
                onError: err => {
                  console.log('Update like count err', err);
                  Snackbar.show({
                    text: 'Something went wrong!',
                    duration: Snackbar.LENGTH_SHORT,
                  });
                },
              });
            }}>
            {isLike ? (
              <AntDesign name="heart" size={26} color={PRIMARY_COLOR} />
            ) : (
              <Feather name="heart" size={26} color="white" />
            )}
            <Text style={styles.actionText}>
              {likeCount > 0 ? formatCount(likeCount) : ''}
            </Text>
          </TouchableOpacity>
        )}

        {/* DOWNLOAD */}
        {isLoading ? (
          <LoadingSpinner size="small" />
        ) : (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={async () => {
              if (isGuest) {
                navigation.navigate('GuestPlaceholderScreen', {
                  title: 'Sign In Required',
                  description: 'Please sign in or sign up to download podcasts.',
                  iconName: 'download',
                });
                return;
              }
              if (!podcast) {
                Snackbar.show({
                  text: 'Something went wrong! try again',
                  duration: Snackbar.LENGTH_SHORT,
                });
                return;
              }

              setLoading(true);
              const res = await downloadAudio(podcast);
              setLoading(false);

              Snackbar.show({
                text: res?.message ?? 'Audio downloaded successfully!',
                duration: Snackbar.LENGTH_SHORT,
              });
            }}>
            <Ionicons name="download-outline" size={26} color="white" />
          </TouchableOpacity>
        )}

        {/* COMMENTS */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            if (isGuest) {
              navigation.navigate('GuestPlaceholderScreen', {
                title: 'Sign In Required',
                description: 'Please sign in or sign up to view and post comments.',
                iconName: 'comment',
              });
              return;
            }
            if (!isConnected) {
              Snackbar.show({
                text: 'You are currently offline',
                duration: Snackbar.LENGTH_SHORT,
              });
              return;
            }

            if (podcast) {
              navigation.navigate('PodcastDiscussion', {
                podcastId: podcast._id,
                mentionedUsers: podcast.mentionedUsers,
              });
            }
          }}>
          <Ionicons name="chatbubble-outline" size={26} color="white" />
          <Text style={styles.actionText}>
            {podcast?.commentCount
              ? formatCount(podcast.commentCount)
              : 0}
          </Text>
        </TouchableOpacity>

        {/* SHARE */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShare}>
          <Ionicons name="share-outline" size={26} color="white" />
        </TouchableOpacity>
      </XStack>
    </View>
  ) : (
    <XStack></XStack>
  );

  const content = useSplitLayout ? (
    <XStack gap="$4" flex={1} paddingHorizontal="$2">
      {/* Left Column: Artwork Image and Visualizer */}
      <YStack width={isTablet ? 340 : '42%'} gap="$4">
        <View style={[styles.titleContainer, GlassStyles.glassContainerDark]}>
          {coverImageEl}
        </View>
        {visualizerEl}
      </YStack>

      {/* Right Column: Text Information, Slider, Controls, Actions */}
      <YStack flex={1} gap="$4">
        <View style={[styles.titleContainer, GlassStyles.glassContainerDark]}>
          <YStack>
            <Text
              color="#94A3B8"
              fontSize={13}
              fontWeight="600"
              marginBottom="$2"
              letterSpacing={1}>
              NOW PLAYING
            </Text>
            {titleEl}
            {descriptionEl}
          </YStack>
        </View>
        {offlineBannerEl}
        {offlineBannerEl}
        {sliderEl}
        <View style={{ marginTop: -15 }}>
          {controlsEl}
        </View>
        <View style={{ marginTop: -15 }}>
          {actionsEl}
        </View>
      </YStack>
    </XStack>
  ) : (
    <YStack flexGrow={1} gap="$4">
      {/* TITLE with Glass Effect */}
      <View style={[styles.titleContainer, GlassStyles.glassContainerDark]}>
        {coverImageEl}
        <YStack>
          <Text
            color="#94A3B8"
            fontSize={13}
            fontWeight="600"
            marginBottom="$2"
            letterSpacing={1}>
            NOW PLAYING
          </Text>
          {titleEl}
          {descriptionEl}
        </YStack>
      </View>

      {visualizerEl}

      {/* SLIDER + TIME */}
      <YStack>
        {sliderEl}
      </YStack>

      {/* PLAYER BUTTONS */}
      {controlsEl}

      {/* FOOTER OPTIONS */}
      {actionsEl}
    </YStack>
  );

  return (
    <ScrollView
      backgroundColor="#0B1425"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <Theme name="dark">
        <YStack
          flexGrow={1}
          backgroundColor="#0B1425"
          padding="$3"
          paddingTop="$10"
          justifyContent="space-between">
          {isWaitingForNetwork && (
            <YStack
              backgroundColor="#1F2937"
              borderRadius="$8"
              padding="$3"
              marginBottom="$3"
              gap="$1">
              <Text color="#FBBF24" fontWeight="700">
                Waiting for network connection
              </Text>
              <Text color="#CBD5E1" fontSize={13}>
                Playback was paused because connectivity was lost. It will resume as soon as the network returns.
              </Text>
            </YStack>
          )}
          {content}
        </YStack>
      </Theme>
    </ScrollView>
  );
};

export default PodcastDetail;

const styles = StyleSheet.create({
  titleContainer: {
    padding: 20,
    borderRadius: 20,
  },
  waveContainer: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  visualizerContainer: {
    width: '100%',
    borderRadius: 20,
    padding: 10,
    overflow: 'hidden',
  },
  sliderContainer: {
    padding: 20,
    borderRadius: 20,
  },
  controlsContainer: {
    padding: 20,
    borderRadius: 30,
    marginTop: 20,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainPlayButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#4ACDFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4ACDFF',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  actionsContainer: {
    padding: 20,
    borderRadius: 25,
    marginTop: 5,
    marginBottom: 20,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    flexDirection: 'row',
  },
  actionText: {
    //marginTop: 6,
    fontSize: fp(4),
    marginStart: 5,
    fontWeight: '600',
    color: '#fff',
  },
  container: {
    backgroundColor: '#0B1425',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'android' ? 12 : 0,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  coverImage: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    marginBottom: 16,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#0B1425',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: PRIMARY_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverImageLandscape: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
  },

  offlineBanner: {
    backgroundColor: '#7F1D1D',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  retryAudioButton: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: PRIMARY_COLOR,
  },

  readMoreButton: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    minWidth: 100,
    minHeight: 44,
    justifyContent: 'center',
  },

});