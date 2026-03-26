import {useQuery, UseQueryResult} from '@tanstack/react-query';
import {PlayList} from '../type';
import {GET_PLAYLIST} from '../helper/APIUtils';
import axios, {AxiosError} from 'axios';

export const useGetPlaylists = (): UseQueryResult<PlayList[], AxiosError> => {
  return useQuery({
    queryKey: ['get-my-playlists'],
    queryFn: async () => {
      const res = await axios.get(GET_PLAYLIST);
      return res.data as PlayList[];
    },
  });
};
