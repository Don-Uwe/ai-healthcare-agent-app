// PodcastsScreen component displays the list of podcasts and includes a PodcastPlayer
/*
const PodcastsScreen = ({navigation}: PodcastScreenProps) => {
  const headerHeight = useHeaderHeight();

  // Effect to handle back navigation and show an exit confirmation alert
  /*
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', e => {
      e.preventDefault();
      Alert.alert(
        'Warning',
        'Do you want to exit',
        [
          {text: 'No', onPress: () => null},
          {text: 'Yes', onPress: () => {
            BackHandler.exitApp()
          }},
        ],
        {cancelable: true},
      );
    });

    return unsubscribe;
  }, [navigation]);
  */
{
  /**
  return (
    // Main container
    <View style={styles.container}>
        Header with PodcastPlayer }
        <View style={[styles.header, {paddingTop: headerHeight}]}>
        <PodcastPlayer />
      </View>
      {/* Content including recent podcasts list }
      <View style={styles.content}>
        <View style={styles.recentPodcastsHeader}>
          <Text style={styles.recentPodcastsTitle}>Recent Podcasts</Text>
          <TouchableOpacity>
            <Text style={styles.seeMoreText}>See more</Text>
          </TouchableOpacity>
        </View>
        {/* FlatList to display podcasts }
        <FlatList
          data={podcast}
          renderItem={({item}) => (
            <PodcastCard
              imageUri={item.imageUri}
              title={item.title}
              host={item.host}
              duration={item.duration}
              likes={item.likes}
            />
          )}
          contentInsetAdjustmentBehavior="always"
          automaticallyAdjustContentInsets={true}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: Dimensions.get('screen').height - hp(40),
          }}
        />
      </View>
      }

      <Text style={styles.recentPodcastsTitle}>Coming Soon</Text>
    </View>
  );
  */
}
import React, {useEffect, useState} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import axios from 'axios';
import TrackPlayer, {Capability} from 'react-native-track-player';
import PodcastCard from '../components/PodcastCard';
import {ON_PRIMARY_COLOR} from '../helper/Theme';
import {hp} from '../helper/Metric';
import {PodcastScreenProps} from '../type';

export interface Podcast {
  trackId: number;
  trackName: string;
  trackViewUrl: string;
  artistName: string;
}

const PodcastsScreen = ({navigation}: PodcastScreenProps) => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTrackId, setCurrentTrackId] = useState<number | null>(null);
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast>();

  useEffect(() => {
    // setupPlayer();
    fetchPodcasts();

    return () => {
      //TrackPlayer.stop();
    };
  }, []);

 
  /*
  let isPlayerInitialized = false;
  const setupPlayer = async () => {
    if (isPlayerInitialized) {
      return;
    }
    await TrackPlayer.setupPlayer();

    isPlayerInitialized = true;

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
  };
  */
  

  const fetchPodcasts = async () => {
    try {
      const res = await axios.get(
        'https://itunes.apple.com/search?media=podcast&term=technology',
      );
      setPodcasts(res.data.results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const playPodcast = async () => {
    if (!selectedPodcast) {
      return;
    }
    /*
    await TrackPlayer.reset();
    await TrackPlayer.add({
      id: podcast.trackId.toString(),
      url: 'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg',
      title: podcast.trackName,
      artist: podcast.artistName,
    });
    await TrackPlayer.play();
    setCurrentTrackId(podcast.trackId);
    */
    /*
    navigation.navigate('PodcastDetail', {
      podcast: {
        title: selectedPodcast.trackName,
        host: selectedPodcast.artistName,
        imageUri: '',
        likes: 20,
        duration: '20 mins',
      },
    });
    */
    navigation.navigate('PodcastDetail', {
      podcast: {
        title: selectedPodcast.trackName ?? '',
        host: selectedPodcast.artistName ?? '',
        imageUri: '',
        likes: 20,
        duration: '20 mins',
      },
      trackId: selectedPodcast.trackId,
    });
  };

  const renderItem = ({item}: {item: Podcast}) => (
    <Pressable
      onPress={() => {
        setSelectedPodcast(item);
        playPodcast();
      }}>
      <PodcastCard
        title={item.trackName}
        host={item.artistName}
        likes={20}
        duration={'20 mins'}
        handleClick={() => {
          setSelectedPodcast(item);
          playPodcast();
        }}
      />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={podcasts}
          keyExtractor={item => item.trackId.toString()}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

export default PodcastsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: hp(10),
    paddingHorizontal: 16,
    backgroundColor: ON_PRIMARY_COLOR,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  item: {
    paddingVertical: 12,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  artist: {
    fontSize: 14,
    color: '#666',
  },
});

/*
// Styles for PodcastsScreen component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
  },
  header: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingBottom: 20,
  },
  content: {
    marginTop: 15,
    paddingHorizontal: 16,
  },
  recentPodcastsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  recentPodcastsTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'white',
    alignSelf: 'center',
  },
  seeMoreText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
*/
