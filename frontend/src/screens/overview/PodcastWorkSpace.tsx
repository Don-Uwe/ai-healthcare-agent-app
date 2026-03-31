import {useCallback, useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  FlatList,
} from 'react-native';
import {PodcastData} from '../../type';
import {useSelector} from 'react-redux';
import PodcastReviewCard from '../../components/PodcastReviewCard';
import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../../helper/Theme';
import {hp, wp} from '../../helper/Metric';
import Loader from '../../components/Loader';
import {useGetPendingPodcasts} from '@/src/hooks/useGetPendingPodcasts';
import {useGetDiscardedPodcasts} from '@/src/hooks/useGetDiscardedPodcast';
import {useGetUserPublishedPodcasts} from '@/src/hooks/useGetUserPublishedPodcasts';
import {NoPodcastState} from '../../components/EmptyStates';

export default function PodcastWorkSpace({
  handleClickAction,
}: {
  handleClickAction: (item: PodcastData) => void;
}) {
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
  }, [publishedPodcastsData, publishedPage]);

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
  }, [pendingPage, pendingPodcastsData]);

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
  }, [ discardedPodcastsData, discardedPage]);

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
        <PodcastReviewCard
          item={item}
          onNavigate={(podcast) => {
            handleClickAction(podcast);
          }}
        />
      );
    },
    [handleClickAction],
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
              ListEmptyComponent={<NoPodcastState onRefresh={onRefresh} />}
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
    paddingHorizontal: wp(3),
    gap: wp(2),
    marginBottom: hp(1),
  },
  button: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(2),
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PRIMARY_COLOR,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  labelStyle: {
    fontWeight: '700',
    fontSize: 13,
    textTransform: 'capitalize',
    letterSpacing: 0.3,
  },
  articleContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 0,
    marginBottom: hp(13),
  },
  flatListContentContainer: {
    paddingHorizontal: wp(4),
    paddingTop: hp(1),
    backgroundColor: ON_PRIMARY_COLOR,
    paddingBottom: hp(2),
  },
});
