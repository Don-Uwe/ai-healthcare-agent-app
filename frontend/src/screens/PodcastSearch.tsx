import React, {useState} from 'react';
import {
  Pressable,
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
  Text,
  TouchableOpacity,
} from 'react-native';
import {PodcastData, PodcastSearchProp} from '../type';
import {useMutation, useQuery} from '@tanstack/react-query';
import axios from 'axios';
import {SEARCH_PODCAST, UPDATE_PODCAST_VIEW_COUNT} from '../helper/APIUtils';
import {useSelector} from 'react-redux';
import PodcastCard from '../components/PodcastCard';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {msToTime} from '../helper/Utils';
import Snackbar from 'react-native-snackbar';
import NoResults from '../components/NoResult';
import {hp} from '../helper/Metric';
import {PRIMARY_COLOR} from '../helper/Theme';

export default function PodcastSearch({navigation}: PodcastSearchProp) {
  const [query, setQuery] = useState<string>('');
  const {user_token} = useSelector((state: any) => state.user);
  // const [results, setResults] = useState<PodcastData>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchData, setSearchData] = useState<PodcastData[]>([]);

  const {
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['serach-podcasts', page],
    queryFn: async () => {
      const res = await axios.get(`${SEARCH_PODCAST}?q=${query}&page=${page}`, {
        headers: {
          Authorization: `Bearer ${user_token}`,
        },
      });

      if(Number(page) === 1){
        if(res.data.totalPages){
          const pages = res.data.totalPages;
          setTotalPages(pages);
        }

        if(res.data.matchPodcasts){
          setSearchData(res.data.matchPodcasts);
        }
      }else{

        if(res.data.matchPodcasts){
           const oldPodcasts = searchData;
        const newPodcasts = res.data.matchPodcasts;

        setSearchData([...oldPodcasts, ...newPodcasts]);
        }
      }

      return res.data.matchPodcasts as PodcastData[];
    },
    enabled: !!query && !!user_token  ,
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
        id= {item._id}
        title={item.title}
        host={item.user_id.user_name}
        views={item.viewUsers.length}
        duration={`${msToTime(item.duration)}`}
        tags={item.tags}
        display={false}
        downloaded={false}
        downLoadAudio={()=>{

        }}
        handleClick={() => {
          updateViewCountMutation.mutate(item._id);
        }}
        imageUri={item.cover_image}
        handleReport={()=>{

        }}
        playlistAct={()=>{

        }}
        //onSelect={()=>{}}
        //onClear={()=>{}}
      />
    </Pressable>
  );


  return (
    <View style={styles.container}>
      <View style={styles.searchWrapper}>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
          style={styles.backBtn}>
          <AntDesign name="arrowleft" size={27} color={PRIMARY_COLOR} />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <AntDesign
            name="search1"
            color={PRIMARY_COLOR}
            size={24}
            style={{marginStart: 8, marginTop: 2}}
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#999"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => {
              setPage(1);
              refetch();
            }} // If user presses enter on keyboard
            returnKeyType="search"
          />

          <TouchableOpacity
            style={styles.searchBtn}
            onPress={() => {
              refetch();
            }}>
            <Text style={styles.searchBtnText}>Go</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading && query !== '' ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={searchData && query !== '' ? searchData : []}
          keyExtractor={item => item._id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={<NoResults />}
          onEndReached={() => {
              if (page < totalPages) {
                setPage(prev => prev + 1);
              }
        }}
         onEndReachedThreshold={0.5}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: hp(1.5),
    paddingHorizontal: 16,
    //backgroundColor: ON_PRIMARY_COLOR,
    backgroundColor: '#ffffff',
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

  searchContainer: {
    flex: 1,
    height: hp(6),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: PRIMARY_COLOR,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 2,
  },

  searchInput: {
    flex: 1,
    marginStart: 8,
    fontSize: 16,
    color: '#000',
  },

  searchBtn: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginEnd: 6,
  },

  searchBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    //paddingHorizontal: 3,
    marginVertical: 10,
  },
  backBtn: {
    marginEnd: 4,
    padding: 2,
  },
});
