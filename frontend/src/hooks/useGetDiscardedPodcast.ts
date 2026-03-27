import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { PodcastData } from "../type";
import axios, { AxiosError } from "axios";
import { DISCARDED_PODCASTS } from "../helper/APIUtils";

type DiscardResponse = {
    totalPages: number;
    discardedPodcasts: PodcastData[];
}

export const useGetDiscardedPodcasts = (discardedPage: number, isConnected: boolean): UseQueryResult<
DiscardResponse | null,
AxiosError
>=>{

    return useQuery({
    queryKey: ['get-discarded-podcasts-for-user', discardedPage],
    queryFn: async () => {
      try {
        const res = await axios.get(`${DISCARDED_PODCASTS}?page=${discardedPage}`);
        return res.data as DiscardResponse;
      } catch (err) {
        console.error('Error fetching podcasts:', err);
        return null;
      }
    },
    enabled: !!discardedPage && !!isConnected,
  });
}