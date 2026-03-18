
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import axios from "axios";
import { WriteStatus } from "../type";
import { GET_TOTAL_WRITES } from "../helper/APIUtils";

export const useGetTotalWrites = (
 {
 user_id,
 userId,
 others,
 isConnected
 }:{
  user_id: string;
  userId?: string;
  others?: boolean;
  isConnected?: boolean
 }
): UseQueryResult<WriteStatus> => {

  return useQuery<WriteStatus>({
    queryKey: ["get-total-writes", user_id, userId, others],

    queryFn: async () => {
   
      const url = others
        ? `${GET_TOTAL_WRITES}${userId}`
        : `${GET_TOTAL_WRITES}${user_id}`;

      const response = await axios.get(url);

      return response.data as WriteStatus;
    },

    enabled: !!isConnected && !!(!userId && others) && !!(!user_id && !others),
  });
};