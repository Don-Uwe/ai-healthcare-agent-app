import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { CHECK_USER_HANDLE } from "../helper/APIUtils";

export const useCheckUserHandleAvailability = (handle: string) => {
  return useQuery({
    queryKey: ["check-user-handle", handle],
    queryFn: async () => {
      const response = await axios.post(CHECK_USER_HANDLE, {
        userHandle: handle,
      });

      return response.data;
    },
    enabled: handle.length > 2, 
    retry: false,
  });
};