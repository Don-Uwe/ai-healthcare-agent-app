
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import axios from "axios";
import { ReadStatus } from "../type";
import { GET_TOTAL_READS } from "../helper/APIUtils";

export const useGetTotalReads = (
  user_id: string,
  userId?: string,
  others?: boolean,
  isConnected?: boolean
): UseQueryResult<ReadStatus> => {

  return useQuery<ReadStatus>({
    queryKey: ["get-total-reads", user_id, userId, others],

    queryFn: async () => {
   
      const url = others
        ? `${GET_TOTAL_READS}${userId}`
        : `${GET_TOTAL_READS}${user_id}`;

      const response = await axios.get(url);

      return response.data as ReadStatus;
    },

    enabled: !!isConnected && !!(!userId && others) && !!(!user_id && !others),
  });
};