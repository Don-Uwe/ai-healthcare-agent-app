import axios, {AxiosError} from 'axios';
import {PROD_URL} from '../helper/APIUtils';
import {useMutation, UseMutationResult} from '@tanstack/react-query';

export const useMarkNotificationAsRead = (): UseMutationResult<
  any,
  AxiosError
> => {
  return useMutation({
    mutationKey: ['mark-notification-as-read'],
    mutationFn: async () => {
      const res = await axios.put(
        `${PROD_URL}/notifications/mark-as-read?role=2`,
        {
          role: 2,
        },
      );

      return res.data as any;
    },
  });
};
