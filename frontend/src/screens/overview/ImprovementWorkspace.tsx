import React, {useCallback, useEffect, useState} from 'react';
import {
  FlatList,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import {EditRequest} from '../../type';
import {useSelector} from 'react-redux';
import Loader from '../../components/Loader';
import ImprovementCard from '../../components/ImprovementCard';
import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../../helper/Theme';
import {hp, wp} from '../../helper/Metric';
import {useGetAllImprovementsForReview} from '@/src/hooks/useGetUserAllImprovements';
import {ProfessionalColors} from '../../styles/GlassStyles';
import {NoArticleState} from '../../components/EmptyStates';

export default function ImprovementWorkspace({
  handleImprovementClick,
}: {
  handleImprovementClick: (item: EditRequest) => void;
}) {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
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
    <View style={{flex: 1, backgroundColor: isDarkMode ? '#000A60' : '#F0F8FF'}}>
      <View style={styles.container}>
        <View style={styles.buttonContainer}>
          {categories.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={{
                ...styles.button,
                backgroundColor:
                  selectedStatus !== item.status
                    ? (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)')
                    : PRIMARY_COLOR,
                borderColor:
                  selectedStatus !== item.status ? (isDarkMode ? 'rgba(0, 191, 255, 0.5)' : PRIMARY_COLOR) : PRIMARY_COLOR,
                borderWidth: 1.5,
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
                  color: selectedStatus !== item.status ? (isDarkMode ? ProfessionalColors.white : ProfessionalColors.gray800) : 'white',
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
                <View style={styles.emptyWrapper}>
                  <NoArticleState onRefresh={onRefresh} />
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
    paddingBottom: hp(2),
  },
  emptyWrapper: {
    minHeight: hp(50),
    justifyContent: 'center',
  },
});
