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
      backgroundColor={ON_PRIMARY_COLOR}
      paddingTop="$4"
      justifyContent="flex-start">
      {/* Search Bar */}
      <XStack
        alignItems="center"
        justifyContent="space-between"
        marginTop="$5"
        padding="$2"
        borderRadius="$4"
        shadowOffset={{width: 0, height: 1}}
        shadowOpacity={0.1}
        shadowRadius={3}>
        <XStack
          alignItems="center"
          width="100%"
          flex={1}
          backgroundColor="#FFFFFF"
          borderRadius="$2"
          paddingHorizontal="$3"
          borderWidth={0.5}
          borderColor={'$gray10'}
          paddingVertical="$1"
          background="transparent"
          gap="$3">
          <Feather name="search" size={25} color={'#808080'} />
          <Input
            flex={1}
            size="$2"
            minHeight={'$5'}
            padding="$3"
            paddingVertical="$2"
            placeholder="Search..."
            placeholderTextColor={'#c1c1c1'}
            borderWidth={0}
            background="transparent"
            onChangeText={setQuery}
            value={query}
            color={'black'}
            focusStyle={{
              outlineWidth: 0,
              borderColor: 'transparent',
              boxShadow: 'none',
            }}
          />

          <Pressable
            onPress={() => {
              setQuery('');
            }}>
            <Feather name="clock" size={25} color={'#808080'} />
          </Pressable>
        </XStack>
      </XStack>

      <Separator marginVertical="$2" opacity={0} />

      {isLoading && query !== '' ? (
        <YStack flex={1} alignItems="center" justifyContent="center">
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        </YStack>
      ) : (
        <YStack paddingHorizontal="$2" marginBottom="$8">
          <FlatList
            data={query !== '' ? searchData : []}
            keyExtractor={item => item._id.toString()}
            renderItem={renderItem}
            ListEmptyComponent={
              <YStack
                alignItems="center"
                justifyContent="center"
                paddingVertical="$8">
                <NoResults />
              </YStack>
            }
            onEndReached={() => {
              if (page < totalPages) setPage(prev => prev + 1);
            }}
            onEndReachedThreshold={0.5}
            showsVerticalScrollIndicator={false}
          />
        </YStack>
      )}
    </YStack>
  );
}
