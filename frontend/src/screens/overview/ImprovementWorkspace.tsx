import React, {useCallback, useEffect, useState} from 'react';
import {
  FlatList,
  TouchableOpacity,
  View,
  Image,
  Text,
  StyleSheet,
} from 'react-native';
import {EditRequest} from '../../type';
import {useSelector} from 'react-redux';
import Loader from '../../components/Loader';
import ImprovementCard from '../../components/ImprovementCard';
import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../../helper/Theme';
import {hp} from '../../helper/Metric';
import {useGetAllImprovementsForReview} from '@/src/hooks/useGetUserAllImprovements';

export default function ImprovementWorkspace({
  handleImprovementClick,
}: {
  handleImprovementClick: (item: EditRequest) => void;
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
  const [improvementData, setImprovementData] = useState<EditRequest[]>([]);
  const [pageLoading, setPageLoading] = useState(false);

  const {isLoading, refetch} = useGetAllImprovementsForReview({
    page,
    selectedStatus,
    visit,
    setVisit,
    setTotalPages,
    setImprovementData,
    setPublishedLabel,
    setProgressLabel,
    setDiscardLabel,
  });

  useEffect(() => {
    refetch();
    setPageLoading(false);
  }, [page, selectedStatus, refetch]);

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
    ({item}: {item: EditRequest}) => {
      return (
        <ImprovementCard item={item} onNavigate={handleImprovementClick} />
      );
    },
    [handleImprovementClick],
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
                  selectedStatus !== item.status ? 'white' : PRIMARY_COLOR,
                borderColor:
                  selectedStatus !== item.status ? PRIMARY_COLOR : 'white',
              }}
              onPress={() => {
                setSelectedStatus(item.status);
                setPage(1);
                setImprovementData([]);
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
              data={improvementData ? improvementData : []}
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
                  <Text style={styles.message}>No Improvements Found</Text>
                </View>
              }
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
