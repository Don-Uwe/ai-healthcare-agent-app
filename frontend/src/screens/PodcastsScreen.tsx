import {useEffect, useState} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  NativeModules,
  Text,
  FlatList,
  ActivityIndicator,
} from 'react-native';

import {YStack, View, XStack} from 'tamagui';
import PodcastCard from '../components/PodcastCard';
import {hp} from '../helper/Metric';
import {PodcastData, PodcastScreenProps} from '../type';
import {useDispatch, useSelector} from 'react-redux';
import {downloadAudio, msToTime} from '../helper/Utils';
import Snackbar from 'react-native-snackbar';
import {setaddedPodcastId, setPodcasts, appendPodcasts} from '../store/dataSlice';
import CreatePlaylist from '../components/CreatePlaylist';

import {SafeAreaView} from 'react-native-safe-area-context';
import {StatusBar} from 'expo-status-bar';
import {Ionicons} from '@expo/vector-icons';
import {GlassStyles, ProfessionalColors} from '../styles/GlassStyles';
import CreateIcon from '../components/CreateIcon';
import {useGetAllPodcasts} from '../hooks/useGetAllPodcasts';
import {useUpdatePodcastViewcount} from '../hooks/useUpdatePodcastViewcount';
import { PodcastLoadingState } from '../components/EmptyStates';

const {WavAudioRecorder} = NativeModules;
//const recorderEvents = new NativeEventEmitter(WavAudioRecorder);

const PodcastsScreen = ({navigation}: PodcastScreenProps) => {
  const dispatch = useDispatch();
  const {user_id} = useSelector((state: any) => state.user);
  // const {selectedTags, sortType} = useSelector((state: any) => state.data);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const {podcasts} = useSelector((state: any) => state.data);
  const {isConnected} = useSelector((state: any) => state.network);
  const [playlistModalOpen, setPlaylistModalOpen] = useState<boolean>(false);
  // const [selectedCategory, setSelectedCategory] = useState<Category>();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const {
    data: podcastData,
    isLoading,
    refetch,
  } = useGetAllPodcasts(isConnected, page);

  const {mutate: updateViewCount} = useUpdatePodcastViewcount();

  useEffect(() => {
    if (podcastData) {
      if (Number(page) === 1) {
        if (podcastData.totalPages) {
          const total = podcastData.totalPages;
          setTotalPages(total);
        }
        if (podcastData.allPodcasts) {
          let data = podcastData.allPodcasts as PodcastData[];
          dispatch(setPodcasts(data));
        }
      } else {
        if (podcastData.allPodcasts) {
          let data = podcastData.allPodcasts as PodcastData[];
          dispatch(appendPodcasts(data));
        }
      }
    }
  }, [podcastData, page]);

  const openPlaylist = (id: string) => {
    dispatch(setaddedPodcastId(id));
    setPlaylistModalOpen(true);
  };

  const closePlaylist = () => {
    setPlaylistModalOpen(false);
    dispatch(setaddedPodcastId(''));
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    refetch();
    setRefreshing(false);
  };


  const navigateToReport = (podcastId: string) => {
    navigation.navigate('ReportScreen', {
      articleId: '',
      authorId: user_id,
      commentId: null,
      podcastId: podcastId,
    });
  };


  const renderItem = ({item}: {item: PodcastData}) => (
    <PodcastCard
      id={item._id}
      title={item.title}
      audioUrl={item.audio_url}
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
        updateViewCount(item._id, {
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
      }}
      imageUri={item.cover_image}
      handleReport={() => {
        navigateToReport(item._id);
      }}
      playlistAct={openPlaylist}
    />
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
     <PodcastLoadingState/>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View
        style={[GlassStyles.glassCard, {padding: 40, alignItems: 'center'}]}>
        <View style={styles.emptyIconContainer}>
          <Ionicons
            name="headset-outline"
            size={64}
            color={ProfessionalColors.gray400}
          />
        </View>
        <Text style={styles.message}>No podcasts found</Text>
        <Text style={styles.subMessage}>
          New episodes will appear here once added
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#007AFF" />

      {/* Header Section */}
      <View style={[GlassStyles.glassCard, styles.header]}>
        <XStack alignItems="center" justifyContent="space-between">
          <XStack alignItems="center" gap="$3">
            <Ionicons
              name="headset"
              size={28}
              color={ProfessionalColors.primary}
            />
            <YStack>
              <Text style={styles.headerTitle}>Podcasts</Text>
              <Text style={styles.headerSubtitle}>
                {podcasts?.length || 0} episodes available
              </Text>
            </YStack>
          </XStack>
        </XStack>
      </View>

      <YStack flex={1} paddingHorizontal="$3">
        {isLoading && !podcasts?.length ? (
          renderLoadingState()
        ) : (
          <FlatList
            data={podcasts}
            renderItem={renderItem}
            keyExtractor={item => item._id.toString()}
            contentContainerStyle={styles.flatListContentContainer}
            refreshing={refreshing}
            onRefresh={onRefresh}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState}
            onEndReached={() => {
              if (page < totalPages) {
                setPage(prev => prev + 1);
              }
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isLoading && podcasts?.length > 0 ? (
                <View style={styles.footerLoading}>
                  <ActivityIndicator
                    size="small"
                    color={ProfessionalColors.primary}
                  />
                </View>
              ) : null
            }
          />
        )}
      </YStack>

      <CreatePlaylist visible={playlistModalOpen} dismiss={closePlaylist} />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
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
    backgroundColor: ProfessionalColors.gray50,
    paddingTop: hp(1),
  },

  header: {
    marginHorizontal: 16,
    marginTop: hp(10),
    marginBottom: 16,
    padding: 16,
    borderRadius: hp(2),
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: ProfessionalColors.gray900,
  },

  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: ProfessionalColors.gray600,
    marginTop: 2,
  },

  flatListContentContainer: {
    paddingTop: 8,
    paddingBottom: 120,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },

  loadingIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: ProfessionalColors.glassWhiteMedium,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  loadingText: {
    fontSize: 18,
    fontWeight: '700',
    color: ProfessionalColors.gray900,
    textAlign: 'center',
    marginTop: 8,
  },

  loadingSubText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: ProfessionalColors.gray600,
    textAlign: 'center',
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },

  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: ProfessionalColors.glassWhiteMedium,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  message: {
    fontSize: 18,
    fontWeight: '700',
    color: ProfessionalColors.gray900,
    textAlign: 'center',
    marginTop: 8,
  },

  subMessage: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: ProfessionalColors.gray600,
    textAlign: 'center',
  },

  footerLoading: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  fab: {
    position: 'absolute',
    bottom: hp(10),
    right: 20,
    zIndex: 10,
    shadowColor: ProfessionalColors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },

  fabInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
