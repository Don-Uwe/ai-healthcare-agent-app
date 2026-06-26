import {useMutation, UseMutationResult} from '@tanstack/react-query';
import {TRUST_ARTICLE} from '../helper/APIUtils';
import axios, {AxiosError} from 'axios';

export const useTrustArticle = (
  articleId: number,
): UseMutationResult<
  {
    message: string;
    isTrusted: boolean;
  },
  AxiosError
> => {
  return useMutation({
    mutationKey: ['update-trust-status', articleId],

    mutationFn: async () => {
      const res = await axios.post(TRUST_ARTICLE, {
        article_id: articleId,
      });

      return res.data as {
        message: string;
        isTrusted: boolean;
      };
    },
  });
};
