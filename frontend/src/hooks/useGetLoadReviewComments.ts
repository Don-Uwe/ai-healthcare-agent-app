import {useQuery, UseQueryResult} from '@tanstack/react-query';
import axios, {AxiosError} from 'axios';
import {LOAD_REVIEW_COMMENTS} from '../helper/APIUtils';
import {Comment} from '../type';

export const useGetLoadReviewComments = (
  articleId: number | undefined,
  requestId: string | undefined,
  isConnected: boolean
): UseQueryResult<Comment[], AxiosError> => {
  return useQuery({
    queryKey: ['get-review-comments', articleId, requestId],

    queryFn: async () => {
      const response = await axios.get(
        `${LOAD_REVIEW_COMMENTS}?articleId=${articleId}&requestId=${requestId}`,
      );

      return response.data as Comment[];
    },
    enabled: !!isConnected
  });
};
