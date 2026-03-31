import {useMutation, UseMutationResult} from '@tanstack/react-query';
import {PlayList} from '../type';
import axios, {AxiosError} from 'axios';
import {CREATE_PLAYLIST} from '../helper/APIUtils';

type PlayListReq = {
  inputValue: string;
  addedPodcastId: string;
};
export const useCreatePlaylist = (): UseMutationResult<
  PlayList,
  AxiosError,
  PlayListReq
> => {
  return useMutation({
    mutationKey: ['create-playlist'],
    mutationFn: async ({inputValue, addedPodcastId}) => {
      const res = await axios.post(CREATE_PLAYLIST, {
        name: inputValue,
        podcast_ids: [addedPodcastId],
      });

      return res.data.data as PlayList;
    },
  });
};
