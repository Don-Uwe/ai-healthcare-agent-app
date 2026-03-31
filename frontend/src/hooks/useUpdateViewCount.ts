import axios, {AxiosError} from 'axios';
import {ArticleData} from '../type';
import {useMutation, UseMutationResult} from '@tanstack/react-query';
import {UPDATE_VIEW_COUNT} from '../helper/APIUtils';

export const useUpdateViewCount = (articleId: number): UseMutationResult<
  ArticleData | null,
  AxiosError
> => {
  return useMutation({
    mutationKey: ['update-view-count', articleId],
    mutationFn: async () => {

      if(articleId === 0){
        return null;
      }
      const res = await axios.post(UPDATE_VIEW_COUNT, {
        article_id: articleId,
      });

      return res.data.article as ArticleData;
    },
  });
};
