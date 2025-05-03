import {useQuery} from '@tanstack/react-query';
import axios from 'axios';
import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import {GET_ALL_ARTICLES_FOR_USER} from '../../helper/APIUtils';
import {ArticleData} from '../../type';
import {useSelector} from 'react-redux';
import {StatusEnum} from '../../helper/Utils';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ReviewCard from '../../components/ReviewCard';

export default function ArticleWorkSpace({
  handleClickAction,
}: {
  handleClickAction: (item: ArticleData) => void;
}) {
  const {user_token} = useSelector((state: any) => state.user);
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const {
    data: articles,
    isLoading,
    isError,
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
  return <View />;
}
