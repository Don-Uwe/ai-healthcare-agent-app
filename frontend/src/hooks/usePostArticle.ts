import {useMutation, UseMutationResult} from '@tanstack/react-query';
import {ArticleData, Category} from '../type';
import axios, {AxiosError} from 'axios';
import {POST_ARTICLE} from '../helper/APIUtils';

type PostReq = {
  title: string;
  authorName: string;
  authorId: string;
  content: string;
  tags: Category[];
  imageUtils: string[];
  description: string;
  pb_recordId: string;
  allow_podcast: boolean;
  language: string;
};

export const usePostArticleData = (): UseMutationResult<
  ArticleData,
  AxiosError,
  PostReq
> => {
  return useMutation({
    mutationKey: ['create-post-key'],
    mutationFn: async (data: PostReq) => {
      const response = await axios.post(POST_ARTICLE, data);
      //  console.log(article);
      return response.data.newArticle as ArticleData;
    },
  });
};
