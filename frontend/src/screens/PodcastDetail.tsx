import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {PodcastData, PodcastDetailScreenProp} from '../type';
import {BUTTON_COLOR, ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../helper/Theme';
import Slider from '@react-native-community/slider';

import {useAudioPlayer} from 'expo-audio';

import {useMutation, useQuery} from '@tanstack/react-query';
import axios from 'axios';
import {
  GET_IMAGE,
  GET_PODCAST_DETAILS,
  GET_STORAGE_DATA,
  LIKE_PODCAST,
} from '../helper/APIUtils';
import {useSelector} from 'react-redux';
import moment from 'moment';
import {downloadAudio, formatCount, StatusEnum} from '../helper/Utils';
import Snackbar from 'react-native-snackbar';
import AntDesign from '@expo/vector-icons/AntDesign';
import Share from 'react-native-share';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {hp} from '../helper/Metric';
import {useSocket} from '../../SocketContext';
import {Feather} from '@expo/vector-icons';
import Loader from '../components/Loader';
import {Button, Circle, Theme, XStack, YStack, Text} from 'tamagui';
import LottieView from 'lottie-react-native';

const PodcastDetail = ({navigation, route}: PodcastDetailScreenProp) => {
  //const [progress, setProgress] = useState(10);
  const insets = useSafeAreaInsets();
  const {trackId, audioUrl} = route.params;

  const[playing, setIsPlaying] = useState(false);

  const socket = useSocket();
  const {user_token, user_id, user_handle} = useSelector(
    (state: any) => state.user,
  );
  const {isConnected} = useSelector((state: any) => state.network);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  const handleListenPress = async () => {
    if (!player) return;
    const status = player.currentStatus;
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const {data: podcast, refetch} = useQuery({
    queryKey: ['get-podcast-details'],
    queryFn: async () => {
      try {
        if (user_token === '') {
          throw new Error('No token found');
        }
        const response = await axios.get(
          `${GET_PODCAST_DETAILS}?podcast_id=${trackId}`,
          {
            headers: {
              Authorization: `Bearer ${user_token}`,
            },
          },
        );
        return response.data as PodcastData;
      } catch (err) {
        console.error('Error fetching podcast:', err);
      }
    },
  });

  // const [source, setSource] = useState<string  | null>(null);

  const source = audioUrl?.startsWith('http')
    ? audioUrl
    : `${GET_IMAGE}/${audioUrl}`;

  console.log('source', source);
  // only initialize once a valid uri exists
  const player = useAudioPlayer(
    source ?? require('../../assets/sounds/funny-cartoon-sound-397415.mp3'),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      if (player.playing) {
        setPosition(player.currentTime || 0);
        setDuration(player.duration || 1);
        // setIsPlaying(player.playing || false);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [player.currentTime, player.duration, player.playing]);

  const handleSeek = async (value: number) => {
    if (player) {
      await player.seekTo(value);
      setPosition(value);
    }
  };

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
  // For position update

  useEffect(() => {
    const interval = setInterval(async () => {
      if (player) {
        const status = player.currentStatus;
        if (status.isLoaded) setPosition(status.currentTime);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [player, player.currentTime, player.duration, player.playing]);

  const updateLikeCountMutation = useMutation({
    mutationKey: ['update-podcast-like-count'],
    mutationFn: async (podcastId: string) => {
      const res = await axios.post(
        `${LIKE_PODCAST}`,
        {
          podcast_id: podcastId,
        },
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );
      return res.data as any;
    },
    onSuccess: data => {
      if (data?.likeStatus && podcast) {
        // data.userId, data.articleId, data.podcastId, data.articleRecordId, data.title, data.message
        socket.emit('notification', {
          type: 'likePost',
          userId: user_id,
          articleId: null,
          podcastId: podcast._id,
          articleRecordId: null,
          title: `${user_handle} liked your post`,
          message: podcast.title,
        });
        refetch();
      }
    },
    onError: err => {
      console.log('Update like count err', err);
      Snackbar.show({
        text: 'Something went wrong!',
        duration: Snackbar.LENGTH_SHORT,
      });
    },
  });

  const formatTime = (seconds: number) => {
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
  //console.log("Podcast liked users", podcast?.likedUsers);
  const handleShare = async () => {
    try {
      const result = await Share.open({
        title: podcast?.title,
        message: `${podcast?.title} : Check out this podcast on UltimateHealth app!`,
        // Most Recent APK: 0.7.4
        url: 'https://drive.google.com/file/d/19pRw_TWU4R3wcXjffOPBy1JGBDGnlaEh/view?usp=sharing',
        subject: 'UltimateHealth Post',
      });
      console.log(result);
    } catch (error) {
      console.log('Error sharing:', error);
      Alert.alert('Error', 'Something went wrong while sharing.');
    }
  };

  const handlePlay = async () => {
    console.log('Play called');
    if (!player) {
      console.log('enter');
      return;
    }
    //await player.seekTo(0);
    player.play();
    //setUiState('playing');
    setIsPlaying(true);
  };

  const handlePause = async () => {
    console.log('Pause called');
    if (!player) return;

    player.pause();
  //  setUiState('paused');
    setIsPlaying(false);
  };

  if (isLoading) {
    return <Loader />;
  }

      

return (
  <Theme name="dark">
    <YStack
      flex={1}
      backgroundColor="#0B1425"
      padding="$6"
      paddingTop="$10"
      justifyContent="space-between"
    >

      {/* TITLE */}
      <YStack>
        <Text color="white" fontSize={38} fontWeight="700">
          {podcast?.title}
        </Text>
      </YStack>

      {/* MAIN WAVE */}
      <YStack alignItems="center" mt="$4">
        <LottieView
          source={require('../assets/LottieAnimation/wave-loop.json')}
          autoPlay
          loop
          style={{ width: '100%', height: 150 }}
        />
      </YStack>

      {/* PLAYING VISUALIZER */}
      {playing && (
        <YStack alignItems="center" mt="$2">
          <LottieView
            source={require('../assets/LottieAnimation/sound-voice-waves.json')}
            autoPlay
            loop
            style={{ width: '100%', height: 150 }}
          />
        </YStack>
      )}

      {/* SLIDER + TIME */}
      <YStack mt="$2">
        <Slider
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

        <XStack justifyContent="space-between" mt="$3">
          <Text color="#C0C9DA">{formatSecTime(position)}</Text>
          <Text color="#C0C9DA">{formatSecTime(duration)}</Text>
        </XStack>
      </YStack>

      {/* PLAYER BUTTONS */}
      <XStack justifyContent="space-around" alignItems="center" mt="$4">
        <Button
          height={90}
          chromeless
          onPress={handleBackward}
          icon={<Ionicons name="play-back" size={26} color="#9BB3C8" />}
        />

        <Button
          width={90}
          height={90}
          borderRadius={45}
          bg="#4ACDFF"
          onPress={() =>
            player.currentStatus.playing ? handlePause() : handlePlay()
          }
          icon={
            playing ? (
              <Ionicons name="pause" size={50} color="white" />
            ) : (
              <Ionicons name="play" size={50} color="white" />
            )
          }
          elevate
          shadowColor="#4ACDFF"
          shadowRadius={30}
          shadowOffset={{ width: 0, height: 0 }}
        />

        <Button
          height={90}
          chromeless
          onPress={handleForward}
          icon={<Ionicons name="play-forward" size={26} color="#9BB3C8" />}
        />
      </XStack>

      {/* FOOTER OPTIONS */}
      {
        podcast && podcast.status === StatusEnum.PUBLISHED ? (
        <XStack
        style={styles.footerOptions}
        alignItems="center"
        justifyContent="space-evenly"
      >
        {/* LIKE */}
        {updateLikeCountMutation.isPending ? (
          <ActivityIndicator size="small" color={PRIMARY_COLOR} />
        ) : (
          <TouchableOpacity
            style={styles.footerItem}
            onPress={() => updateLikeCountMutation.mutate(trackId)}
          >
            {podcast?.likedUsers.includes(user_id) ? (
              <AntDesign name="heart" size={24} color={PRIMARY_COLOR} />
            ) : (
              <Feather name="heart" size={24} color="white" />
            )}

            <Text style={styles.likeCount}>
              {podcast?.likedUsers?.length
                ? formatCount(podcast.likedUsers.length)
                : 0}
            </Text>
          </TouchableOpacity>
        )}

        {/* DOWNLOAD */}
        {isLoading ? (
          <ActivityIndicator size="small" color={PRIMARY_COLOR} />
        ) : (
          <TouchableOpacity
            onPress={async () => {
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
                text: res.message,
                duration: Snackbar.LENGTH_SHORT,
              });
            }}
          >
            <Ionicons name="download-outline" size={27} color="white" />
          </TouchableOpacity>
        )}

        {/* COMMENTS */}
        <TouchableOpacity
          style={styles.footerItem}
          onPress={() => {
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
          }}
        >
          <Ionicons name="chatbubble-outline" size={24} color="white" />
          <Text style={styles.likeCount}>
            {podcast?.commentCount
              ? formatCount(podcast.commentCount)
              : 0}
          </Text>
        </TouchableOpacity>

        {/* SHARE */}
        <TouchableOpacity onPress={handleShare}>
          <Ionicons name="share-outline" size={27} color="white" />
        </TouchableOpacity>
       </XStack>
        ): (
          <XStack>
            
          </XStack>
        )
      }
    </YStack>
  </Theme>
);

};

export default PodcastDetail;

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: ON_PRIMARY_COLOR,
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'android' ? 12 : 0,
  },
  header: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 6,
    fontWeight: '600',
    color: '#444',
  },
  podcastImage: {
    width: '100%',
    height: 160,
    alignSelf: 'center',
    borderRadius: hp(2),
    marginBottom: 12,
    resizeMode: 'cover',
  },
  episodeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1E1E1E',
    marginBottom: 8,
    paddingHorizontal: 6,
  },
  podcastTitle: {
    fontSize: 16,
    textAlign: 'justify',
    color: '#555',
    marginBottom: 2,
    paddingHorizontal: 6,
  },
  readMoreText: {
    color: '#007AFF',
    marginTop: 2,
    fontSize: 15,
    fontWeight: '500',
    paddingHorizontal: 6,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 6,
    paddingHorizontal: 6,
  },
  tagText: {
    color: PRIMARY_COLOR,
    fontSize: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    marginBottom: 10,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  slider: {
    width: '100%',
    height: 36,
    marginTop: 6,
    marginBottom: 2,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  time: {
    fontSize: 13,
    color: '#777',
  },
  bufferingText: {
    textAlign: 'center',
    color: '#888',
    marginBottom: 6,
    fontStyle: 'italic',
    fontSize: 14,
  },
  listenButton: {
    backgroundColor: BUTTON_COLOR,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    marginVertical: 16,
  },
  listenButtonDisabled: {
    backgroundColor: '#ccc',
  },
  listenText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  footerOptions: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: hp(6),
    paddingHorizontal: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 12,
    marginTop: 16,
    gap: 10,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  authorImage: {
    height: 45,
    width: 45,
    borderRadius: 45,
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
    paddingHorizontal: 12,
    borderRadius: 20,
    paddingVertical: 8,
  },
  followButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },

  likeCount: {
    marginLeft: 4,
    fontSize: 14,
    color: '#fff',
  },
});
