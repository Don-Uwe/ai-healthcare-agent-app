import {useMutation, UseMutationResult} from '@tanstack/react-query';
import {ArticleData} from '../type';
import axios, {AxiosError} from 'axios';
import {SUBMIT_IMPROVEMENT} from '../helper/APIUtils';

type SubmitReq = {
  edited_content: string;
  recordId: string;
  requestId: string;
  imageUtils: string[];
};
export const useSubmitImprovement = (): UseMutationResult<
  ArticleData,
  AxiosError,
  SubmitReq
> => {
  return useMutation({
    mutationKey: ['submiit-improvemeny-key'],
    mutationFn: async ({
      edited_content,
      recordId,
      requestId,
      imageUtils,
    }: SubmitReq) => {
      const response = await axios.post(SUBMIT_IMPROVEMENT, {
        requestId: requestId,
        edited_content: edited_content,
        pb_recordId: recordId,
        imageUtils: imageUtils,
      });
      // console.log(article);
      return response.data.newArticle as ArticleData;
    },
  });
};
