import {useMutation, UseMutationResult} from '@tanstack/react-query';
import {PROD_URL} from '../helper/APIUtils';
import axios, {AxiosError} from 'axios';

export const useDeleteNotification = (): UseMutationResult<
  any,
  AxiosError,
  string
> => {
  return useMutation({
    mutationKey: ['delete-notification-by-id'],
    mutationFn: async (id: string) => {
      const res = await axios.delete(`${PROD_URL}/notification/${id}`);
      return res.data as any;
    },
  });
};
