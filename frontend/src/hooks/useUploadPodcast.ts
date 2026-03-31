import {useMutation, UseMutationResult} from '@tanstack/react-query';
import {UPLOAD_PODCAST} from '../helper/APIUtils';
import axios, {AxiosError} from 'axios';
import {Category} from '../type';

type PodcastReq = {
  title: string;
  description: string;
  tags: Category[];
  article_id: string | null;
  audio_url: string;
  cover_image: string;
  duration: number;
};
export const useUploadPodcast = (): UseMutationResult<
  string,
  AxiosError,
  PodcastReq
> => {
  return useMutation({
    mutationKey: ['uploadPodcast'],
    mutationFn: async ({
      audio_url,
      cover_image,
      title,
      description,
      tags,
      article_id,
      duration,
    }: PodcastReq) => {
      const response = await axios.post(UPLOAD_PODCAST, {
        title: title,
        description: description,
        tags: tags,
        article_id: null,
        audio_url: audio_url,
        cover_image: cover_image,
        duration: duration,
      });

      return response.data.message as string;
    },
  });
};
