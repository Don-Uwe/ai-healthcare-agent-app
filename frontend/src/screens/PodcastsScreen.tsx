import {useMemo, useState} from 'react';
import {
  StyleSheet,
  Pressable,
  TouchableOpacity,
  NativeModules,
  ScrollView,
  NativeEventEmitter,
  RefreshControl,
} from 'react-native';

import {YStack, XStack, H5, Input} from 'tamagui';
import {Feather} from '@expo/vector-icons';
import axios from 'axios';
import PodcastCard from '../components/PodcastCard';
import {hp} from '../helper/Metric';
import {PodcastData, PodcastScreenProps} from '../type';
import {useDispatch, useSelector} from 'react-redux';
import {useMutation, useQuery} from '@tanstack/react-query';
import {downloadAudio, msToTime} from '../helper/Utils';
import {
  GET_ALL_PODCASTS,
  GET_STORAGE_DATA,
  UPDATE_PODCAST_VIEW_COUNT,
} from '../helper/APIUtils';
import {differenceInDays} from 'date-fns';
import Snackbar from 'react-native-snackbar';
import {setaddedPodcastId, setPodcasts} from '../store/dataSlice';
import CreatePlaylist from '../components/CreatePlaylist';
import {BUTTON_COLOR, ON_PRIMARY_COLOR} from '../helper/Theme';

import CreateIcon from '../components/CreateIcon';
import {SafeAreaView} from 'react-native-safe-area-context';

const {WavAudioRecorder} = NativeModules;
const recorderEvents = new NativeEventEmitter(WavAudioRecorder);

const PodcastsScreen = ({navigation}: PodcastScreenProps) => {
  const dispatch = useDispatch();
  const {user_token, user_id} = useSelector((state: any) => state.user);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const {podcasts} = useSelector((state: any) => state.data);
  const [playlistModalOpen, setPlaylistModalOpen] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // const [playlistIds, setPlaylistIds] = useState<string[]>([]);

  const openPlaylist = (id: string) => {
    // setPlaylistIds([id]);
    dispatch(setaddedPodcastId(id));
    // console.log('playlist ids', playlistIds);
    setPlaylistModalOpen(true);
  };

  const generateUrl = (url: string) => {
    if (url && url.startsWith('https')) return url;
    else return `${GET_STORAGE_DATA}/${url}`;
  };
  const closePlaylist = () => {
    setPlaylistModalOpen(false);
    // setPlaylistIds([]);
    dispatch(setaddedPodcastId(''));
  };

  const {isLoading, refetch} = useQuery({
    queryKey: ['get-all-podcasts', page],
    queryFn: async () => {
      try {
        const response = await axios.get(`${GET_ALL_PODCASTS}?page=${page}`, {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        });

        if (Number(page) === 1) {
          if (response.data.totalPages) {
            const total = response.data.totalPages;
            setTotalPages(total);
          }
          if (response.data.allPodcasts) {
            let data = response.data.allPodcasts as PodcastData[];
            dispatch(setPodcasts(data));
          }
        } else {
          const oldPodcasts = podcasts;
          let data = response.data.allPodcasts as PodcastData[];
          dispatch(setPodcasts([...oldPodcasts, ...data]));
        }
        const d = response.data.allPodcasts as PodcastData[];
        return d;
      } catch (err) {
        console.error('Error fetching podcasts:', err);
      }
    },
    enabled: !!user_token && !!page,
  });

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    refetch();
    setRefreshing(false);
  };

  const handleScroll = ({nativeEvent}: {nativeEvent: any}) => {
    const {layoutMeasurement, contentOffset, contentSize} = nativeEvent;
    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

    if (isCloseToBottom && page < totalPages) {
      setPage(prev => prev + 1);
    }
  };

  const {latestPodcasts, recommendedPodcasts, allPodcasts} = useMemo(() => {
    if (!podcasts?.length) {
      return {latestPodcasts: [], recommendedPodcasts: [], allPodcasts: []};
    }

    const now = new Date();
    const latest = podcasts.filter(
      p => differenceInDays(now, new Date(p.updated_at)) <= 7,
    );

    const withViews = [...podcasts].sort(
      (a, b) => (b.viewUsers?.length || 0) - (a.viewUsers?.length || 0),
    );

    // Step 3: take top 5–10 as recommended
    const recommended = withViews.slice(0, 2);

    const latestIds = new Set(latest.map(p => p._id));
    const recommendedIds = new Set(recommended.map(p => p._id));
    const all = podcasts.filter(
      p => !latestIds.has(p._id) && !recommendedIds.has(p._id),
    );

    return {
      latestPodcasts: latest,
      recommendedPodcasts: recommended,
      allPodcasts: all,
    };
  }, [podcasts]);

  const navigateToReport = (podcastId: string) => {
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

  const renderItem = ({item, i}: {item: PodcastData; i: number}) => (
    <Pressable
      key={i}
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
        handleReport={() => {
          navigateToReport(item._id);
        }}
        playlistAct={openPlaylist}
      />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={400}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <YStack flex={1} p="$2">
          {/* Header */}
          <H5
            marginVertical="$2"
            color="$color"
            fontWeight="700"
            fontSize={17}
            letterSpacing={0.5}>
            Recommended
          </H5>

          {recommendedPodcasts.map((item: PodcastData, i: number) =>
            renderItem({item, i}),
          )}

          <H5
            marginVertical="$2"
            color="$color"
            fontWeight="700"
            fontSize={17}
            letterSpacing={0.5}>
            All
          </H5>
          {/* Featured Podcast */}
          {allPodcasts.map((item: PodcastData, i: number) =>
            renderItem({item, i}),
          )}

          <H5
            marginVertical="$2"
            color="$color"
            fontWeight="700"
            fontSize={17}
            letterSpacing={0.5}>
            Latest Episodes
          </H5>
          {latestPodcasts.map((item: PodcastData, i: number) =>
            renderItem({item, i}),
          )}
        </YStack>
      </ScrollView>

      <CreatePlaylist visible={playlistModalOpen} dismiss={closePlaylist} />

      <TouchableOpacity
        style={styles.homePlusIconview}
        onPress={() => {
          console.log('Add icon clicked');
          navigation.navigate('PodcastForm');
        }}>
        <CreateIcon
          callback={() => {
            console.log('Add icon clicked');
            navigation.navigate('PodcastForm');
          }}
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default PodcastsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: hp(10),
    paddingHorizontal: 12,
    backgroundColor: ON_PRIMARY_COLOR,
  },

  homePlusIconview: {
    bottom: hp(5),
    right: 25,
    position: 'absolute',
    zIndex: 10,
  },
});
