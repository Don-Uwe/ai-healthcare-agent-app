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
import {
  DISCARDED_PODCASTS,
  PENDING_PODCASTS,
  USER_PUBLISHED_PODCASTS,
} from '../../helper/APIUtils';
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
  const [publishedPage, setPublishedPage] = useState(1);
  const [totalPublishPages, setTotalPublishPages] = useState(0);
  const [publishedPodcasts, setPublishedPodcasts] = useState<PodcastData[]>([]);

  const [pendingPage, setPendingPage] = useState(1);
  const [totalPendingPages, setTotalPendingPages] = useState(0);
  const [pendingPodcasts, setPendingPodcasts] = useState<PodcastData[]>([]);
  const [selectedStatus, setSelectedStatus] = useState(1);

  const [discardedPage, setDiscardedPage] = useState(1);
  const [totalDiscardedPages, setTotalDiscardedPages] = useState(0);
  const [discardedPodcasts, setDiscardedPodcasts] = useState<PodcastData[]>([]);

  const {
    isLoading: publishedPodcastsLoading,
    refetch: publishedPodcastsRefetch,
  } = useQuery({
    queryKey: ['get-published-podcasts-for-user', publishedPage],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `${USER_PUBLISHED_PODCASTS}?page=${publishedPage}`,
          {
            headers: {
              Authorization: `Bearer ${user_token}`,
            },
          },
        );

        if (Number(publishedPage) === 1 && response.data.totalPages) {
          let totalPage = response.data.totalPages;
          setTotalPublishPages(totalPage);

          setPublishedPodcasts(response.data.publishedPodcasts);
        } else {
          if (response.data.publishedPodcasts) {
            let oldPodcasts =
              (publishedPodcasts as PodcastData[]) ?? ([] as PodcastData[]);
            let newPodcasts = response.data.publishedPodcasts as PodcastData[];
            setPublishedPodcasts([...oldPodcasts, ...newPodcasts]);
          }
        }

        //console.log('Article Response', response);
        //let d = response.data as ArticleData[];
        //updateArticles(d);
        return response.data.publishedPodcasts as PodcastData[];
      } catch (err) {
        console.error('Error fetching podcasts:', err);
      }
    },
    enabled: !!user_token && !!publishedPage,
  });

  const {isLoading: pendingPodcastsLoading, refetch: pendingPodcastsRefetch} =
    useQuery({
      queryKey: ['get-pending-podcasts-for-user', pendingPage],
      queryFn: async () => {
        try {
          const response = await axios.get(
            `${PENDING_PODCASTS}?page=${pendingPage}`,
            {
              headers: {
                Authorization: `Bearer ${user_token}`,
              },
            },
          );

          if (Number(pendingPage) === 1 && response.data.totalPages) {
            let totalPage = response.data.totalPages;
            setTotalPendingPages(totalPage);

            setPendingPodcasts(response.data.pendingPodcasts);
          } else {
            if (response.data.pendingPodcasts) {
              let oldPodcasts =
                (pendingPodcasts as PodcastData[]) ?? ([] as PodcastData[]);
              let newPodcasts = response.data.pendingPodcasts as PodcastData[];
              setPendingPodcasts([...oldPodcasts, ...newPodcasts]);
            }
          }

          return response.data.pendingPodcasts as PodcastData[];
        } catch (err) {
          console.error('Error fetching podcasts:', err);
        }
      },
    });

  const {
    isLoading: discardedPodcastsLoading,
    refetch: discardedPodcastsRefetch,
  } = useQuery({
    queryKey: ['get-discarded-podcasts-for-user', discardedPage],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `${DISCARDED_PODCASTS}?page=${discardedPage}`,
          {
            headers: {
              Authorization: `Bearer ${user_token}`,
            },
          },
        );

        if (Number(discardedPage) === 1 && response.data.totalPages) {
          let totalPage = response.data.totalPages;
          setTotalDiscardedPages(totalPage);

          setDiscardedPodcasts(response.data.discardedPodcasts);
        } else {
          if (response.data.discardedPodcasts) {
            let oldPodcasts =
              (discardedPodcasts as PodcastData[]) ?? ([] as PodcastData[]);
            let newPodcasts = response.data.discardedPodcasts as PodcastData[];
            setDiscardedPodcasts([...oldPodcasts, ...newPodcasts]);
          }
        }
        return response.data.discardedPodcasts as PodcastData[];
      } catch (err) {
        console.error('Error fetching podcasts:', err);
      }
    },
    enabled: !!user_token && !!discardedPage,
  });

  //const [selectedCardId, setSelectedCardId] = useState<string>('');

  const categories = [1, 2, 3];

  const onRefresh = () => {
    setRefreshing(true);

    if (selectedStatus === 2) {
      setPendingPage(1);
      pendingPodcastsRefetch();
    } else if (selectedStatus === 1) {
      setPublishedPage(1);
      publishedPodcastsRefetch();
    } else if (selectedStatus === 3) {
      setDiscardedPage(1);
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
          handleClick={() => {
            handleClickAction(item);
          }}
          downLoadAudio={() => {}}
          handleReport={() => {
            // Handle report action
          }}
          downloaded={false}
          display={false}
          playlistAct={() => {}}
        />
      );
    },
    [handleClickAction, user_handle],
  );

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
                  selectedStatus !== item ? 'white' : PRIMARY_COLOR,
                borderColor: selectedStatus !== item ? PRIMARY_COLOR : 'white',
              }}
              onPress={() => {
                setSelectedStatus(item);
                //setSelectedCategory(item);
              }}>
              <Text
                style={{
                  ...styles.labelStyle,
                  color: selectedStatus !== item ? 'black' : 'white',
                }}>
                {item === 1
                  ? `Published(${
                      publishedPodcasts ? publishedPodcasts.length : 0
                    })`
                  : item === 2
                  ? `Pending(${pendingPodcasts ? pendingPodcasts.length : 0})`
                  : `Discarded(${
                      discardedPodcasts ? discardedPodcasts.length : 0
                    })`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {publishedPodcastsLoading ||
        pendingPodcastsLoading ||
        discardedPodcastsLoading ? (
          <Loader />
        ) : (
          <View style={styles.articleContainer}>
            <FlatList
              data={
                selectedStatus === 1
                  ? publishedPodcasts ?? []
                  : selectedStatus === 2
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
                    source={require('../../../assets/images/no_results.jpg')}
                    style={styles.image}
                  />
                  <Text style={styles.message}>No podcasts Found</Text>
                </View>
              }
              onEndReached={() => {
                if (selectedStatus === 1) {
                  if (publishedPage < totalPublishPages) {
                    setPublishedPage(prev => prev + 1);
                  }
                } else if (selectedStatus === 2) {
                  if (pendingPage < totalPendingPages) {
                    setPendingPage(prev => prev + 1);
                  }
                } else if (selectedStatus === 3) {
                  if (discardedPage < totalDiscardedPages) {
                    setDiscardedPage(prev => prev + 1);
                  }
                }
              }}
              onEndReachedThreshold={0.5}
            />
          </View>
        )}
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
    marginHorizontal: 2,
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
