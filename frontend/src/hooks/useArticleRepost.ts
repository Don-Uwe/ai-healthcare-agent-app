import {useMutation, UseMutationResult} from '@tanstack/react-query';
import {REPOST_ARTICLE} from '../helper/APIUtils';
import axios, {AxiosError} from 'axios';

export const useRepostArticle = (
  articleId: number,
): UseMutationResult<any, AxiosError> => {
  return useMutation({
    mutationKey: [`repost-article`, articleId],
    mutationFn: async () => {
      const res = await axios.post(REPOST_ARTICLE, {
        articleId: articleId,
      });

      return res.data as any;
    },
  });
};
