import {useQuery} from '@tanstack/react-query';
import axios from 'axios';
import {useCallback, useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  FlatList,
  Image,
} from 'react-native';
import {DISCARDED_PODCASTS, PENDING_PODCASTS, USER_PUBLISHED_PODCASTS} from '../../helper/APIUtils';
import {PodcastData} from '../../type';
import {useSelector} from 'react-redux';
import {msToTime} from '../../helper/Utils';
import PodcastCard from '../../components/PodcastCard';
import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../../helper/Theme';
import {hp} from '../../helper/Metric';
import Loader from '../../components/Loader';

export default function PodcastWorkSpace({
  handleClickAction,
}: {
  handleClickAction: (item: PodcastData) => void;
}) {
  const {user_token, user_handle} = useSelector((state: any) => state.user);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const {
    data: publishedPodcasts,
    isLoading: publishedPodcastsLoading,
    refetch: publishedPodcastsRefetch,
  } = useQuery({
    queryKey: ['get-published-podcasts-for-user'],
    queryFn: async () => {
      try {
        const response = await axios.get(`${USER_PUBLISHED_PODCASTS}`, {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        });

        //console.log('Article Response', response);
        //let d = response.data as ArticleData[];
        //updateArticles(d);
        return response.data as PodcastData[];
      } catch (err) {
        console.error('Error fetching podcasts:', err);
      }
    },
  });

   const {
    data: pendingPodcasts,
    isLoading: pendingPodcastsLoading,
    refetch: pendingPodcastsRefetch,
  } = useQuery({
    queryKey: ['get-pending-podcasts-for-user'],
    queryFn: async () => {
      try {
        const response = await axios.get(`${PENDING_PODCASTS}`, {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        });

        //console.log('Article Response', response);
        //let d = response.data as ArticleData[];
        //updateArticles(d);
        return response.data as PodcastData[];
      } catch (err) {
        console.error('Error fetching podcasts:', err);
      }
    },
  });

   const {
    data: discardedPodcasts,
    isLoading: discardedPodcastsLoading,
    refetch: discardedPodcastsRefetch,
  } = useQuery({
    queryKey: ['get-discarded-podcasts-for-user'],
    queryFn: async () => {
      try {
        const response = await axios.get(`${DISCARDED_PODCASTS}`, {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        });

       // console.log('Podcast Response', response.data);
        //let d = response.data as ArticleData[];
        //updateArticles(d);
        return response.data as PodcastData[];
      } catch (err) {
        console.error('Error fetching podcasts:', err);
      }
    },
  });

  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const pendingLabel = `Progress (${pendingPodcasts
    ? pendingPodcasts.length
      : 0
  })`;
  const publishedLabel = `Published (${
    publishedPodcasts
      ? publishedPodcasts.length
      : 0
  })`;

  const discardLabel = `Discarded (${
    discardedPodcasts
      ? discardedPodcasts.length
      : 0
  })`;

  const categories = [publishedLabel, pendingLabel, discardLabel];
  const [selectedCategory, setSelectedCategory] =
    useState<string>(publishedLabel);

  const onRefresh = () => {
    setRefreshing(true);
    
    if(selectedCategory === pendingLabel){
        pendingPodcastsRefetch();
    }
    else if(selectedCategory === publishedLabel){
        publishedPodcastsRefetch();
    }else if(selectedCategory === discardLabel){
        discardedPodcastsRefetch();
    }
    setRefreshing(false);
  };

  const renderItem = useCallback(
    ({item}: {item: PodcastData}) => {
      return (
        <PodcastCard
          id={item._id}
          title={item.title}
          host={user_handle}
          imageUri={item.cover_image}
          views={item.viewUsers.length}
          duration={msToTime(item.duration)}
          tags={item.tags}
          handleClick={()=>{
            handleClickAction(item);
          }}
          downLoadAudio={()=>{

          }}
          handleReport={() => {
            // Handle report action
          }}
          downloaded={false}
          display={false}
          playlistAct={()=>{

          }}
        />
      );
    },
    [handleClickAction, user_handle],
  );

  if (publishedPodcastsLoading || pendingPodcastsLoading || discardedPodcastsLoading) {
    return <Loader />;
  }

  return (
    <View style={{flex: 1, backgroundColor: ON_PRIMARY_COLOR}}>
      <View style={styles.container}>
        <View style={styles.buttonContainer}>
          {categories.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={{
                ...styles.button,
                backgroundColor:
                  selectedCategory !== item ? 'white' : PRIMARY_COLOR,
                borderColor:
                  selectedCategory !== item ? PRIMARY_COLOR : 'white',
              }}
              onPress={() => {
                setSelectedCategory(item);
              }}>
              <Text
                style={{
                  ...styles.labelStyle,
                  color: selectedCategory !== item ? 'black' : 'white',
                }}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.articleContainer}>
          <FlatList
            data={
              selectedCategory === publishedLabel
                ? publishedPodcasts ?? []
                : selectedCategory === pendingLabel
                ? pendingPodcasts ?? []
                : discardedPodcasts ?? []
            }
            renderItem={renderItem}
            keyExtractor={item => item._id.toString()}
            contentContainerStyle={styles.flatListContentContainer}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Image
                  source={require('../../assets/article_default.jpg')}
                  style={styles.image}
                />
                <Text style={styles.message}>No podcasts Found</Text>
              </View>
            }
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: hp(10),
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 6,
  },
  button: {
    flex: 1,
    borderRadius: 10,
    marginHorizontal:2,
    marginVertical: 4,
    padding: hp(1.5),
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelStyle: {
    fontWeight: 'bold',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  articleContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 0,
    //zIndex: -2,
  },
  flatListContentContainer: {
    // marginTop: hp(20),
    paddingHorizontal: 16,
    backgroundColor: ON_PRIMARY_COLOR,
  },

  image: {
    height: 160,
    width: 160,
    borderRadius: 80,
    resizeMode: 'cover',
    marginBottom: hp(4),
  },

  message: {
    fontSize: 17,
    color: '#555',
    fontWeight: '500',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginTop: hp(15),
    alignSelf: 'center',
  },
});
