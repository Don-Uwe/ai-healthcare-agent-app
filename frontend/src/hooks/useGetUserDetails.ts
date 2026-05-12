import { useQuery, UseQueryResult } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { User } from "../type";
import { GET_USER_DETAILS_API } from "../helper/APIUtils";
import { useSelector } from "react-redux";

export const useGetUserDetails = (isConnected: boolean): UseQueryResult<
User,
AxiosError
>=>{
    const isGuest = useSelector((state: any) => state.user.isGuest);
   
    return useQuery({
    queryKey: ['get-user-details-by-id'],
    queryFn: async () => {
      const response = await axios.get(`${GET_USER_DETAILS_API}`);

      return response.data.profile as User;
    },
    enabled: !!isConnected && !isGuest,
  });
}