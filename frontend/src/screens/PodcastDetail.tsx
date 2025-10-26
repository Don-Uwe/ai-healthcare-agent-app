import React from 'react';
import {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
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

/*
import TrackPlayer, {
  State,
  usePlaybackState,
  useProgress,
} from 'react-native-track-player';
 */

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
import {downloadAudio, formatCount} from '../helper/Utils';
import Snackbar from 'react-native-snackbar';
import AntDesign from '@expo/vector-icons/AntDesign';
import Share from 'react-native-share';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {hp} from '../helper/Metric';
import { useSocket } from '../../SocketContext';

const PodcastDetail = ({navigation, route}: PodcastDetailScreenProp) => {
  //const [progress, setProgress] = useState(10);
  const insets = useSafeAreaInsets();
  const {trackId} = route.params;
  const playbackState = usePlaybackState();
  const progress = useProgress();
  const socket = useSocket();
  const {user_token, user_id, user_handle} = useSelector((state: any) => state.user);
  const {isConnected} = useSelector((state: any) => state.network);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const handleListenPress = async () => {
    const currentState = await TrackPlayer.getPlaybackState();

    console.log('Current state', currentState);
    console.log('State Playing', State.Playing);
    console.log('State Ready', State.Ready);
    console.log('State Stoped', State.Stopped);
    if (currentState.state === State.Playing) {
      await TrackPlayer.pause();
    } else if (
      currentState.state === State.Paused ||
      currentState.state === State.Ready ||
      currentState.state === State.Stopped
    ) {
      await TrackPlayer.play();
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

  const addTrack = useCallback(async () => {
    await TrackPlayer.reset();
    if (podcast) {
      await TrackPlayer.add({
        id: trackId,
        url: `${GET_IMAGE}/${podcast?.audio_url}`,
        title: podcast?.title,
        artist: podcast?.user_id.user_name,
      });
    }
  }, [podcast, trackId]);

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
    onSuccess: (data) => {

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

  useEffect(() => {
    addTrack();
    return () => {};
  }, [addTrack]);

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {podcast && podcast.cover_image ? (
          <Image
            source={{
              uri: podcast?.cover_image.startsWith('http')
                ? podcast?.cover_image
                : `${GET_STORAGE_DATA}/${podcast?.cover_image}`,
            }}
            style={styles.podcastImage}
          />
        ) : (
          <Image
            source={{
              uri: 'https://t3.ftcdn.net/jpg/05/10/75/30/360_F_510753092_f4AOmCJAczuGgRLCmHxmowga2tC9VYQP.jpg',
            }}
            style={styles.podcastImage}
          />
        )}

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
                //navigation.navigate('UserProfileScreen', {
                //  authorId: authorId,
                // });
              }}>
              {podcast?.user_id.Profile_image ? (
                <Image
                  source={{
                    uri: podcast?.user_id.Profile_image.startsWith('http')
                      ? `${podcast?.user_id.Profile_image}`
                      : `${GET_STORAGE_DATA}/${podcast?.user_id.Profile_image}`,
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
                {podcast ? podcast?.user_id.user_name : ''}
              </Text>
              <Text style={styles.authorFollowers}>
                {podcast?.user_id.followers
                  ? podcast?.user_id.followers.length > 1
                    ? `${podcast?.user_id.followers.length} followers`
                    : `${podcast?.user_id.followers.length} follower`
                  : '0 follower'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footerOptions}>
          {updateLikeCountMutation.isPending ? (
            <ActivityIndicator size="small" color={PRIMARY_COLOR} />
          ) : (
            <TouchableOpacity
              style={styles.footerItem}
              onPress={() => {
                updateLikeCountMutation.mutate(trackId);
              }}>
              {podcast?.likedUsers.includes(user_id) ? (
                <AntDesign name="heart" size={24} color={PRIMARY_COLOR} />
              ) : (
                <AntDesign name="hearto" size={24} color={'black'} />
              )}

              <Text style={styles.likeCount}>
                {podcast?.likedUsers?.length
                  ? formatCount(podcast?.likedUsers?.length)
                  : 0}
              </Text>
            </TouchableOpacity>
          )}
          {isLoading ? (
            <ActivityIndicator size="small" color={PRIMARY_COLOR} />
          ) : (
            <TouchableOpacity
              onPress={async () => {
                if (podcast) {
                  setLoading(true);
                  const res = await downloadAudio(podcast);
                  setLoading(false);
                  Snackbar.show({
                    text: res.message,
                    duration: Snackbar.LENGTH_SHORT,
                  });
                } else {
                  Snackbar.show({
                    text: 'Something went wrong! try again',
                    duration: Snackbar.LENGTH_SHORT,
                  });
                }
              }}>
              <Ionicons name="download-outline" size={27} color="#1E1E1E" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.footerItem}
            onPress={() => {
              if (isConnected) {
                if (podcast) {
                  navigation.navigate('PodcastDiscussion', {
                    podcastId: podcast?._id,
                    mentionedUsers: podcast?.mentionedUsers,
                  });
                }
              } else {
                Snackbar.show({
                  text: 'You are currently offline',
                  duration: Snackbar.LENGTH_SHORT,
                });
              }
            }}>
            <Ionicons name="chatbubble-outline" size={24} color="#1E1E1E" />
            <Text style={styles.likeCount}>
              {podcast?.commentCount ? formatCount(podcast?.commentCount) : 0}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleShare}>
            <Ionicons name="share-outline" size={27} color="#1E1E1E" />
          </TouchableOpacity>
        </View>

        <Text style={styles.episodeTitle}>{podcast?.title}</Text>
        <View>
          <Text
            style={styles.podcastTitle}
            numberOfLines={isExpanded ? undefined : 3}
            ellipsizeMode="tail">
            {podcast?.description}
          </Text>
          {podcast &&
            podcast.description &&
            podcast?.description?.length > 100 && (
              <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
                <Text style={styles.readMoreText}>
                  {isExpanded ? 'Read Less ' : 'Read More '}
                </Text>
              </TouchableOpacity>
            )}
        </View>

        <View style={styles.tagsContainer}>
          {podcast?.tags?.map((tag, index) => (
            <Text key={index} style={styles.tagText}>
              #{tag.name}
            </Text>
          ))}
        </View>

        <View style={styles.metaInfo}>
          <Text style={styles.metaText}>
            {moment(podcast?.updated_at).format('MMMM Do YYYY, h:mm A')}
          </Text>
          {podcast && (

            <Text style={styles.metaText}>
              {podcast?.viewUsers.length <= 1
                ? `${podcast?.viewUsers.length} view`
                : `${formatCount(podcast?.viewUsers.length ?? 0)} views`}
            </Text>
          )}
        </View>

        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={progress.duration}
          value={progress.position}
          minimumTrackTintColor={PRIMARY_COLOR}
          maximumTrackTintColor="#ccc"
          thumbTintColor={PRIMARY_COLOR}
          onSlidingComplete={async value => {
            // seek to selected time
            await TrackPlayer.seekTo(value);
          }}
        />

        <View style={styles.timeRow}>
          <Text style={styles.time}>{formatTime(progress.position)}</Text>
          <Text style={styles.time}>{formatTime(progress.duration)}</Text>
        </View>

        {playbackState.state === State.Buffering && (
          <Text style={styles.bufferingText}>⏳ Buffering... please wait</Text>
        )}

        <TouchableOpacity
          style={[
            styles.listenButton,
            playbackState.state === State.Buffering &&
              styles.listenButtonDisabled,
          ]}
          onPress={handleListenPress}
          disabled={playbackState.state === State.Buffering}>
          <Text style={styles.listenText}>
            {playbackState.state === State.Playing
              ? '⏸️Pause'
              : '🎧 Listen Now'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PodcastDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: 12,
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
    color: '#333',
  },
});
