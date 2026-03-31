import { useMutation, UseMutationResult } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { UPDATE_READ_EVENT } from "../helper/APIUtils";

export const useUpdateReadEvent = (articleId: number): UseMutationResult<
any,
AxiosError
>=>{
   
    return useMutation({
    mutationKey: ['update-read-event-status', articleId],

    mutationFn: async () => {
 
      const res = await axios.post(
        UPDATE_READ_EVENT,
        {
          article_id: articleId,
        }
      );
      return res.data as any;
    }
  });
}