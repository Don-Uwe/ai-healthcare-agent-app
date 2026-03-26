import {useMutation, UseMutationResult} from '@tanstack/react-query';
import {UPDATE_PODCAST_PLAYLIST} from '../helper/APIUtils';
import axios, {AxiosError} from 'axios';

type UpdatePlaylistReq = {
  addPlaylistIds: string[];
  removePlaylistIds: string[];
  playlist_name: string;
  podcast_id: string;
};

export const useUpdatePodcastPlaylist = (): UseMutationResult<
  any,
  AxiosError,
  UpdatePlaylistReq
> => {
  return useMutation({
    mutationKey: ['update-podcast-playlist'],
    mutationFn: async (req: UpdatePlaylistReq) => {
      const res = await axios.post(UPDATE_PODCAST_PLAYLIST, {
        addPlaylistIds: req.addPlaylistIds,
        removePlaylistIds: req.removePlaylistIds,
        playlist_name: req.playlist_name,
        podcast_id: req.podcast_id,
      });
      return res.data as any;
    },
  });
};
