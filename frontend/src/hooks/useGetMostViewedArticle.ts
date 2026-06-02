import {useQuery, UseQueryResult} from '@tanstack/react-query';
import axios from 'axios';
import {ArticleData} from '../type';
import {GET_MOSTLY_VIEWED} from '../helper/APIUtils';

export const useGetAuthorMostViewedArticles = ({
  user_id,
  userId,
  others,
  isConnected,
}: {
  user_id: string;
  userId?: string;
  others?: boolean;
  isConnected?: boolean;
}): UseQueryResult<ArticleData[]> => {
  const targetUserId = others ? userId : user_id;

  const shouldFetchMostViewedArticles =
    Boolean(isConnected) &&
    Boolean(others) &&
    Boolean(userId);

  return useQuery<ArticleData[]>({
    queryKey: ['get-mostly-viewed-article', targetUserId, others],

    queryFn: async () => {
      const url = `${GET_MOSTLY_VIEWED}${targetUserId}`;

      const response = await axios.get(url);

      return response.data as ArticleData[];
    },

    enabled: shouldFetchMostViewedArticles,
  });
};