import {FlatList, Pressable, View, StyleSheet} from 'react-native';
import {OfflinePodcastListProp, PodcastData} from '../type';
import {deleteFromDownloads, msToTime, retrieveItem} from '../helper/Utils';
import {useEffect, useState} from 'react';
import PodcastCard from '../components/PodcastCard';
import PodcastEmptyComponent from '../components/PodcastEmptyComponent';
import { hp } from '../helper/Metric';
import { ON_PRIMARY_COLOR } from '../helper/Theme';
import Snackbar from 'react-native-snackbar';
import { useMutation } from '@tanstack/react-query';

export default function OfflinePodcastList({
  navigation,
}: OfflinePodcastListProp) {
  const [podcasts, setPodcasts] = useState<any[]>([]);

  useEffect(() => {
    loadPodcasts();
    return ()=>{
      
    }
  }, []);

  const loadPodcasts = async () => {
    try {
      const podCastStr = await retrieveItem('DOWNLOAD_PODCAST_DATA');
      if (!podCastStr) return;
      const data = JSON.parse(podCastStr);

      if (!Array.isArray(data)) {
        return;
      }
      setPodcasts(data);
    } catch (err) {}
  };

  const navigateToDetail = (podcast: PodcastData)=>{
    navigation.navigate('OfflinePodcastDetail', {
        podcast: podcast
    });
  }

  /*
  const reportPodcastMutation = useMutation({
    mutationKey:['report-podcast'],
    mutationFn: async (podcast_id: string)=>{

    },
    onSuccess: async (data)=>{

    },

    onError: async (err)=>{

    }
  })
    */

  const renderItem = ({item}: {item: any}) => (
    <Pressable
      onPress={() => {
        //playPodcast(item);
        navigateToDetail(item);
      }}>
      <PodcastCard
       id= {item._id}
        title={item.title}
        host={item.user_id.user_name}
        views={item.viewUsers.length}
        duration={`${msToTime(item.duration)}`}
        tags ={item.tags}
        downloaded={true}
        display={true}
        downLoadAudio={async ()=>{
          // delete from downloads
          const res = await deleteFromDownloads(item);

          if(res){
            Snackbar.show({
              text:"Podcast has been removed from offline",
              duration: Snackbar.LENGTH_SHORT
            });
          }else{
             Snackbar.show({
              text:"Failed to removed podcast from offline",
              duration: Snackbar.LENGTH_SHORT
            });
          }
        }}
        handleClick={() => {
        navigateToDetail(item);
        }}
        imageUri={''}
      />
    </Pressable>
  );
  return (
    <View style={styles.container}>
      <FlatList
        data={podcasts}
        keyExtractor={item => item._id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<PodcastEmptyComponent />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: hp(10),
    paddingHorizontal: 16,
    backgroundColor: ON_PRIMARY_COLOR,
   // backgroundColor:'#ffffff'
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