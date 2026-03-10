import { useMutation, UseMutationResult } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { REQUEST_EDIT } from "../helper/APIUtils";

type SubmitEditRequestParams = {
  articleId: string;
  reason: string;
  articleRecordId: string;
  userToken: string;
};

export const useSubmitEditRequest = ():UseMutationResult<
 string,
 AxiosError,
 SubmitEditRequestParams
> => {
  return useMutation({
    mutationKey: ["submit-edit-request"],

    mutationFn: async ({
      articleId,
      reason,
      articleRecordId,
      userToken,
    }: SubmitEditRequestParams) => {
      const res = await axios.post(
        REQUEST_EDIT,
        {
          article_id: articleId,
          edit_reason: reason,
          article_recordId: articleRecordId,
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      return res.data.message as string;
    },

  });
};