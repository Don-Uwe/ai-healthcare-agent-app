import React from 'react';
import {FlatList, Pressable, View, StyleSheet} from 'react-native';
import {OfflinePodcastListProp, PodcastData} from '../type';
import {deleteFromDownloads, msToTime, retrieveItem} from '../helper/Utils';
import {useEffect, useState} from 'react';
import PodcastCard from '../components/PodcastCard';
import PodcastEmptyComponent from '../components/PodcastEmptyComponent';
import {hp} from '../helper/Metric';
import {ON_PRIMARY_COLOR} from '../helper/Theme';
import Snackbar from 'react-native-snackbar';
import {useSelector} from 'react-redux';
import CreatePlaylist from '../components/CreatePlaylist';

export default function OfflinePodcastList({
  navigation,
}: OfflinePodcastListProp) {
  const [podcasts, setPodcasts] = useState<PodcastData[]>([]);
  const {user_id} = useSelector((state: any) => state.user);
  const [playlistModalOpen, setPlaylistModalOpen] = useState<boolean>(false);
  const [playlistIds, setPlaylistIds] = useState<string[]>([]);

  const openPlaylist = () => {
    setPlaylistModalOpen(true);
  };
  const closePlaylist = () => {
    setPlaylistModalOpen(false);
  };

  useEffect(() => {
    loadPodcasts();
    return () => {};
  }, []);

  const loadPodcasts = async () => {
    try {
      const podCastStr = await retrieveItem('DOWNLOAD_PODCAST_DATA');
      if (!podCastStr) {
        return;
      }
      const data = JSON.parse(podCastStr);

      if (!Array.isArray(data)) {
        return;
      }
      setPodcasts(data);
    } catch (err) {}
  };

  const navigateToDetail = (podcast: PodcastData) => {
    navigation.navigate('OfflinePodcastDetail', {
      podcast: podcast,
    });
  };

  const navigateToReport = podcastId => {
    navigation.navigate('ReportScreen', {
      articleId: '',
      authorId: user_id,
      commentId: null,
      podcastId: podcastId,
    });
  };

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
        id={item._id}
        title={item.title}
        host={item.user_id.user_name}
        views={item.viewUsers.length}
        duration={`${msToTime(item.duration)}`}
        tags={item.tags}
        downloaded={true}
        display={true}
        downLoadAudio={async () => {
          // delete from downloads
          const res = await deleteFromDownloads(item);

          if (res) {
            Snackbar.show({
              text: 'Podcast has been removed from offline',
              duration: Snackbar.LENGTH_SHORT,
            });
          } else {
            Snackbar.show({
              text: 'Failed to removed podcast from offline',
              duration: Snackbar.LENGTH_SHORT,
            });
          }
        }}
        handleClick={() => {
          navigateToDetail(item);
        }}
        imageUri={''}
        handleReport={() => {
          navigateToReport(item._id);
        }}
        plalylistAct={openPlaylist}
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
      <CreatePlaylist
       visible={playlistModalOpen}
       dismiss={closePlaylist}
       podcast_ids={playlistIds}
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
