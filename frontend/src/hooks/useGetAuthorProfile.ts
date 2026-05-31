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
  const cleanHandle = author_handle?.startsWith('@') ? author_handle.slice(1) : author_handle;
  return useQuery({
    queryKey: ['get-user-profile', authorId, cleanHandle, user_id],
    queryFn: async () => {
      let url: string;
      if (authorId) {
        url = `${PROD_URL}/user/getuserprofile?id=${authorId}`;
      } else if (cleanHandle) {
        url = `${PROD_URL}/user/getuserprofile?handle=${cleanHandle}&user_handle=${cleanHandle}&username=${cleanHandle}`;
      } else {
        url = `${PROD_URL}/user/getuserprofile?id=${user_id}`;
      }
      const response = await axios.get(url);
      return response.data.profile as User;
    },
    enabled: !!isConnected
  });
};
