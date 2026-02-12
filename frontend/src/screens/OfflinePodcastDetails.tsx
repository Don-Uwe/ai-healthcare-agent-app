import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Image,
  Alert,
  Platform,
} from 'react-native';
import {OfflinePodcastDetailProp, PodcastData} from '../type';
import {hp} from '../helper/Metric';
import {ON_PRIMARY_COLOR, BUTTON_COLOR, PRIMARY_COLOR} from '../helper/Theme';
import Slider from '@react-native-community/slider';
import moment from 'moment';
import Ionicons from '@expo/vector-icons/Ionicons';
// eslint-disable-next-line import/no-duplicates
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';

import {formatCount, updateOfflinePodcastLikeStatus} from '../helper/Utils';
import {useDispatch, useSelector} from 'react-redux';
import {useCallback, useEffect, useState} from 'react';
import {useMutation} from '@tanstack/react-query';
import axios from 'axios';
import Snackbar from 'react-native-snackbar';
import {GET_STORAGE_DATA, LIKE_PODCAST} from '../helper/APIUtils';
import Share from 'react-native-share';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialIcons';
import {useSocket} from '../../SocketContext';
import {Feather} from '@expo/vector-icons';
import {useAudioPlayer} from 'expo-audio';
import {showAlert} from '../store/alertSlice';

export default function OfflinePodcastDetail({
  route,
}: OfflinePodcastDetailProp) {
  const {podcast} = route.params;
  const socket = useSocket();
  const insets = useSafeAreaInsets();

  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  //const playbackState = usePlaybackState();
  //const progress = useProgress();
  const {user_id, user_token, user_handle} = useSelector(
    (state: any) => state.user,
  );
  const {isConnected} = useSelector((state: any) => state.network);
  //const [isLoading, setLoading] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [currentPodcast, setCurrentPodcast] = useState<PodcastData>(podcast);
  const dispatch = useDispatch();

  const player = useAudioPlayer(`file://${podcast.filePath}`);

  useEffect(() => {
    //console.log("File path", `${filePath}`);
    console.log('Player time', player.currentTime);
    console.log('Player status', player.currentStatus.currentTime);
  }, [player.currentStatus.currentTime, player.currentTime]);

  useEffect(() => {
    if (!player) return;

    const interval = setInterval(() => {
      const status = player.currentStatus;
      if (status) {
        setPosition(status.currentTime);
        setDuration(player.duration || status.duration || 0);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [player]);

  const handleListenPress = async () => {
    const currentState = player.currentStatus;

    if (currentState.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const handleShare = async () => {
    try {
        const url = `https://uhsocial.in/api/share/podcast?trackId=${podcast._id}&audioUrl=${podcast.audio_url}`;
      await Share.open({
        title: podcast?.title,
        message: `${podcast?.title} : Check out this awesome podcast on UltimateHealth app!`,
        // Most Recent APK: 0.7.4
        url: url,
        subject: 'Podcast Sharing',
      });
      //console.log(result);
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
    onSuccess: async data => {
      if (data.likeStatus === false) {
        // Update podcast status in storage
        podcast.likedUsers = podcast.likedUsers.filter(id => id !== user_id);
        setCurrentPodcast(podcast);
        await updateOfflinePodcastLikeStatus(podcast);
      } else {
        podcast.likedUsers.push(user_id);
        if (data?.likeStatus) {
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
        }
        await updateOfflinePodcastLikeStatus(podcast);
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
  return (
    <ScrollView style={styles.container}>
      <Image
        source={{
          uri: 'https://t3.ftcdn.net/jpg/05/10/75/30/360_F_510753092_f4AOmCJAczuGgRLCmHxmowga2tC9VYQP.jpg',
        }}
        style={styles.podcastImage}
      />

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
            {podcast?.user_id.Profile_image && isConnected ? (
              <Image
                source={{
                  uri: podcast?.user_id.Profile_image.startsWith('http')
                    ? `${podcast?.user_id.Profile_image}`
                    : `${GET_STORAGE_DATA}/${podcast?.user_id.Profile_image}`,
                }}
                style={styles.authorImage}
              />
            ) : isConnected ? (
              <Image
                source={{
                  uri: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
                }}
                style={styles.authorImage}
              />
            ) : (
              <View style={styles.iconContainer}>
                <Icon name="person" size={40} color="#555" />
              </View>
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
        <TouchableOpacity
          style={styles.footerItem}
          onPress={() => {
            if (isConnected) {
              updateLikeCountMutation.mutate(podcast._id);
            } else {
              Snackbar.show({
                text: 'You are currently offline',
                duration: Snackbar.LENGTH_SHORT,
              });
            }
          }}>
          {currentPodcast?.likedUsers.includes(user_id) ? (
            <AntDesign name="heart" size={24} color={PRIMARY_COLOR} />
          ) : (
            <Feather name="heart" size={24} color={'black'} />
          )}
          <Text style={styles.likeCount}>
            {currentPodcast?.likedUsers?.length
              ? formatCount(currentPodcast?.likedUsers?.length)
              : 0}
          </Text>
        </TouchableOpacity>

        <View>
          <MaterialIcons name="done" size={24} color="green" />
        </View>
        <TouchableOpacity
          style={styles.footerItem}
          onPress={() => {
            if (isConnected) {
              // handleDiscussion(); // You need to define this
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

        {
          <TouchableOpacity
            onPress={() => {
              if (isConnected) {
                handleShare();
              } else {
                Snackbar.show({
                  text: 'You are currently offline',
                  duration: Snackbar.LENGTH_SHORT,
                });
              }
            }}>
            <Ionicons name="share-outline" size={27} color="#1E1E1E" />
          </TouchableOpacity>
        }
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
          // eslint-disable-next-line react/react-in-jsx-scope
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
        maximumValue={player.duration || 1}
        value={position}
        minimumTrackTintColor={PRIMARY_COLOR}
        maximumTrackTintColor="#ccc"
        thumbTintColor={PRIMARY_COLOR}
        onSlidingComplete={async value => {
          // seek to selected time
          await player.seekTo(value);
        }}
      />

      <View style={styles.timeRow}>
        <Text style={styles.time}>
          {formatTime(
            player.currentStatus ? player.currentStatus.currentTime : 0,
          )}
        </Text>
        <Text style={styles.time}>{formatTime(player.duration || 1)}</Text>
      </View>

      {player.currentStatus.isBuffering && (
        <Text style={styles.bufferingText}>⏳ Buffering... please wait</Text>
      )}

      <TouchableOpacity
        style={[
          styles.listenButton,
          player.currentStatus.isBuffering && styles.listenButtonDisabled,
        ]}
        onPress={handleListenPress}
        disabled={player.currentStatus.isBuffering}>
        <Text style={styles.listenText}>
          {player.currentStatus.playing ? '⏸️Pause' : '🎧 Listen Now'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

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
    fontSize: 19,
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
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
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
