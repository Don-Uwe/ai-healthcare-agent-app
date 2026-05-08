import {useQuery, UseQueryResult} from '@tanstack/react-query';
import axios, {AxiosError} from 'axios';
import {GET_ARTICLE_TRANSLATIONS} from '../helper/APIUtils';
import {ArticleData} from '../type';

type ArticleTranslationsRes = {
  translations: ArticleData[];
};

export const useGetArticleTranslations = (
  articleId: number | string,
  language?: string,
): UseQueryResult<ArticleTranslationsRes, AxiosError> => {
  return useQuery({
    queryKey: ['get-article-translations', articleId, language],
    queryFn: async () => {
      const response = await axios.get(GET_ARTICLE_TRANSLATIONS(articleId), {
        params: language ? {language} : undefined,
      });

      return response.data as ArticleTranslationsRes;
    },
    enabled: !!articleId,
  });
};
