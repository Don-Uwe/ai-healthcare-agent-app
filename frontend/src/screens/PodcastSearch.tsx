import React, {useEffect, useState} from 'react';
import {Pressable, FlatList, ActivityIndicator} from 'react-native';
import {PodcastData, PodcastSearchProp} from '../type';
import {AxiosError} from 'axios';
import {useSelector} from 'react-redux';
import PodcastCard from '../components/PodcastCard';
import {msToTime} from '../helper/Utils';
import Snackbar from 'react-native-snackbar';
import NoResults from '../components/NoResult';
import {PRIMARY_COLOR} from '../helper/Theme';
import {XStack, YStack, Input, Separator, Text} from 'tamagui';
import {Feather} from '@expo/vector-icons';
import {useUpdatePodcastViewcount} from '../hooks/useUpdatePodcastViewcount';
import {useGetSearchPodcasts} from '../hooks/useGetSearchPodcasts';

export default function PodcastSearch({navigation}: PodcastSearchProp) {
  const [query, setQuery] = useState<string>('');
  //const {user_token} = useSelector((state: any) => state.user);
  const {isConnected} = useSelector((state: any) => state.network);
  // const [results, setResults] = useState<PodcastData>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchData, setSearchData] = useState<PodcastData[]>([]);

  const {mutate: updateViewCount} = useUpdatePodcastViewcount();

  const {data: searchPodcasts, isLoading} = useGetSearchPodcasts(
    isConnected,
    page,
    query,
  );

  useEffect(() => {
    if (Number(page) === 1) {
      if (searchPodcasts && searchPodcasts.totalPages) {
        const pages = searchPodcasts.totalPages;
        setTotalPages(pages);
      }

      if (searchPodcasts && searchPodcasts.matchPodcasts) {
        setSearchData(searchPodcasts.matchPodcasts);
      }
    } else {
      if (searchPodcasts && searchPodcasts.matchPodcasts) {
        const oldPodcasts = searchData;
        const newPodcasts = searchPodcasts.matchPodcasts;

        setSearchData([...oldPodcasts, ...newPodcasts]);
      }
    }
  }, [page, searchPodcasts]);


  const renderItem = ({item}: {item: PodcastData}) => (
    <Pressable
      style={{padding: 10}}
      onPress={() => {
        //playPodcast(item);
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
      <YStack
        paddingHorizontal="$4"
        paddingTop="$7"
        paddingBottom="$3"
        backgroundColor="#FFFFFF">
        {/* Header */}
        <YStack marginBottom="$3">
          <XStack alignItems="center" gap="$3">
            <Feather name="mic" size={24} color={PRIMARY_COLOR} />

            <YStack>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: '800',
                  color: '#1F2937',
                }}>
                Discover Podcasts
              </Text>

              <Text
                style={{
                  fontSize: 13,
                  color: '#6B7280',
                  marginTop: 2,
                }}>
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
          backgroundColor="#F3F4F6"
          borderRadius={12}
          paddingHorizontal="$3"
          paddingVertical="$2"
          borderWidth={1.5}
          borderColor={query ? PRIMARY_COLOR : '#E5E7EB'}
          gap="$3"
          shadowColor="#000"
          shadowOffset={{width: 0, height: 2}}
          shadowOpacity={query ? 0.1 : 0.05}
          shadowRadius={4}
          elevation={query ? 3 : 1}>
          <Feather
            name="search"
            size={20}
            color={query ? PRIMARY_COLOR : '#9CA3AF'}
          />

          <Input
            flex={1}
            size="$5"
            placeholder="Search podcasts, topics, or hosts..."
            placeholderTextColor="#9CA3AF"
            borderWidth={0}
            backgroundColor="transparent"
            onChangeText={setQuery}
            value={query}
            color="#1F2937"
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
                setSearchData([]);
              }}>
              <Feather name="x-circle" size={18} color="#6B7280" />
            </Pressable>
          ) : null}
        </XStack>
      </YStack>

      <Separator borderColor="#E5E7EB" />

      {/* Results Section */}
      {isLoading && query !== '' ? (
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$3">
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          <Text fontSize={15} color="#6B7280" fontWeight="600">
            Searching podcasts...
          </Text>
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
                  <Text
                    fontSize={13}
                    fontWeight="700"
                    color="#6B7280"
                    letterSpacing={1}>
                    SEARCH RESULTS
                  </Text>
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
                  <Text fontSize={18} fontWeight="700" color="#6B7280">
                    Start Your Search
                  </Text>
                  <Text
                    fontSize={14}
                    color="#9CA3AF"
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
            contentContainerStyle={{paddingBottom: 20}}
          />
        </YStack>
      )}
    </YStack>
  );
}
