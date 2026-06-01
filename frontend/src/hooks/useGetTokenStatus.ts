
// hooks/useCheckTokenStatus.ts
import { GET_TOKEN_STATUS } from '@/src/helper/APIUtils';
import { SECURE_KEYS, SecureKey, secureRetrieveItem } from '../helper/SecureStorageUtils';
import { TokenStatus } from '@/src/type';
import {useQuery} from '@tanstack/react-query';
import axios from 'axios';
import { useSelector } from 'react-redux';

 const checkTokenStatusApi = async (
  token: string,
): Promise<TokenStatus> => {
  try {
    const res = await axios.get<TokenStatus>(
      `${GET_TOKEN_STATUS}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        // Use a custom validateStatus so 401 does NOT throw and
        // does NOT trigger the global interceptor's session-clear logic.
        //validateStatus: status => status < 500,
      },
    );
    if (res.status === 401 || res.status === 403) {
      return { isValid: false, message: 'Token expired or invalid' };
    }
    return res.data;
  } catch (error) {
    // Network error or server error — treat as invalid to avoid blank screen
    return { isValid: false, message: 'Network error during token check' };
  }
};
export const useCheckTokenStatus = () => {
  const isGuest = useSelector((state: any) => state.user.isGuest);

  return useQuery<TokenStatus>({
    queryKey: ['token-status'],
    queryFn: async () => {
      const token = await secureRetrieveItem(SECURE_KEYS.USER_TOKEN as SecureKey);
      console.log('Checking token status. Token present:', !!token);
      if (!token) {
        return { isValid: false, message: 'No token found' };
      }

      return checkTokenStatusApi(token);
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
    enabled: !isGuest,
  });
};
