import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { Message } from "../type";
import axios, { AxiosError } from "axios";
import { CHAT_URL } from "../helper/APIUtils";


export const useLoadAIConversations = (isConnected: boolean, characterId?: string): UseQueryResult<
Message[],
AxiosError
>=>{
    return useQuery({
    queryKey: ['load-user-conversations', characterId],
    queryFn: async () => {
      const url = characterId ? `${CHAT_URL}?character=${characterId}` : `${CHAT_URL}`;
      const response = await axios.get(url);
      return response.data.messages as Message[];
    },
    enabled: !!isConnected
  });
}