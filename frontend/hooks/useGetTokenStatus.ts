
// hooks/useCheckTokenStatus.ts
import { GET_TOKEN_STATUS } from '@/src/helper/APIUtils';
import { KEYS, retrieveItem } from '@/src/helper/Utils';
import { TokenStatus } from '@/src/type';
import {useQuery} from '@tanstack/react-query';
import axios from 'axios';

 const checkTokenStatusApi = async (
  token: string,
): Promise<TokenStatus> => {
  const res = await axios.get<TokenStatus>(
    `${GET_TOKEN_STATUS}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return res.data;
};
export const useCheckTokenStatus = () => {
  return useQuery<TokenStatus>({
    queryKey: ['token-status'],
    queryFn: async () => {
      const token = await retrieveItem(KEYS.USER_TOKEN);
      console.log('Checking token status for token:', token);
      if (!token) {
        return { isValid: false, message: 'No token found' };
      }

      return checkTokenStatusApi(token);
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
};
