import {useMutation, UseMutationResult} from '@tanstack/react-query';
import {REPOST_ARTICLE} from '../helper/APIUtils';
import axios, {AxiosError} from 'axios';

export const useRepostArticle = (
 
): UseMutationResult<any, AxiosError, number> => {
  return useMutation({
    mutationKey: [`repost-article`],
    mutationFn: async ( articleId: number,) => {
      const res = await axios.post(REPOST_ARTICLE, {
        articleId: articleId,
      });

      return res.data as any;
    },
  });
};
