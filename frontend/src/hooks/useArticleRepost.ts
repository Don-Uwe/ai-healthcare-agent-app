import {useMutation, UseMutationResult} from '@tanstack/react-query';
import {REPOST_ARTICLE} from '../helper/APIUtils';
import axios, {AxiosError} from 'axios';
import {useSelector} from 'react-redux';

export const useRepostArticle = (
 
): UseMutationResult<any, AxiosError, number> => {
  const isGuest = useSelector((state: any) => state.user.isGuest);

  return useMutation({
    mutationKey: [`repost-article`],
    mutationFn: async ( articleId: number,) => {
      if (isGuest) {
        return Promise.reject(new Error('Guest cannot repost articles'));
      }
      const res = await axios.post(REPOST_ARTICLE, {
        articleId: articleId,
      });

      return res.data as any;
    },
  });
};
