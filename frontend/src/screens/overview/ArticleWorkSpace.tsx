import {useQuery} from '@tanstack/react-query';
import axios from 'axios';
import React, {useCallback, useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  FlatList,
  Image,
} from 'react-native';
import {GET_ALL_ARTICLES_FOR_USER} from '../../helper/APIUtils';
import {ArticleData} from '../../type';
import {useSelector} from 'react-redux';
import {StatusEnum} from '../../helper/Utils';
import ReviewCard from '../../components/ReviewCard';
import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../../helper/Theme';
import {hp} from '../../helper/Metric';
import Loader from '../../components/Loader';

export default function ArticleWorkSpace({
  handleClickAction,
}: {
  handleClickAction: (item: ArticleData) => void;
}) {
  const {user_token} = useSelector((state: any) => state.user);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const {
    data: articles,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['get-all-articles-for-user'],
    queryFn: async () => {
      try {
        const response = await axios.get(`${GET_ALL_ARTICLES_FOR_USER}`, {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        });

        //console.log('Article Response', response);
        let d = response.data.articles as ArticleData[];
        //updateArticles(d);
        return response.data.articles as ArticleData[];
      } catch (err) {
        console.error('Error fetching articles:', err);
      }
    },
  });

  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const progressLabel = `Progress (${
    articles
      ? articles.filter(
          a =>
            a.status === StatusEnum.AWAITING_USER ||
            a.status === StatusEnum.REVIEW_PENDING ||
            a.status === StatusEnum.IN_PROGRESS ||
            a.status === StatusEnum.UNASSIGNED,
        ).length
      : 0
  })`;
  const publishedLabel = `Published (${
    articles
      ? articles.filter(a => a.status === StatusEnum.PUBLISHED).length
      : 0
  })`;

  const discardLabel = `Discarded (${
    articles
      ? articles.filter(a => a.status === StatusEnum.DISCARDED).length
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
                ? articles
                  ? articles.filter(a => a.status === StatusEnum.PUBLISHED)
                  : []
                : selectedCategory === progressLabel
                ? articles
                  ? articles.filter(
                      a =>
                        a.status === StatusEnum.AWAITING_USER ||
                        a.status === StatusEnum.REVIEW_PENDING ||
                        a.status === StatusEnum.IN_PROGRESS ||
                        a.status === StatusEnum.UNASSIGNED,
                    )
                  : []
                : articles
                ? articles.filter(a => a.status === StatusEnum.DISCARDED)
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
