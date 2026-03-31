import {useQuery, UseQueryResult} from '@tanstack/react-query';
import axios from 'axios';
import {UserStatus} from '../type';
import {GET_TOTAL_LIKES_VIEWS} from '../helper/APIUtils';

export const useGetTotalLikeViewStatus = ({
  user_id,
  userId,
  others,
  isConnected,
}: {
  user_id: string;
  userId?: string;
  others?: boolean;
  isConnected?: boolean;
}): UseQueryResult<UserStatus> => {
  return useQuery<UserStatus>({
    queryKey: ['get-like-view-status', user_id, userId, others],

    queryFn: async () => {
      const url = others
        ? `${GET_TOTAL_LIKES_VIEWS}${userId}`
        : `${GET_TOTAL_LIKES_VIEWS}${user_id}`;

       
      const response = await axios.get(url);
    
      return response.data as UserStatus;
    },

    enabled: !!isConnected && !!(!userId && others) && !!(!user_id && !others),
  });
};
