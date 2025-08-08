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
import React, {useState} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import PodcastCard from '../components/PodcastCard';
import {hp} from '../helper/Metric';
import {PodcastData, PodcastScreenProps} from '../type';
import {useDispatch, useSelector} from 'react-redux';
import {useMutation, useQuery} from '@tanstack/react-query';
import {downloadAudio, msToTime} from '../helper/Utils';
import {GET_ALL_PODCASTS, UPDATE_PODCAST_VIEW_COUNT} from '../helper/APIUtils';
import PodcastEmptyComponent from '../components/PodcastEmptyComponent';
import Snackbar from 'react-native-snackbar';
import {setaddedPodcastId, setPodcasts} from '../store/dataSlice';
import CreatePlaylist from '../components/CreatePlaylist';
import { ON_PRIMARY_COLOR } from '../helper/Theme';
import AddIcon from '../components/AddIcon';
import { NativeModules, NativeEventEmitter } from 'react-native';
import CreateIcon from '../components/CreateIcon';

const { WavAudioRecorder } = NativeModules;
const recorderEvents = new NativeEventEmitter(WavAudioRecorder);

const PodcastsScreen = ({navigation}: PodcastScreenProps) => {
  const dispatch = useDispatch();
  const {user_token, user_id} = useSelector((state: any) => state.user);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const {podcasts} = useSelector((state: any) => state.data);
  const [playlistModalOpen, setPlaylistModalOpen] = useState<boolean>(false);
 // const [playlistIds, setPlaylistIds] = useState<string[]>([]);

  const openPlaylist = (id: string)=>{

   // setPlaylistIds([id]);
    dispatch(setaddedPodcastId(id));
    // console.log('playlist ids', playlistIds);
    setPlaylistModalOpen(true);

  };
  const closePlaylist = ()=>{
    setPlaylistModalOpen(false);
   // setPlaylistIds([]);
    dispatch(setaddedPodcastId(''));
  };

  const {isLoading, refetch} = useQuery({
    queryKey: ['get-all-podcasts'],
    queryFn: async () => {
      try {
        if (user_token === '') {
          throw new Error('No token found');
        }
        const response = await axios.get(`${GET_ALL_PODCASTS}`, {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        });
        const d = response.data as PodcastData[];
        dispatch(setPodcasts(d));
        return d;
      } catch (err) {
        console.error('Error fetching podcasts:', err);
      }
    },
  });


  const onRefresh = () => {
    setRefreshing(true);
    refetch();
    setRefreshing(false);
  };

  const navigateToReport = podcastId => {
    navigation.navigate('ReportScreen', {
      articleId: '',
      authorId: user_id,
      commentId: null,
      podcastId: podcastId,
    });
  };
  const updateViewCountMutation = useMutation({
    mutationKey: ['update-podcast-view-count'],
    mutationFn: async (podcastId: string) => {
      const res = await axios.post(
        `${UPDATE_PODCAST_VIEW_COUNT}`,
        {
          podcast_id: podcastId,
        },
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );
      return res.data.data as PodcastData;
    },
    onSuccess: data => {
      navigation.navigate('PodcastDetail', {
        trackId: data._id,
      });
    },
    onError: err => {
      console.log('Update view count err', err);
      Snackbar.show({
        text: 'Something went wrong!',
        duration: Snackbar.LENGTH_SHORT,
      });
    },
  });

  const renderItem = ({item}: {item: PodcastData}) => (
    <Pressable
      onPress={() => {
        //playPodcast(item);
        updateViewCountMutation.mutate(item._id);
      }}>
      <PodcastCard
        id={item._id}
        title={item.title}
        host={item.user_id.user_name}
        views={item.viewUsers.length}
        duration={`${msToTime(item.duration)}`}
        tags={item.tags}
        downloaded={false}
        display={true}
        downLoadAudio={async () => {
          await downloadAudio(item);
        }}
        handleClick={() => {
          updateViewCountMutation.mutate(item._id);
        }}
        imageUri={item.cover_image}
        handleReport={()=>{
          navigateToReport(item._id);
        }}
       playlistAct={openPlaylist}
      />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={podcasts ? podcasts : []}
          keyExtractor={item => item._id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={<PodcastEmptyComponent />}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}





      <CreatePlaylist
        visible={playlistModalOpen}
        dismiss={closePlaylist}
      />

        <TouchableOpacity
  style={styles.homePlusIconview}
  onPress={() => {
    console.log('Add icon clicked');
    navigation.navigate('PodcastRecorder');
  }}
>
  <CreateIcon callback={()=>{
        console.log('Add icon clicked');
    navigation.navigate('PodcastRecorder');
  }}/>
</TouchableOpacity>
    </View>
  );
};

export default PodcastsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: hp(10),
    paddingHorizontal: 12,
    backgroundColor: ON_PRIMARY_COLOR,
    //backgroundColor: '#ffffff',
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
   homePlusIconview: {
    bottom: 100,
    right: 25,
    position: 'absolute',
    zIndex: 10,
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
