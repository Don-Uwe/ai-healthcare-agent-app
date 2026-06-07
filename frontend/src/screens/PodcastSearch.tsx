// PodcastSearch.tsx
import React, {useEffect, useState, useCallback, useRef} from 'react';
import {Pressable, FlatList, AccessibilityInfo} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {PodcastData, PodcastSearchProp} from '../type';
import {AxiosError} from 'axios';
import {useSelector} from 'react-redux';
import PodcastCard from '../components/PodcastCard';
import PodcastSkeletonCard from '../components/PodcastSkeletonCard';
import {msToTime} from '../helper/Utils';
import Snackbar from 'react-native-snackbar';
import NoResults from '../components/NoResult';
import {PRIMARY_COLOR} from '../helper/Theme';
import {XStack, YStack, Input, Separator, Text, useTheme} from 'tamagui';
import {Feather} from '@expo/vector-icons';
import {useUpdatePodcastViewcount} from '../hooks/useUpdatePodcastViewcount';
import {useGetSearchPodcasts} from '../hooks/useGetSearchPodcasts';

const SKELETON_COUNT = 5;
const SEARCH_DEBOUNCE_MS = 350;

export default function PodcastSearch({navigation}: PodcastSearchProp) {
  const [query, setQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const {isConnected} = useSelector((state: any) => state.network);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchData, setSearchData] = useState<PodcastData[]>([]);
  const theme = useTheme();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useFocusEffect(
    useCallback(() => {
      // Reset local search state when entering the screen to avoid stale queries.
      setQuery('');
      setDebouncedQuery('');
      setPage(1);
      setTotalPages(0);
      setSearchData([]);
      return () => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
      };
    }, []),
  );

  // Debounce query changes and reset pagination so a new search always starts at page 1.
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
      setTotalPages(0);
      setSearchData([]);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query]);

  const {mutate: updateViewCount} = useUpdatePodcastViewcount();

  const {data: searchPodcasts, isLoading} = useGetSearchPodcasts(
    isConnected,
    page,
    debouncedQuery,
  );

  useEffect(() => {
    if (Number(page) === 1) {
      if (searchPodcasts && searchPodcasts.totalPages) {
        setTotalPages(searchPodcasts.totalPages);
      }
      if (searchPodcasts && searchPodcasts.matchPodcasts) {
        setSearchData(searchPodcasts.matchPodcasts);
      }
    } else {
      if (searchPodcasts && searchPodcasts.matchPodcasts) {
        setSearchData(prev => [...prev, ...searchPodcasts.matchPodcasts]);
      }
    }
  }, [page, searchPodcasts]);

  useEffect(() => {
    if (isLoading && debouncedQuery !== '') {
      AccessibilityInfo.announceForAccessibility('Loading podcast results');
    }
  }, [isLoading, debouncedQuery]);

  const renderItem = ({item}: {item: PodcastData}) => (
    <Pressable
      style={{padding: 10}}
      onPress={() => {
        if (item) {
          updateViewCount(item._id, {
            onSuccess: (data: PodcastData) => {
              navigation.navigate('PodcastDetail', {
                trackId: data._id,
                audioUrl: data.audio_url,
              });
            },
            onError: (err: AxiosError) => {
              console.log('Update view count err', err);
              Snackbar.show({
                text: 'Something went wrong!',
                duration: Snackbar.LENGTH_SHORT,
              });
            },
          });
        }
      }}>
      <PodcastCard
        id={item._id}
        title={item.title}
        audioUrl={item.audio_url}
        host={item.user_id.user_name}
        views={item.viewUsers.length}
        imageUri={item.cover_image}
        duration={`${msToTime(item.duration)}`}
        tags={item.tags}
        display={false}
        downloaded={false}
        downLoadAudio={() => {}}
        handleClick={() => {
          updateViewCount(item._id, {
            onSuccess: (data: PodcastData) => {
              navigation.navigate('PodcastDetail', {
                trackId: data._id,
                audioUrl: data.audio_url,
              });
            },
            onError: (err: AxiosError) => {
              console.log('Update view count err', err);
              Snackbar.show({
                text: 'Something went wrong!',
                duration: Snackbar.LENGTH_SHORT,
              });
            },
          });
        }}
        handleReport={() => {}}
        playlistAct={() => {}}
      />
    </Pressable>
  );

  const listContentStyle = {paddingTop: 12, paddingBottom: 20};

  return (
    <YStack
      flex={1}
      height={'100%'}
      backgroundColor={theme.background.val}
      paddingTop="$2"
      justifyContent="flex-start">

      {/* Header */}
      <YStack
        paddingHorizontal="$4"
        paddingTop="$7"
        paddingBottom="$3"
        backgroundColor={theme.backgroundStrong?.val}>
        <YStack marginBottom="$3">
          <XStack alignItems="center" gap="$3">
            <Feather name="mic" size={24} color={PRIMARY_COLOR} />
            <YStack>
              <Text style={{fontSize: 24, fontWeight: '800', color: theme.color.val}}>
                Discover Podcasts
              </Text>
              <Text style={{fontSize: 13, color: theme.colorMuted?.val, marginTop: 2}}>
                {searchData.length > 0
                  ? `${searchData.length} results found`
                  : 'Search for your favorite content'}
              </Text>
            </YStack>
          </XStack>
        </YStack>

        {/* Search Bar */}
        <XStack
          alignItems="center"
          backgroundColor={theme.backgroundHover?.val}
          borderRadius={12}
          paddingHorizontal="$3"
          paddingVertical="$2"
          borderWidth={1.5}
          borderColor={query ? PRIMARY_COLOR : theme.borderColor.val}
          gap="$3"
          shadowColor="#000"
          shadowOffset={{width: 0, height: 2}}
          shadowOpacity={query ? 0.1 : 0.05}
          shadowRadius={4}
          elevation={query ? 3 : 1}>
          <Feather
            name="search"
            size={20}
            color={query ? PRIMARY_COLOR : (theme.colorMuted?.val as string)}
          />
          <Input
            flex={1}
            size="$5"
            placeholder="Search podcasts, topics, or hosts..."
            placeholderTextColor={theme.colorMuted?.val as string}
            borderWidth={0}
            backgroundColor="transparent"
            onChangeText={setQuery}
            value={query}
            color={theme.color.val}
            fontSize={14}
            fontWeight="500"
            focusStyle={{
              outlineWidth: 0,
              borderColor: 'transparent',
              boxShadow: 'none',
            }}
          />
          {query ? (
            <Pressable
              onPress={() => {
                setQuery('');
                setDebouncedQuery('');
                setPage(1);
                setTotalPages(0);
                setSearchData([]);
              }}>
              <Feather name="x-circle" size={18} color={theme.colorMuted?.val as string} />
            </Pressable>
          ) : null}
        </XStack>
      </YStack>

      <Separator borderColor={theme.borderColor.val} />

      {/* Results / Skeleton Section */}
      <YStack paddingHorizontal="$3" flex={1}>
        {isLoading && debouncedQuery !== '' ? (
          <FlatList
            data={Array.from({length: SKELETON_COUNT}, (_, i) => i)}
            keyExtractor={(_, index) => `skeleton-${index}`}
            renderItem={() => <PodcastSkeletonCard />}
            scrollEnabled={false}
            contentContainerStyle={listContentStyle}
          />
        ) : (
          <FlatList
            data={debouncedQuery !== '' ? searchData : []}
            keyExtractor={item => item._id.toString()}
            renderItem={renderItem}
            ListHeaderComponent={
              debouncedQuery !== '' && searchData.length > 0 ? (
                <YStack paddingVertical="$3" paddingHorizontal="$2">
                  <Text
                    fontSize={13}
                    fontWeight="700"
                    color={theme.colorMuted?.val}
                    letterSpacing={1}>
                    SEARCH RESULTS
                  </Text>
                </YStack>
              ) : null
            }
            ListEmptyComponent={
              debouncedQuery === '' ? (
                <YStack
                  alignItems="center"
                  justifyContent="center"
                  paddingVertical="$10"
                  gap="$3">
                  <Feather name="headphones" size={64} color={theme.colorMuted?.val as string} />
                  <Text fontSize={18} fontWeight="700" color={theme.colorMuted?.val}>
                    Start Your Search
                  </Text>
                  <Text
                    fontSize={14}
                    color={theme.colorMuted?.val}
                    textAlign="center"
                    paddingHorizontal="$6">
                    Type in the search bar to discover amazing podcasts
                  </Text>
                </YStack>
              ) : (
                <YStack
                  alignItems="center"
                  justifyContent="center"
                  paddingVertical="$8">
                  <NoResults />
                </YStack>
              )
            }
            onEndReached={() => {
              if (page < totalPages) setPage(prev => prev + 1);
            }}
            onEndReachedThreshold={0.5}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={listContentStyle}
          />
        )}
      </YStack>
    </YStack>
  );
}