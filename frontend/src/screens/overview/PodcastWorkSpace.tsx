import {useCallback, useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  FlatList,
  Image,
} from 'react-native';
import {PodcastData} from '../../type';
import {useSelector} from 'react-redux';
import {msToTime} from '../../helper/Utils';
import PodcastCard from '../../components/PodcastCard';
import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../../helper/Theme';
import {hp} from '../../helper/Metric';
import Loader from '../../components/Loader';
import {useGetPendingPodcasts} from '@/src/hooks/useGetPendingPodcasts';
import {useGetDiscardedPodcasts} from '@/src/hooks/useGetDiscardedPodcast';
import {useGetUserPublishedPodcasts} from '@/src/hooks/useGetUserPublishedPodcasts';

export default function PodcastWorkSpace({
  handleClickAction,
}: {
  handleClickAction: (item: PodcastData) => void;
}) {
  const { user_handle} = useSelector((state: any) => state.user);
  const {isConnected} = useSelector((state: any) => state.network);
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
    data: publishedPodcastsData,
    isLoading: publishedPodcastsLoading,
    refetch: publishedPodcastsRefetch,
  } = useGetUserPublishedPodcasts(publishedPage, isConnected);

  const {
    data: pendingPodcastsData,
    isLoading: pendingPodcastsLoading,
    refetch: pendingPodcastsRefetch,
  } = useGetPendingPodcasts(pendingPage, isConnected);

  const {
    data: discardedPodcastsData,
    isLoading: discardedPodcastsLoading,
    refetch: discardedPodcastsRefetch,
  } = useGetDiscardedPodcasts(discardedPage, isConnected);

  useEffect(() => {
    if (publishedPodcastsData) {
      if (Number(publishedPage) === 1 && publishedPodcastsData.totalPages) {
        let totalPage = publishedPodcastsData.totalPages;
        setTotalPublishPages(totalPage);

        setPublishedPodcasts(publishedPodcastsData.publishedPodcasts);
      } else {
        if (publishedPodcastsData.publishedPodcasts) {
          let oldPodcasts =
            (publishedPodcasts as PodcastData[]) ?? ([] as PodcastData[]);
          let newPodcasts =
            publishedPodcastsData.publishedPodcasts as PodcastData[];
          setPublishedPodcasts([...oldPodcasts, ...newPodcasts]);
        }
      }
    }
  }, [publishedPodcastsData, publishedPodcasts, publishedPage]);

  useEffect(() => {
    if (pendingPodcastsData) {
      if (Number(pendingPage) === 1 && pendingPodcastsData.totalPages) {
        let totalPage = pendingPodcastsData.totalPages;
        setTotalPendingPages(totalPage);

        setPendingPodcasts(pendingPodcastsData.pendingPodcasts);
      } else {
        if (pendingPodcastsData.pendingPodcasts) {
          let oldPodcasts =
            (pendingPodcasts as PodcastData[]) ?? ([] as PodcastData[]);
          let newPodcasts =
            pendingPodcastsData.pendingPodcasts as PodcastData[];
          setPendingPodcasts([...oldPodcasts, ...newPodcasts]);
        }
      }
    }
  }, [pendingPage, pendingPodcasts, pendingPodcastsData]);

  useEffect(() => {
    if (discardedPodcastsData) {
      if (Number(discardedPage) === 1 && discardedPodcastsData.totalPages) {
        let totalPage = discardedPodcastsData.totalPages;
        setTotalDiscardedPages(totalPage);

        setDiscardedPodcasts(discardedPodcastsData.discardedPodcasts);
      } else {
        if (discardedPodcastsData.discardedPodcasts) {
          let oldPodcasts =
            (discardedPodcasts as PodcastData[]) ?? ([] as PodcastData[]);
          let newPodcasts =
            discardedPodcastsData.discardedPodcasts as PodcastData[];
          setDiscardedPodcasts([...oldPodcasts, ...newPodcasts]);
        }
      }
    }
  }, [discardedPodcasts, discardedPodcastsData, discardedPage]);

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
          audioUrl={item.audio_url}
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
                  ? (publishedPodcasts ?? [])
                  : selectedStatus === 2
                    ? (pendingPodcasts ?? [])
                    : (discardedPodcasts ?? [])
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
    paddingHorizontal: hp(1),
    marginBottom: hp(13),
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
