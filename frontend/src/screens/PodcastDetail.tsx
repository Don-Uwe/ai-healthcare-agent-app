import {useCallback, useEffect, useState} from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {PodcastDetailScreenProp} from '../type';
import {BUTTON_COLOR, ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../helper/Theme';
import {hp} from '../helper/Metric';
import Slider from '@react-native-community/slider';
import TrackPlayer, {
  Capability,
  State,
  usePlaybackState,
  useProgress,
} from 'react-native-track-player';

const PodcastDetail = ({navigation, route}: PodcastDetailScreenProp) => {
  //const [progress, setProgress] = useState(10);
  const {podcast, trackId} = route.params;
  const playbackState = usePlaybackState();
  const progress = useProgress();

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

  const addTrack = useCallback(async () => {
    await TrackPlayer.reset();
    await TrackPlayer.add({
      id: trackId,
      url: 'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg',
      title: podcast.title,
      artist: podcast.host,
    });
  }, [podcast, trackId]);
  /*
  const setupPlayer = useCallback(async () => {
    const currentState = await TrackPlayer.getPlaybackState();

    console.log('Current state', currentState);

    if (currentState.state !== State.None) {
      return;
    }

    await TrackPlayer.setupPlayer();

    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Stop,
      ],
      compactCapabilities: [Capability.Play, Capability.Pause],
    });

    await addTrack();
  }, [addTrack]);
  */

  useEffect(() => {
    addTrack();

    return () => {
      //TrackPlayer.stop();
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Podcast Details</Text>

      <Image
        source={{
          uri: 'https://t3.ftcdn.net/jpg/05/10/75/30/360_F_510753092_f4AOmCJAczuGgRLCmHxmowga2tC9VYQP.jpg',
        }}
        style={styles.podcastImage}
      />

      <Text style={styles.episodeTitle}>Episode 1: The AI Revolution</Text>
      <Text style={styles.podcastTitle}>The Curious Minds Podcast</Text>

      <View style={styles.metaInfo}>
        <Text style={styles.metaText}>June 25, 2025</Text>
        <Text style={styles.metaText}>2.1K Views</Text>
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
          (playbackState.state === State.Buffering) &&
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
    </View>
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
  },
  header: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
    color: '#444',
  },
  podcastImage: {
    width: 250,
    height: 250,
    alignSelf: 'center',
    borderRadius: 16,
    marginBottom: 24,
  },
  episodeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1E1E1E',
  },
  podcastTitle: {
    fontSize: 16,
    textAlign: 'center',
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
    marginTop: 8,
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
