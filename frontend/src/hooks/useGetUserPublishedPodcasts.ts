import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { PodcastData } from "../type";
import axios, { AxiosError } from "axios";
import { USER_PUBLISHED_PODCASTS } from "../helper/APIUtils";


type PublishRes = {
    totalPages: number;
    publishedPodcasts: PodcastData[];
}
export const useGetUserPublishedPodcasts = (publishedPage: number, isConnected: number): UseQueryResult<
PublishRes | null,
AxiosError
>=>{

    return useQuery({
    queryKey: ['get-published-podcasts-for-user', publishedPage],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `${USER_PUBLISHED_PODCASTS}?page=${publishedPage}`
        );

        return response.data as PublishRes;
      } catch (err) {
        console.error('Error fetching podcasts:', err);
        return null;
      }
    },
    enabled:  !!publishedPage && !!isConnected,
  });
}