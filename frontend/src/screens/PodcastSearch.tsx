import React, {useState} from 'react';
import {Pressable, FlatList, ActivityIndicator} from 'react-native';
import {PodcastData, PodcastSearchProp} from '../type';
import {useMutation, useQuery} from '@tanstack/react-query';
import axios from 'axios';
import {SEARCH_PODCAST, UPDATE_PODCAST_VIEW_COUNT} from '../helper/APIUtils';
import {useSelector} from 'react-redux';
import PodcastCard from '../components/PodcastCard';
import {msToTime} from '../helper/Utils';
import Snackbar from 'react-native-snackbar';
import NoResults from '../components/NoResult';
import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../helper/Theme';
import {XStack, YStack, Input, Separator} from 'tamagui';
import {Feather} from '@expo/vector-icons';

export default function PodcastSearch({navigation}: PodcastSearchProp) {
  const [query, setQuery] = useState<string>('');
  const {user_token} = useSelector((state: any) => state.user);
  const {isConnected} = useSelector((state: any) => state.network);
  // const [results, setResults] = useState<PodcastData>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchData, setSearchData] = useState<PodcastData[]>([]);

  const {isLoading, refetch} = useQuery({
    queryKey: ['serach-podcasts', page],
    queryFn: async () => {
      const res = await axios.get(`${SEARCH_PODCAST}?q=${query}&page=${page}`, {
        headers: {
          Authorization: `Bearer ${user_token}`,
        },
      });

      if (Number(page) === 1) {
        if (res.data.totalPages) {
          const pages = res.data.totalPages;
          setTotalPages(pages);
        }

        if (res.data.matchPodcasts) {
          setSearchData(res.data.matchPodcasts);
        }
      } else {
        if (res.data.matchPodcasts) {
          const oldPodcasts = searchData;
          const newPodcasts = res.data.matchPodcasts;

          setSearchData([...oldPodcasts, ...newPodcasts]);
        }
      }

      return res.data.matchPodcasts as PodcastData[];
    },
    enabled: isConnected && !!query && !!user_token,
  });

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
        audioUrl: data.audio_url
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
      style={{padding: 10}}
      onPress={() => {
        //playPodcast(item);
        updateViewCountMutation.mutate(item._id);
      }}>
      <PodcastCard
        id={item._id}
        title={item.title}
        audioUrl={item.audio_url}
        host={item.user_id.user_name}
        views={item.viewUsers.length}
        duration={`${msToTime(item.duration)}`}
        tags={item.tags}
        display={false}
        downloaded={false}
        downLoadAudio={() => {}}
        handleClick={() => {
          updateViewCountMutation.mutate(item._id);
        }}
        imageUri={item.cover_image}
        handleReport={() => {}}
        playlistAct={() => {}}
        //onSelect={()=>{}}
        //onClear={()=>{}}
      />
    </Pressable>
  );

  return (
    <YStack
      flex={1}
      height={'100%'}
      backgroundColor="#F9FAFB"
      paddingTop="$2"
      justifyContent="flex-start">

      {/* Header Section */}
      <YStack paddingHorizontal="$4" paddingTop="$4" paddingBottom="$3" backgroundColor="#FFFFFF">
        <YStack marginBottom="$3">
          <XStack alignItems="center" justifyContent="space-between" marginBottom="$2">
            <YStack>
              <XStack alignItems="center" gap="$2">
                <Feather name="mic" size={24} color={PRIMARY_COLOR} />
                <YStack>
                  <XStack>
                    <YStack fontSize={26} fontWeight="800" color="#1F2937">
                      Discover Podcasts
                    </YStack>
                  </XStack>
                  <YStack fontSize={14} color="#6B7280" marginTop="$1">
                    {searchData.length > 0 ? `${searchData.length} results found` : 'Search for your favorite content'}
                  </YStack>
                </YStack>
              </XStack>
            </YStack>
          </XStack>
        </YStack>

        {/* Enhanced Search Bar */}
        <XStack
          alignItems="center"
          backgroundColor="#F3F4F6"
          borderRadius={12}
          paddingHorizontal="$3"
          paddingVertical="$2"
          borderWidth={2}
          borderColor={query ? PRIMARY_COLOR : '#E5E7EB'}
          gap="$3"
          shadowColor="#000"
          shadowOffset={{width: 0, height: 2}}
          shadowOpacity={query ? 0.1 : 0.05}
          shadowRadius={4}
          elevation={query ? 3 : 1}>
          <Feather name="search" size={22} color={query ? PRIMARY_COLOR : '#9CA3AF'} />
          <Input
            flex={1}
            size="$4"
            placeholder="Search podcasts, topics, or hosts..."
            placeholderTextColor={'#9CA3AF'}
            borderWidth={0}
            backgroundColor="transparent"
            onChangeText={setQuery}
            value={query}
            color={'#1F2937'}
            fontSize={15}
            fontWeight="500"
            focusStyle={{
              outlineWidth: 0,
              borderColor: 'transparent',
              boxShadow: 'none',
            }}
          />

          {query && (
            <Pressable
              onPress={() => {
                setQuery('');
                setSearchData([]);
              }}>
              <Feather name="x-circle" size={20} color="#6B7280" />
            </Pressable>
          )}
        </XStack>
      </YStack>

      <Separator borderColor="#E5E7EB" />

      {/* Results Section */}
      {isLoading && query !== '' ? (
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$3">
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          <YStack fontSize={15} color="#6B7280" fontWeight="600">
            Searching podcasts...
          </YStack>
        </YStack>
      ) : (
        <YStack paddingHorizontal="$3" marginBottom="$8" flex={1}>
          <FlatList
            data={query !== '' ? searchData : []}
            keyExtractor={item => item._id.toString()}
            renderItem={renderItem}
            ListHeaderComponent={
              query !== '' && searchData.length > 0 ? (
                <YStack paddingVertical="$3" paddingHorizontal="$2">
                  <XStack fontSize={13} fontWeight="700" color="#6B7280" letterSpacing={1}>
                    SEARCH RESULTS
                  </XStack>
                </YStack>
              ) : null
            }
            ListEmptyComponent={
              query === '' ? (
                <YStack
                  alignItems="center"
                  justifyContent="center"
                  paddingVertical="$10"
                  gap="$3">
                  <Feather name="headphones" size={64} color="#D1D5DB" />
                  <YStack fontSize={18} fontWeight="700" color="#6B7280">
                    Start Your Search
                  </YStack>
                  <YStack fontSize={14} color="#9CA3AF" textAlign="center" paddingHorizontal="$6">
                    Type in the search bar to discover amazing podcasts
                  </YStack>
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
            contentContainerStyle={{paddingBottom: 20}}
          />
        </YStack>
      )}
    </YStack>
  );
}
