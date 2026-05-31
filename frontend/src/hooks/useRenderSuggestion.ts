import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { ContentSuggestionResponse } from "../type";
import axios, { AxiosError } from "axios";
import { RENDER_SUGGESTION } from "../helper/APIUtils";

type RenderSuggestionReq = {
  text: string;
};

export const useRenderSuggestion = (): UseMutationResult<
  ContentSuggestionResponse,
  AxiosError,
  RenderSuggestionReq
> => {
  return useMutation({
    mutationFn: async (data: RenderSuggestionReq) => {
      const response = await axios.post<ContentSuggestionResponse>(
        RENDER_SUGGESTION,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
  });
};
