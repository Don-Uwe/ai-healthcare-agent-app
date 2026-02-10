import {useCallback, useEffect, useState} from 'react';
import {
  StyleSheet,
  Pressable,
  TouchableOpacity,
  NativeModules,
  ScrollView,
  Alert,
  Text,
  FlatList,
} from 'react-native';

import {YStack, View} from 'tamagui';
import axios from 'axios';
import PodcastCard from '../components/PodcastCard';
import {hp, wp} from '../helper/Metric';
import {Category, PodcastData, PodcastScreenProps} from '../type';
import {useDispatch, useSelector} from 'react-redux';
import {useMutation, useQuery} from '@tanstack/react-query';
import {downloadAudio, msToTime} from '../helper/Utils';
import {
  ARTICLE_TAGS_API,
  GET_ALL_PODCASTS,
  PROD_URL,
  UPDATE_PODCAST_VIEW_COUNT,
} from '../helper/APIUtils';
import Snackbar from 'react-native-snackbar';
import {
  setaddedPodcastId,
  setPodcasts,
  setSelectedTags,
  setTags,
} from '../store/dataSlice';
import CreatePlaylist from '../components/CreatePlaylist';
import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../helper/Theme';

import CreateIcon from '../components/CreateIcon';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StatusBar} from 'expo-status-bar';
import {MaterialIcons} from '@expo/vector-icons';

const {WavAudioRecorder} = NativeModules;
//const recorderEvents = new NativeEventEmitter(WavAudioRecorder);

const PodcastsScreen = ({navigation}: PodcastScreenProps) => {
  const dispatch = useDispatch();
  const {user_token, user_id} = useSelector((state: any) => state.user);
  const {selectedTags, sortType} = useSelector((state: any) => state.data);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const {podcasts} = useSelector((state: any) => state.data);
  const {isConnected} = useSelector((state: any) => state.network);
  const [playlistModalOpen, setPlaylistModalOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const getAllCategories = useCallback(async () => {
    if (!isConnected) {
      return;
    }
    if (user_token === '') {
      Alert.alert('No token found');
      return;
    }
    const {data: categoryData} = await axios.get(
      `${PROD_URL + ARTICLE_TAGS_API}`,
      {
        headers: {
          Authorization: `Bearer ${user_token}`,
        },
      },
    );

    dispatch(
      setSelectedTags({
        selectedTags: categoryData,
      }),
    );
    setSelectedCategory(categoryData[0]);

    dispatch(setTags({tags: categoryData}));
  }, [dispatch, isConnected, user_token]);

  useEffect(() => {
    if (
      selectedTags === undefined ||
      (selectedTags && selectedTags.length === 0)
    ) {
      getAllCategories();
    }

    return () => {};
  }, [getAllCategories, selectedTags]);

  const openPlaylist = (id: string) => {
    // setPlaylistIds([id]);
    dispatch(setaddedPodcastId(id));
    // console.log('playlist ids', playlistIds);
    setPlaylistModalOpen(true);
  };

  const closePlaylist = () => {
    setPlaylistModalOpen(false);
    // setPlaylistIds([]);
    dispatch(setaddedPodcastId(''));
  };

  const {refetch} = useQuery({
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
    enabled: isConnected && !!user_token && !!page,
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

  // const {latestPodcasts, recommendedPodcasts, allPodcasts} = useMemo(() => {
  //   if (!podcasts?.length) {
  //     return {latestPodcasts: [], recommendedPodcasts: [], allPodcasts: []};
  //   }

  //   const now = new Date();
  //   const latest = podcasts.filter(
  //     p => differenceInDays(now, new Date(p.updated_at)) <= 7,
  //   );

  //   const withViews = [...podcasts].sort(
  //     (a, b) => (b.viewUsers?.length || 0) - (a.viewUsers?.length || 0),
  //   );

  //   const recommended = withViews.slice(0, 5);
  //   return {
  //     latestPodcasts: latest,
  //     recommendedPodcasts: recommended,
  //     allPodcasts: podcasts,
  //   };
  // }, [podcasts]);

  const filteredPodcasts = selectedCategory
  ? podcasts.filter(
      (podcast: PodcastData) =>
        podcast.tags?.some(
          tag => tag.name === selectedCategory.name
        )
    )
  : [];


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
        audioUrl: data.audio_url,
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
      key={item._id}
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
          if (isConnected) {
            await downloadAudio(item);
          } else {
            Snackbar.show({
              text: 'Internet connection required',
              duration: Snackbar.LENGTH_SHORT,
            });
          }
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
      <StatusBar style="light" backgroundColor={'#000A60'} />

      <View style={styles.buttonContainer}>
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{flex:1}}
        >
          {selectedTags &&
            selectedTags.length > 0 &&
            selectedTags.map((item: Category, index: number) => (
              <TouchableOpacity
                key={index}
                style={{
                  ...styles.button,
                  backgroundColor:
                    selectedCategory && selectedCategory._id !== item._id
                      ? 'white'
                      : PRIMARY_COLOR,
                  borderColor:
                    selectedCategory && selectedCategory._id !== item._id
                      ? PRIMARY_COLOR
                      : 'white',
                }}
                onPress={() => {
                  setSelectedCategory(item);
                }}>
                <Text
                  style={{
                    ...styles.labelStyle,
                    color:
                      selectedCategory && selectedCategory._id !== item._id
                        ? 'black'
                        : 'white',
                  }}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
        </ScrollView>
      </View>

      <YStack flex={1} padding="$2">
        <FlatList
          data={
            filteredPodcasts
              ? filteredPodcasts.filter(
                  (podcast: PodcastData) =>
                    podcast.tags &&
                    podcast.tags.some(
                      tag => tag.name === selectedCategory?.name,
                    ),
                )
              : []
          }
          
          renderItem={renderItem}
          keyExtractor={item => item._id.toString()}
          contentContainerStyle={styles.flatListContentContainer}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons
                name="podcasts"
                size={64}
                color="#B0B0B0"
                style={styles.icon}
              />
              <Text style={styles.message}>No podcasts found</Text>
              <Text style={styles.subMessage}>
                New episodes will appear here once added
              </Text>
            </View>
          }
          onEndReached={() => {
            if (page < totalPages) {
              setPage(prev => prev + 1);
            }
          }}
          onEndReachedThreshold={0.5}
        />
      </YStack>

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
    paddingHorizontal: 10,
    backgroundColor: ON_PRIMARY_COLOR,
  },

  homePlusIconview: {
    bottom: hp(5),
    right: 25,
    position: 'absolute',
    zIndex: 10,
  },

  buttonContainer: {
    marginTop: wp(3),
    flexDirection: 'row',
    paddingHorizontal: 2,
  },
  button: {
    flex: 0,
    borderRadius: wp(3.5),
    marginHorizontal: 6,
    marginVertical: 4,
    padding: wp(3.1),
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelStyle: {
    fontWeight: 'bold',
    fontSize: 15,
    textTransform: 'capitalize',
  },

  flatListContentContainer: {
    paddingHorizontal: 16,
    marginTop: 10,
    paddingBottom: 120,
  },

  message: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'bold',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  icon: {
    marginBottom: 12,
  },

  subMessage: {
    marginTop: 6,
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
  },
});
