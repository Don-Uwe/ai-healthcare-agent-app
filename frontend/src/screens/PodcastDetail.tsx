import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {PodcastDetailScreenProp} from '../type';
import {PRIMARY_COLOR} from '../helper/Theme';
import Slider from '@react-native-community/slider';
import {GlassStyles} from '../styles/GlassStyles';

import {useAudioPlayer} from 'expo-audio';

import {GET_IMAGE} from '../helper/APIUtils';
import {useSelector} from 'react-redux';

import {downloadAudio, formatCount, StatusEnum} from '../helper/Utils';
import Snackbar from 'react-native-snackbar';
import AntDesign from '@expo/vector-icons/AntDesign';
import Share from 'react-native-share';
import {fp} from '../helper/Metric';
import {useSocket} from '../../SocketContext';
import {Feather} from '@expo/vector-icons';
import Loader from '../components/Loader';
import {Theme, XStack, YStack, Text, ScrollView} from 'tamagui';
import LottieView from 'lottie-react-native';
import {useGetSinglePodcastDetails} from '../hooks/useGetSinglePodcastDetails';
import {useLikePodcast} from '../hooks/useLikePodcast';

const PodcastDetail = ({navigation, route}: PodcastDetailScreenProp) => {
  //const [progress, setProgress] = useState(10);
  // const insets = useSafeAreaInsets();
  const {trackId, audioUrl} = route.params;

  const [playing, setIsPlaying] = useState(false);

  const socket = useSocket();
  const {user_token, user_id, user_handle} = useSelector(
    (state: any) => state.user,
  );
  const {isConnected} = useSelector((state: any) => state.network);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  const [isLike, setLike] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const {data: podcast, refetch} = useGetSinglePodcastDetails(trackId);
  const {mutate: likePodcast, isPending: likePodcastPending} = useLikePodcast();

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

  const handleShare = async () => {
    try {
      const url = `https://uhsocial.in/api/share/podcast?trackId=${podcast?._id}&audioUrl=${podcast?.audio_url}`;
      const result = await Share.open({
        title: podcast?.title,
        message: `${podcast?.title} : Check out this awesome podcast on UltimateHealth app!`,
        // Most Recent APK: 0.7.4
        url: url,
        subject: 'Podcast Sharing',
      });
      console.log(result);
    } catch (error) {
      console.log('Error sharing:', error);
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
    <ScrollView backgroundColor={'#0B1425'}>
      <Theme name="dark">
        <YStack
          flex={1}
          backgroundColor="#0B1425"
          padding="$3"
          paddingTop="$10"
          justifyContent="space-between">
          {/* TITLE with Glass Effect */}
          <View style={[styles.titleContainer, GlassStyles.glassContainerDark]}>
            <YStack marginBottom="$4">
              <Text
                color="#94A3B8"
                fontSize={13}
                fontWeight="600"
                marginBottom="$2"
                letterSpacing={1}>
                NOW PLAYING
              </Text>
              <Text
                color="#F1F5F9"
                fontSize={28}
                fontWeight="800"
                lineHeight={34}>
                {podcast?.title}
              </Text>
              <Text
                color="#94A3B8"
                fontSize={16}
                marginTop="$3"
                lineHeight={24}>
                {podcast?.description}
              </Text>
            </YStack>
          </View>

          {/* PLAYING VISUALIZER */}
          {playing && (
            <YStack alignItems="center" marginTop="$2">
              <View
                style={[
                  styles.visualizerContainer,
                  GlassStyles.glassContainerDark,
                ]}>
                <LottieView
                  source={require('../assets/LottieAnimation/sound-voice-waves.json')}
                  autoPlay
                  loop
                  style={{width: '100%', height: 150}}
                />
              </View>
            </YStack>
          )}

          {/* SLIDER + TIME */}
          <YStack marginTop="$2">
            <View
              style={[styles.sliderContainer, GlassStyles.glassContainerDark]}>
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
          </YStack>

          {/* PLAYER BUTTONS */}
          <View
            style={[styles.controlsContainer, GlassStyles.glassContainerDark]}>
            <XStack justifyContent="space-around" alignItems="center">
              <TouchableOpacity
                onPress={handleBackward}
                style={styles.controlButton}>
                <Ionicons name="play-back" size={32} color="#9BB3C8" />
              </TouchableOpacity>

              <TouchableOpacity
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
                onPress={handleForward}
                style={styles.controlButton}>
                <Ionicons name="play-forward" size={32} color="#9BB3C8" />
              </TouchableOpacity>
            </XStack>
          </View>

          {/* FOOTER OPTIONS */}
          {podcast && podcast.status === StatusEnum.PUBLISHED ? (
            <View
              style={[styles.actionsContainer, GlassStyles.glassContainerDark]}>
              <XStack alignItems="center" justifyContent="space-evenly">
                {/* LIKE */}
                {likePodcastPending ? (
                  <ActivityIndicator size="small" color={PRIMARY_COLOR} />
                ) : (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      likePodcast(trackId, {
                        onSuccess: data => {

                          console.log('Like podcast res', data);
                          if (data?.likeStatus && podcast) {
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
                  <ActivityIndicator size="small" color={PRIMARY_COLOR} />
                ) : (
                  <TouchableOpacity
                    style={styles.actionButton}
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
          )}
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
});
