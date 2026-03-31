import { useMutation, UseMutationResult } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { FOLLOW_USER } from "../helper/APIUtils";


export const useUpdateFollowStatus = (): UseMutationResult<
 boolean,
 AxiosError,
 string
>=>{
    return useMutation({
    mutationKey: ['update-follow-status'],

    mutationFn: async (userid: string) => {

      const res = await axios.post(
        FOLLOW_USER,
        {
          followUserId: userid,
        },
      );
      return res.data.followStatus as boolean;
    },
  });

}

export const useUpdateFollowStatusByArticle = (): UseMutationResult<
 boolean,
 AxiosError,
 string
>=>{
    return useMutation({
    mutationKey: ['update-follow-status'],

    mutationFn: async (articleId: string) => {

      const res = await axios.post(
        FOLLOW_USER,
        {
          articleId: articleId,
        },
      );
      return res.data.followStatus as boolean;
    },
  });

}