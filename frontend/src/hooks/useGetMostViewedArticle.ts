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
  return useQuery<ArticleData[]>({
    queryKey: ['get-mostly-viewed-article', user_id, userId, others],

    queryFn: async () => {
      const url = others
        ? `${GET_MOSTLY_VIEWED}${userId}`
        : `${GET_MOSTLY_VIEWED}${user_id}`;

      const response = await axios.get(url);

      return response.data as ArticleData[];
    },

    enabled: !!isConnected && !!(!userId && others) && !!(!user_id && !others),
  });
};
