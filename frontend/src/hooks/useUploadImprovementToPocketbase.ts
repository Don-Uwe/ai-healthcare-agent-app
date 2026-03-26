import {useMutation, UseMutationResult} from '@tanstack/react-query';
import {PocketBaseResponse} from '../type';
import axios, {AxiosError} from 'axios';
import {UPLOAD_IMPROVEMENT_TO_POCKETBASE} from '../helper/APIUtils';

interface ImprovementReq {
  title: string;
  htmlContent: string;
  article_id: string | null;
  record_id: string;
  improvement_id: string;
  user_id: string;
}

export const useUploadImprovementToPocketbase = (): UseMutationResult<
  PocketBaseResponse,
  AxiosError,
  ImprovementReq
> => {
  return useMutation({
    mutationKey: ['upload-improvement-to-pocketbase-key'],
    mutationFn: async (req: ImprovementReq) => {
      const response = await axios.post(UPLOAD_IMPROVEMENT_TO_POCKETBASE, {
        title: req.title,
        htmlContent: req.htmlContent,
        article_id: req.article_id,
        record_id: req.record_id,
        improvement_id: req.improvement_id,
        user_id: req.user_id,
      });
      return response.data as PocketBaseResponse;
    },
  });
};
