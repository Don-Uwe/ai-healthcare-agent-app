import {useMutation, UseMutationResult} from '@tanstack/react-query';
import {PodcastData} from '../type';
import axios, {AxiosError} from 'axios';
import {UPDATE_PODCAST_VIEW_COUNT} from '../helper/APIUtils';

export const useUpdatePodcastViewcount = (): UseMutationResult<
  PodcastData,
  AxiosError,
  string
> => {
  return useMutation({
    mutationKey: ['update-podcast-view-count'],
    mutationFn: async (podcastId: string) => {
      const res = await axios.post(`${UPDATE_PODCAST_VIEW_COUNT}`, {
        podcast_id: podcastId,
      });
      return res.data.data as PodcastData;
    },
  });
};
