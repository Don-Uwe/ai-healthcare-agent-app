import {useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {PodcastData, PodcastDetailScreenProp} from '../type';
import {BUTTON_COLOR, ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../helper/Theme';
import {hp} from '../helper/Metric';
import Slider from '@react-native-community/slider';
import TrackPlayer, {
  State,
  usePlaybackState,
  useProgress,
} from 'react-native-track-player';
import {useQuery} from '@tanstack/react-query';
import axios from 'axios';
import {GET_IMAGE, GET_PODCAST_DETAILS} from '../helper/APIUtils';
import {useSelector} from 'react-redux';
import moment from 'moment';
import { formatCount } from '../helper/Utils';

const PodcastDetail = ({route}: PodcastDetailScreenProp) => {
  //const [progress, setProgress] = useState(10);
  const {trackId} = route.params;
  const playbackState = usePlaybackState();
  const progress = useProgress();
  const {user_token} = useSelector((state: any) => state.user);

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

  const {
    data: podcast,
  } = useQuery({
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

  useEffect(() => {
    addTrack();

    return () => {
      //TrackPlayer.stop();
    };
  }, [addTrack]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Podcast Details</Text>

      {podcast && podcast.cover_image ? (
        <Image
          source={{
            uri: podcast?.cover_image,
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

      <Text style={styles.episodeTitle}>{podcast?.title}</Text>
      <Text style={styles.podcastTitle}>{podcast?.description}</Text>

      <View style={styles.metaInfo}>
        <Text style={styles.metaText}>
          {moment(podcast?.updated_at).format('MMMM Do YYYY, h:mm A')}
        </Text>
       {
        podcast && (
           // eslint-disable-next-line react/react-in-jsx-scope
           <Text style={styles.metaText}>{podcast?.viewUsers.length <=1 ? `${podcast?.viewUsers.length} view`: `${formatCount(podcast?.viewUsers.length ?? 0)} views` }</Text>
        )
       }
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
          {playbackState.state === State.Playing ? '⏸️Pause' : '🎧 Listen Now'}
        </Text>
      </TouchableOpacity>

      <View style={styles.footerOptions}>
        <TouchableOpacity>
          <Ionicons name="heart-outline" size={27} color="#1E1E1E" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="download-outline" size={27} color="#1E1E1E" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="share-outline" size={27} color="#1E1E1E" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default PodcastDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ON_PRIMARY_COLOR,
    padding: 20,
    //justifyContent: 'center',
    marginTop: hp(2),
    // marginBottom: hp(10)
  },
  header: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 6,
    fontWeight: '500',
    color: '#444',
  },
  podcastImage: {
    width: 350,
    height: 150,
    alignSelf: 'center',
    borderRadius: 26,
    marginBottom: 24,
    resizeMode:"cover"
  },
  episodeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1E1E1E',
  },
  podcastTitle: {
    fontSize: 16,
    textAlign: 'justify',
    color: '#777',
    marginBottom: 24,
  },
  time: {
    fontSize: 12,
    color: '#777',
  },
  listenButton: {
    backgroundColor: BUTTON_COLOR,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 32,
  },
  listenText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footerOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 3,
    marginBottom:40
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },

  slider: {
    width: '100%',
    height: 40,
    marginTop: 10,
    marginBottom: 4,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  bufferingText: {
    textAlign: 'center',
    color: '#888',
    marginBottom: 8,
    fontStyle: 'italic',
    fontSize: 14,
  },
  listenButtonDisabled: {
    backgroundColor: '#ccc',
  },
});
