import {useMutation, UseMutationResult} from '@tanstack/react-query';
import axios, {AxiosError} from 'axios';
import {UPDATE_NOTIFICATION_PREFERENCES} from '../helper/APIUtils';
//import {NotificationPreferencesResponse} from '../type';

import {Category, NotificationPreferencesResponse} from '../type';

type UpdatePreferencesReq = {
  contentClusters: Category[];
};

export const useUpdateNotificationPreferences = (): UseMutationResult<
  NotificationPreferencesResponse,
  AxiosError,
  UpdatePreferencesReq
> => {
  return useMutation({
    mutationKey: ['update-notification-preferences'],
    mutationFn: async (req: UpdatePreferencesReq) => {
      const response = await axios.put(UPDATE_NOTIFICATION_PREFERENCES, {
        contentClusters: req.contentClusters,
      });
      return response.data;
    },
  });
};
