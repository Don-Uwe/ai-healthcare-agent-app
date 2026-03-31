import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { Message } from "../type";
import axios, { AxiosError } from "axios";
import { CHAT_URL } from "../helper/APIUtils";


export const useLoadAIConversations = (isConnected: boolean): UseQueryResult<
Message[],
AxiosError
>=>{
    return useQuery({
    queryKey: ['load-user-conversations'],
    queryFn: async () => {
      const response = await axios.get(`${CHAT_URL}`);
      return response.data.messages as Message[];
    },
    enabled: !!isConnected
  });
}