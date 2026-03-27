import axios, {AxiosError} from 'axios';
import {User} from '../type';
import {PROD_URL} from '../helper/APIUtils';
import {useQuery, UseQueryResult} from '@tanstack/react-query';

export const useGetAuthorProfile = (
  authorId: string,
  author_handle: string | undefined,
  user_id: string,
  isConnected: boolean
): UseQueryResult<User | undefined, AxiosError> => {
  return useQuery({
    queryKey: ['get-user-profile'],
    queryFn: async () => {
      let url: string;
      if (authorId) {
        url = `${PROD_URL}/user/getuserprofile?id=${authorId}`;
      } else if (author_handle) {
        url = `${PROD_URL}/user/getuserprofile?handle=${author_handle}`;
      } else {
        url = `${PROD_URL}/user/getuserprofile?id=${user_id}`;
      }
      const response = await axios.get(url);
      return response.data.profile as User;
    },
    enabled: !!isConnected
  });
};
