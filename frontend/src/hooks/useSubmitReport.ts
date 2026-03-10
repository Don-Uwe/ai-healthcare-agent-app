import { useMutation, UseMutationResult } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { SUBMIT_REPORT } from "../helper/APIUtils";

type SubmitReportParams = {
  articleId?: number | null;
  podcastId?: number | null;
  commentId?: number | null;
  reportedBy: number;
  reasonId: number;
  authorId: number;
};

export const useSubmitReport = ():UseMutationResult<
any,
AxiosError,
SubmitReportParams
> => {
  return useMutation({
    mutationKey: ["submit-report"],
    mutationFn: async ({
      articleId,
      podcastId,
      commentId,
      reportedBy,
      reasonId,
      authorId,
    }: SubmitReportParams) => {
  
      const res = await axios.post(
        SUBMIT_REPORT,
        {
          articleId: podcastId ? null : articleId,
          podcastId: podcastId,
          commentId: commentId,
          reportedBy: reportedBy,
          reasonId: reasonId,
          authorId: authorId,
        },
      );

      return { data: res.data };
    },


  });
};