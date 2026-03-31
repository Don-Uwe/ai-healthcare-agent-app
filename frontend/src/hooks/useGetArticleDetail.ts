import {useQuery, UseQueryResult} from '@tanstack/react-query';
import {ArticleData} from '../type';
import axios, {AxiosError} from 'axios';
import {GET_ARTICLE_BY_ID} from '../helper/APIUtils';

export const useGetArticleDetails = (
  articleId: number,
): UseQueryResult<ArticleData, AxiosError> => {
  return useQuery({
    queryKey: ['get-article-by-id', articleId],
    queryFn: async () => {
      const response = await axios.get(`${GET_ARTICLE_BY_ID}/${articleId}`);

      return response.data.article as ArticleData;
    },
  });
};
