import {useQuery, UseQueryResult} from '@tanstack/react-query';
import {TrustedUser} from '../type';
import axios, {AxiosError} from 'axios';
import {GET_TRUSTED_USERS} from '../helper/APIUtils';

export const useGetTrustedUsers = (
  articleId: number,
  enabled: boolean = true,
): UseQueryResult<TrustedUser[], AxiosError> => {
  return useQuery({
    queryKey: ['get-trusted-users', articleId],
    queryFn: async () => {
      const response = await axios.get(GET_TRUSTED_USERS, {
        params: {article_id: articleId},
      });

      return response.data.trustUsers as TrustedUser[];
    },
    enabled: enabled && !!articleId,
  });
};
