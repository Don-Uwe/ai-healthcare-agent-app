import { useQuery, UseQueryResult } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { GET_ALL_PODCASTS } from "../helper/APIUtils";
import { PodcastData } from "../type";

type PodcastResponse = {
    totalPages: number;
    allPodcasts: PodcastData[];
}
export const useGetAllPodcasts = (isConnected: boolean, page: number): UseQueryResult<
PodcastResponse | null,
AxiosError
>=>{
    return useQuery({
    queryKey: ['get-all-podcasts', page],
    queryFn: async () => {
      try {
        const response = await axios.get(`${GET_ALL_PODCASTS}?page=${page}`);
        return response.data as PodcastResponse
      } catch (err) {
        console.error('Error fetching podcasts:', err);
        return null;
      }
    },
    enabled: isConnected  && !!page,
  });
}