import axios, {AxiosError} from 'axios';
import {ArticleData} from '../type';
import {useMutation, UseMutationResult} from '@tanstack/react-query';
import {LIKE_ARTICLE} from '../helper/APIUtils';

export const useLikeArticle = (
  articleId: number,
): UseMutationResult<
  {
    article: ArticleData;
    likeStatus: boolean;
  },
  AxiosError
> => {
  return useMutation({
    mutationKey: ['update-like-status', articleId],

    mutationFn: async () => {
      const res = await axios.post(LIKE_ARTICLE, {
        article_id: articleId,
      });

      return res.data.data as {
        article: ArticleData;
        likeStatus: boolean;
      };
    },
  });
};
