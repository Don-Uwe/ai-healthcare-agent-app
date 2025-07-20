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

  const {
    data: results,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['serach-podcasts'],
    queryFn: async () => {
      const res = await axios.get(`${SEARCH_PODCAST}?q=${query}`, {
        headers: {
          Authorization: `Bearer ${user_token}`,
        },
      });

      return res.data as PodcastData[];
    },
    enabled: !!query,
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
        onSelect={()=>{}}
        onClear={()=>{}}
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
          data={results && query !== '' ? results : []}
          keyExtractor={item => item._id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={<NoResults />}
          //refreshing={refreshing}
          // onRefresh={onRefresh}
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
