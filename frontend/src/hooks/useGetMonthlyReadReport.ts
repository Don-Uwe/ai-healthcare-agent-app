
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import axios from "axios";
import { MonthStatus } from "../type";
import { GET_MONTHLY_READ_REPORT } from "../helper/APIUtils";

export const useGetAuthorMonthlyReadReport = (
  user_id: string,
  selectedMonth: number,
  userId?: string,
  others?: boolean,
  isConnected?: boolean,
  
): UseQueryResult<MonthStatus[]> => {

  return useQuery<MonthStatus[]>({
    queryKey: ["get-user-monthly-read-report", user_id, userId, others],

    queryFn: async () => {

        if(selectedMonth === -1){
            return [];
        }
   
       let url = others
               ? `${GET_MONTHLY_READ_REPORT}?userId=${userId}&month=${selectedMonth}`
               : `${GET_MONTHLY_READ_REPORT}?userId=${user_id}&month=${selectedMonth}`;

      const response = await axios.get(url);

      return response.data.monthlyReads as MonthStatus[];
    },

    enabled: !!isConnected && !!(!userId && others) && !!(!user_id && !others),
  });
};