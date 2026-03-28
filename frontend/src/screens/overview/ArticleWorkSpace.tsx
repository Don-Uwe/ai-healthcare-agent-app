import {useCallback, useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  FlatList,
} from 'react-native';
import {ArticleData} from '../../type';
import {useSelector} from 'react-redux';
import ReviewCard from '../../components/ReviewCard';
import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../../helper/Theme';
import {hp, wp} from '../../helper/Metric';
import Loader from '../../components/Loader';
import {useGetAllArticlesForUser} from '@/src/hooks/useGetUserAllArticles';
import {NoArticleState} from '../../components/EmptyStates';

export default function ArticleWorkSpace({
  handleClickAction,
}: {
  handleClickAction: (item: ArticleData) => void;
}) {
  const {user_token} = useSelector((state: any) => state.user);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState(1);
  const [visit, setVisit] = useState(1);
  const [publishedLabel, setPublishedLabel] = useState('Published');
  const [progressLabel, setProgressLabel] = useState('Progress');
  const [discardLabel, setDiscardLabel] = useState('Discard');
  const [articleData, setArticleData] = useState<ArticleData[]>([]);

  const [pageLoading, setPageLoading] = useState(false);

  const {isLoading, refetch} = useGetAllArticlesForUser({
    page,
    selectedStatus,
    visit,
    setVisit,
    setTotalPages,
    setArticleData,
    setPublishedLabel,
    setProgressLabel,
    setDiscardLabel,
  });

  useEffect(() => {
    refetch();
    setPageLoading(false);
  }, [page, refetch, selectedStatus]);

  const [selectedCardId, setSelectedCardId] = useState<string>('');

  const categories = [
    {
      label: publishedLabel,
      status: 1,
    },
    {
      label: progressLabel,
      status: 2,
    },
    {
      label: discardLabel,
      status: 3,
    },
  ];

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    refetch();
    setRefreshing(false);
  };

  const renderItem = useCallback(
    ({item}: {item: ArticleData}) => {
      return (
        <ReviewCard
          item={item}
          isSelected={selectedCardId === item._id}
          setSelectedCardId={setSelectedCardId}
          onclick={handleClickAction}
        />
      );
    },
    [handleClickAction, selectedCardId],
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
                  item.status !== selectedStatus ? 'white' : PRIMARY_COLOR,
                borderColor:
                  item.status !== selectedStatus ? PRIMARY_COLOR : 'white',
              }}
              onPress={() => {
                setSelectedStatus(item.status);
                setPage(1);
                setArticleData([]);
                setPageLoading(true);
              }}>
              <Text
                style={{
                  ...styles.labelStyle,
                  color: selectedStatus !== item.status ? 'black' : 'white',
                }}>
                {item.status === 1
                  ? publishedLabel
                  : item.status === 2
                    ? progressLabel
                    : discardLabel}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading || pageLoading ? (
          <Loader />
        ) : (
          <View style={styles.articleContainer}>
            <FlatList
              data={articleData ? articleData : []}
              renderItem={renderItem}
              keyExtractor={item => item._id.toString()}
              contentContainerStyle={styles.flatListContentContainer}
              refreshing={refreshing}
              onRefresh={onRefresh}
              ListEmptyComponent={<NoArticleState onRefresh={onRefresh} />}
              onEndReached={() => {
                if (page < totalPages) {
                  setPage(prev => prev + 1);
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
    paddingHorizontal: wp(3),
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
    fontSize: 15,
    textTransform: 'capitalize',
    letterSpacing: 0.3,
  },
  articleContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 0,
  },
  flatListContentContainer: {
    paddingHorizontal: wp(4),
    paddingTop: hp(1),
    backgroundColor: ON_PRIMARY_COLOR,
    paddingBottom: hp(2),
  },
});
