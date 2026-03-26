import {useMutation, UseMutationResult} from '@tanstack/react-query';
import {PlayList} from '../type';
import axios, {AxiosError} from 'axios';
import {ADD_TO_PLAYLIST} from '../helper/APIUtils';

type PodcastReq = {
  addedPodcastId: string;
  selectedPlaylistId: string;
};
export const useUpdatePlaylist = (): UseMutationResult<
  PlayList,
  AxiosError,
  PodcastReq
> => {
  return useMutation({
    mutationKey: ['add-playlist-mutation'],
    mutationFn: async ({addedPodcastId, selectedPlaylistId}) => {
      const res = await axios.post(ADD_TO_PLAYLIST, {
        podcast_id: addedPodcastId,
        playlist_id: selectedPlaylistId,
      });

      return res.data.data as PlayList;
    },
  });
};
