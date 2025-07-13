import { useState } from 'react';
import { Pressable, View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { PodcastData, PodcastSearchProp } from '../type';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { SEARCH_PODCAST, UPDATE_PODCAST_VIEW_COUNT } from '../helper/APIUtils';
import { useSelector } from 'react-redux';
import PodcastCard from '../components/PodcastCard';
import { msToTime } from '../helper/Utils';
import Snackbar from 'react-native-snackbar';
import NoResults from '../components/NoResult';

export default function PodcastSearch({navigation}:PodcastSearchProp){

     const [query, setQuery] = useState<string>('');
     const {user_token} = useSelector((state: any) => state.user);
    // const [results, setResults] = useState<PodcastData>([]);

     const {
        data: results,
        isLoading,
        refetch,
     } = useQuery({
        queryKey:['serach-podcasts'],
        queryFn: async ()=>{

            const res = await axios.get(`${SEARCH_PODCAST}?q=${query}`, {
                headers:{
                  Authorization: `Bearer ${user_token}`,
                },
            });

            return res.data as PodcastData[];
        },
        enabled: !!query,
     });

  const updateViewCountMutation = useMutation({
    mutationKey:['update-podcast-view-count'],
    mutationFn: async (podcastId: string)=>{

      const res = await axios.post(`${UPDATE_PODCAST_VIEW_COUNT}`, {
        podcast_id: podcastId,
      },{
        headers:{
          Authorization: `Bearer ${user_token}`,
        },
      });
      return res.data.data as PodcastData;

    },
    onSuccess: (data)=>{
      navigation.navigate('PodcastDetail',{
        trackId: data._id,
      });
    },
    onError: (err)=>{

       console.log('Update view count err', err);
       Snackbar.show({
         text:"Something went wrong!",
         duration: Snackbar.LENGTH_SHORT,
       });
    },
  });

const renderItem = ({item}: {item: PodcastData}) => (
    <Pressable
      onPress={() => {
        //playPodcast(item);
        updateViewCountMutation.mutate(item._id)
      }}>
      <PodcastCard
        title={item.title}
        host={item.user_id.user_name}
        views={item.viewUsers.length}
        duration={`${msToTime(item.duration)}`}
        tags={item.tags}
        handleClick={() => {
            updateViewCountMutation.mutate(item._id)
        }}
        imageUri={item.cover_image}
      />
    </Pressable>
  );

    return (
          <View style={styles.container}>
              {isLoading ? (
                <ActivityIndicator size="large" />
              ) : (
                <FlatList
                  data={results ? results : []}
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
    paddingTop: hp(10),
    paddingHorizontal: 16,
    //backgroundColor: ON_PRIMARY_COLOR,
    backgroundColor:'#ffffff'
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
});