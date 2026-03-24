import {useMutation, UseMutationResult} from '@tanstack/react-query';
import axios, {AxiosError} from 'axios';
import {GET_ARTICLE_CONTENT} from '../helper/APIUtils';

interface ArticleContentResponse {
  htmlContent: string;
}

export const useLazyGetArticleContent = (): UseMutationResult<
  string,
  AxiosError,
  string
> => {
  return useMutation({
    mutationKey: ['lazy-get-article-content'],
    mutationFn: async (recordId: string) => {
      const response = await axios.get<ArticleContentResponse>(
        `${GET_ARTICLE_CONTENT}/${recordId}`,
      );
      return response.data.htmlContent;
    },
  });
};
