import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { PodcastData } from "../type";
import axios, { AxiosError } from "axios";
import { PENDING_PODCASTS } from "../helper/APIUtils";

type PendingRes = {
 totalPages: number;
 pendingPodcasts: PodcastData[];
};

export const useGetPendingPodcasts = (pendingPage: number, isConnected: boolean): UseQueryResult<
PendingRes | null,
AxiosError
>=>{
  
    return  useQuery({
      queryKey: ['get-pending-podcasts-for-user', pendingPage],
      queryFn: async () => {
        try {
          const response = await axios.get(
            `${PENDING_PODCASTS}?page=${pendingPage}`
          );

          return response.data as PendingRes;
        } catch (err) {
          console.error('Error fetching podcasts:', err);
          return null;
        }
      },
      enabled: !!pendingPage && !!isConnected
    });
}