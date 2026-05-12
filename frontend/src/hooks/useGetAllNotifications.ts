import {useQuery, UseQueryResult} from '@tanstack/react-query';
import {Notification} from '../type';
import axios, {AxiosError} from 'axios';
import {PROD_URL} from '../helper/APIUtils';
import {useSelector} from 'react-redux';

type NotificationRes = {
  totalPages: number;
  notifications: Notification[];
};
export const useGetAllNotifications = (
  page: number,
  isConnected: boolean,
): UseQueryResult<NotificationRes | null, AxiosError> => {
  const isGuest = useSelector((state: any) => state.user.isGuest);

  return useQuery({
    queryKey: ['get-all-notifications', page],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `${PROD_URL}/notifications?role=2&page=${page}`,
        );
        return response.data as NotificationRes;
      } catch (err) {
        console.error('Error fetching articles:', err);
        return null;
      }
    },
    enabled: !!isConnected && !!page && !isGuest,
  });
};
