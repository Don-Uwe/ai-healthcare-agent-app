import {useQuery, UseQueryResult} from '@tanstack/react-query';
import axios, {AxiosError} from 'axios';
import {GET_NOTIFICATION_PREFERENCES} from '../helper/APIUtils';
import {NotificationPreferences} from '../type';

type PreferencesResponse = {
  preferences: NotificationPreferences;
};

const fetchNotificationPreferences = async (): Promise<PreferencesResponse> => {
  const {data} = await axios.get(GET_NOTIFICATION_PREFERENCES);
  return data as PreferencesResponse;
};

export const useGetNotificationPreferences = (
  isConnected: boolean,
): UseQueryResult<PreferencesResponse, AxiosError> => {
  return useQuery({
    queryKey: ['notification-preferences'],
    queryFn: fetchNotificationPreferences,
    enabled: isConnected,
  });
};
