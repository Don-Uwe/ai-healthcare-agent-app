import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {PodcastProfileProp, PodcastData, PlayList} from '../type';
import {MaterialCommunityIcons, Feather, Ionicons} from '@expo/vector-icons';
import {PRIMARY_COLOR} from '../helper/Theme';
import {useSelector} from 'react-redux';
import {useFocusEffect} from '@react-navigation/native';
import {useGetPlaylists} from '../hooks/useGetPlaylists';
import {useGetUserPublishedPodcasts} from '../hooks/useGetUserPublishedPodcasts';
import Loader from '../components/Loader';
import PodcastCard from '../components/PodcastCard';
import {GET_STORAGE_DATA} from '../helper/APIUtils';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {NoPodcastState} from '../components/EmptyStates';
import {useGetProfile} from '../hooks/useGetProfile';
import {downloadAudio, msToTime} from '../helper/Utils';
import Snackbar from 'react-native-snackbar';

const {width} = Dimensions.get('window');

export default function PodcastProfile({navigation}: PodcastProfileProp) {
  const insets = useSafeAreaInsets();
  const [selectedTab, setSelectedTab] = useState<'podcasts' | 'playlists'>(
    'podcasts',
  );
  const [refreshing, setRefreshing] = useState(false);
  const {user_name, Profile_image, user_handle} = useSelector(
    (state: any) => state.user,
  );
  const {isConnected} = useSelector((state: any) => state.network);

  const [publishedPage, setPublishedPage] = useState(1);
  const [totalPublishPages, setTotalPublishPages] = useState(0);
  const [podcasts, setPublishedPodcasts] = useState<PodcastData[]>([]);

  const {
    data: playlistsData,
    refetch: refetchPlaylists,
    isLoading: playlistsLoading,
  } = useGetPlaylists();

  const {
    data: podcastsData,
    refetch: refetchPodcasts,
    isLoading: podcastsLoading,
  } = useGetUserPublishedPodcasts(publishedPage, isConnected);

  const {data: user} = useGetProfile();

  useEffect(() => {
    if (podcastsData) {
      if (Number(publishedPage) === 1 && podcastsData.totalPages) {
        let totalPage = podcastsData.totalPages;
        setTotalPublishPages(totalPage);

        setPublishedPodcasts(podcastsData.publishedPodcasts);
      } else {
        if (podcastsData.publishedPodcasts) {
          let oldPodcasts =
            (podcasts as PodcastData[]) ?? ([] as PodcastData[]);
          let newPodcasts = podcastsData.publishedPodcasts as PodcastData[];
          setPublishedPodcasts([...oldPodcasts, ...newPodcasts]);
        }
      }
    }
  }, [podcastsData, publishedPage]);

  const playlists = playlistsData || [];

  const totalPlaylists = playlists.length;

  useFocusEffect(
    useCallback(() => {
      refetchPlaylists();
      refetchPodcasts();
    }, [refetchPlaylists, refetchPodcasts]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    setPublishedPage(1);
    await Promise.all([refetchPlaylists(), refetchPodcasts()]);
    setRefreshing(false);
  };

  const renderPlaylistItem = ({item}: {item: PlayList}) => (
    <TouchableOpacity
      style={styles.playlistCard}
      activeOpacity={0.7}
      onPress={() => {
     
      }}>
      <View style={styles.playlistIconContainer}>
        <MaterialCommunityIcons
          name="playlist-music"
          size={32}
          color={PRIMARY_COLOR}
        />
      </View>
      <View style={styles.playlistInfo}>
        <Text style={styles.playlistTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.playlistCount}>
          {Array.isArray(item.podcasts) ? item.podcasts.length : 0} podcasts
        </Text>
      </View>
      <Feather name="chevron-right" size={20} color="#9ca3af" />
    </TouchableOpacity>
  );

  const renderPodcastItem = ({item}: {item: PodcastData}) => (
    <View style={styles.podcastCardWrapper}>
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
          navigation.navigate('PodcastDetail', {
            trackId: item._id,
            audioUrl: item.audio_url,
          });
        }}
        imageUri={item.cover_image}
        handleReport={() => {}}
        playlistAct={() => {
          setSelectedTab('playlists');
        }}
      />
    </View>
  );

  if (playlistsLoading && podcastsLoading) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: insets.bottom + 20},
        ]}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            {Profile_image ? (
              <Image
                source={{
                  uri: user?.Profile_image.startsWith('http')
                    ? user?.Profile_image
                    : `${GET_STORAGE_DATA}/${user?.Profile_image}`,
                }}
                style={styles.profileImage}
              />
            ) : (
              <View
                style={[styles.profileImage, styles.profileImagePlaceholder]}>
                <MaterialCommunityIcons
                  name="account"
                  size={60}
                  color="#9ca3af"
                />
              </View>
            )}
          </View>
          <Text style={styles.profileName}>{user?.user_name || 'User'}</Text>
          <Text style={styles.profileHandle}>
            @{user?.user_handle || 'user'}
          </Text>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{podcasts?.length}</Text>
              <Text style={styles.statLabel}>Podcasts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalPlaylists}</Text>
              <Text style={styles.statLabel}>Playlists</Text>
            </View>
          </View>

          <TouchableOpacity
            style={{...styles.createButton,  marginVertical: 4}}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('OverviewScreen')}>
            
            <Text style={styles.createButtonText}>Visit Workspace</Text>
          </TouchableOpacity>
          {/* Create Podcast Button */}
          <TouchableOpacity
            style={styles.createButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('PodcastForm')}>
            <Ionicons name="mic" size={20} color="#ffffff" />
            <Text style={styles.createButtonText}>Create Podcast</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'podcasts' && styles.activeTab]}
            onPress={() => setSelectedTab('podcasts')}
            activeOpacity={0.7}>
            <MaterialCommunityIcons
              name="microphone"
              size={20}
              color={selectedTab === 'podcasts' ? PRIMARY_COLOR : '#6b7280'}
            />
            <Text
              style={[
                styles.tabText,
                selectedTab === 'podcasts' && styles.activeTabText,
              ]}>
              Podcasts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'playlists' && styles.activeTab,
            ]}
            onPress={() => setSelectedTab('playlists')}
            activeOpacity={0.7}>
            <MaterialCommunityIcons
              name="playlist-music"
              size={20}
              color={selectedTab === 'playlists' ? PRIMARY_COLOR : '#6b7280'}
            />
            <Text
              style={[
                styles.tabText,
                selectedTab === 'playlists' && styles.activeTabText,
              ]}>
              Playlists
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          {selectedTab === 'podcasts' ? (
            podcasts && podcasts.length > 0 ? (
              <FlatList
                data={podcasts ?? []}
                renderItem={renderPodcastItem}
                keyExtractor={(item, index) => `podcast-${item._id}-${index}`}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                refreshing={refreshing}
                onRefresh={onRefresh}
                ListEmptyComponent={<NoPodcastState onRefresh={onRefresh} />}
                onEndReached={() => {
                  if (publishedPage < totalPublishPages) {
                    setPublishedPage(prev => prev + 1);
                  }
                }}
                onEndReachedThreshold={0.5}
              />
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons
                  name="microphone-off"
                  size={64}
                  color="#d1d5db"
                />
                <Text style={styles.emptyText}>No podcasts yet</Text>
                <Text style={styles.emptySubText}>
                  Create your first podcast to share with the world
                </Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => navigation.navigate('PodcastForm')}>
                  <Text style={styles.emptyButtonText}>Create Podcast</Text>
                </TouchableOpacity>
              </View>
            )
          ) : playlists.length > 0 ? (
            <FlatList
              data={playlists}
              renderItem={renderPlaylistItem}
              keyExtractor={(item, index) => `playlist-${item._id}-${index}`}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="playlist-music-outline"
                size={64}
                color="#d1d5db"
              />
              <Text style={styles.emptyText}>No playlists yet</Text>
              <Text style={styles.emptySubText}>
                Save podcasts to create your first playlist
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  profileHeader: {
    backgroundColor: '#ffffff',
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: PRIMARY_COLOR,
  },
  profileImagePlaceholder: {
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  profileHandle: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: PRIMARY_COLOR,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e7eb',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    gap: 8,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 8,
  },
  activeTab: {
    backgroundColor: `${PRIMARY_COLOR}15`,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: PRIMARY_COLOR,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  playlistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  playlistIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: `${PRIMARY_COLOR}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playlistInfo: {
    flex: 1,
    marginRight: 8,
  },
  playlistTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  playlistCount: {
    fontSize: 13,
    color: '#6b7280',
  },
  podcastCardWrapper: {
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
