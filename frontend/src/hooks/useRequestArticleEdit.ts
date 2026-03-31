import { useMutation, UseMutationResult } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { REQUEST_EDIT } from "../helper/APIUtils";

type ArticleEditReq = {
  articleId: string;
  reason: string;
  articleRecordId: string;
};

export const useRequestArticleEdit = (): UseMutationResult<
 string,
 AxiosError,
 ArticleEditReq
>=>{
    return useMutation({
    mutationKey: ['submit-edit-request'],
    mutationFn: async ({
      articleId,
      reason,
      articleRecordId,
    }:ArticleEditReq) => {
      const res = await axios.post(
        REQUEST_EDIT,
        {
          article_id: articleId,
          edit_reason: reason,
          article_recordId: articleRecordId,
        }
      );

      return res.data.message as string;
    },

  });
}
