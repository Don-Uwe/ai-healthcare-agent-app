import { useMutation, UseMutationResult } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { SUBMIT_SUGGESTED_CHANGES } from "../helper/APIUtils";

type SubmitSuggestedChangesParams = {
  article: string;
  title: string;
  userId: number;
  authorName: string;
  articleId: string;
  tags: string[];
  imageUtils: any;
  description: string;
};

export const useSubmitSuggestedChanges = (): UseMutationResult<
any,
AxiosError,
SubmitSuggestedChangesParams
> => {
  return useMutation({
    mutationKey: ["submit-post-key"],

    mutationFn: async ({
      article,
      title,
      userId,
      authorName,
      articleId,
      tags,
      imageUtils,
      description,
    }: SubmitSuggestedChangesParams) => {
      const response = await axios.post(
        SUBMIT_SUGGESTED_CHANGES,
        {
          title,
          userId,
          authorName,
          articleId,
          content: article,
          tags,
          imageUtils,
          description,
        }
      );

      return { data: response.data.newArticle};
    },
  });
};