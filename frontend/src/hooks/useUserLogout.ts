import {useMutation, UseMutationResult} from '@tanstack/react-query';
import axios, {AxiosError} from 'axios';
import {USER_LOGOUT} from '../helper/APIUtils';

export const useUserLogout = (): UseMutationResult<any, AxiosError> => {
  return useMutation({
    mutationKey: ['user-logout'],
    mutationFn: async () => {
      const response = await axios.post(`${USER_LOGOUT}`, {});
      return response.data as any;
    },
  });
};
