import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { ContentSuggestionResponse } from "../type";
import axios, { AxiosError } from "axios";
import { RENDER_SUGGESTION } from "../helper/APIUtils";

type RenderSuggestionReq = {
    text: string;
}
export const useRenderSuggestion =  (): UseMutationResult<
ContentSuggestionResponse,
AxiosError,
RenderSuggestionReq
>=>{
 return  useMutation({
    mutationKey: ['render-suggestion-key'],
    mutationFn: async (req: RenderSuggestionReq) => {
   
      const response = await axios.post(
        RENDER_SUGGESTION,
        {
          text: req.text,
        },
      );
      return response.data as ContentSuggestionResponse;
    },
  });
}