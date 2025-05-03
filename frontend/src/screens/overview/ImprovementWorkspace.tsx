import React, {useCallback, useState} from 'react';
import {
  FlatList,
  TouchableOpacity,
  View,
  Image,
  Text,
  StyleSheet,
} from 'react-native';
import {EditRequest} from '../../type';
import {GET_ALL_IMPROVEMENTS_FOR_USER} from '../../helper/APIUtils';
import axios from 'axios';
import {useQuery} from '@tanstack/react-query';
import {useSelector} from 'react-redux';
import {StatusEnum} from '../../helper/Utils';
import Loader from '../../components/Loader';
import ImprovementCard from '../../components/ImprovementCard';
import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../../helper/Theme';
import {hp} from '../../helper/Metric';

export default function ImprovementWorkspace({
  handleImprovementClick,
}: {
  handleImprovementClick: (item: EditRequest) => void;
}) {
  const {user_token} = useSelector((state: any) => state.user);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const {
    data: improvements,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['get-all-improvements-for-review'],
    queryFn: async () => {
      try {
        const response = await axios.get(`${GET_ALL_IMPROVEMENTS_FOR_USER}`, {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        });
        return response.data as EditRequest[];
      } catch (err) {
        console.error('Error fetching articles:', err);
      }
    },
  });


  const progressLabel = `Progress (${
    improvements
      ? improvements.filter(
          a =>
            a.status === StatusEnum.AWAITING_USER ||
            a.status === StatusEnum.REVIEW_PENDING ||
            a.status === StatusEnum.IN_PROGRESS ||
            a.status === StatusEnum.UNASSIGNED,
        ).length
      : 0
  })`;
  const publishedLabel = `Published (${
    improvements
      ? improvements.filter(a => a.status === StatusEnum.PUBLISHED).length
      : 0
  })`;

  const discardLabel = `Discarded (${
    improvements
      ? improvements.filter(a => a.status === StatusEnum.DISCARDED).length
      : 0
  })`;

  const categories = [publishedLabel, progressLabel, discardLabel];
  const [selectedCategory, setSelectedCategory] =
    useState<string>(publishedLabel);

  const onRefresh = () => {
    setRefreshing(true);
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

  if (isLoading) {
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
                ? improvements
                  ? improvements.filter(a => a.status === StatusEnum.PUBLISHED)
                  : []
                : selectedCategory === progressLabel
                ? improvements
                  ? improvements.filter(
                      a =>
                        a.status === StatusEnum.AWAITING_USER ||
                        a.status === StatusEnum.REVIEW_PENDING ||
                        a.status === StatusEnum.IN_PROGRESS ||
                        a.status === StatusEnum.UNASSIGNED,
                    )
                  : []
                : improvements
                ? improvements.filter(a => a.status === StatusEnum.DISCARDED)
                : []
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
                <Text style={styles.message}>No Article Found</Text>
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
