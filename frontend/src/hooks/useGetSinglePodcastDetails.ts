import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { PodcastData } from "../type";
import axios, { AxiosError } from "axios";
import { GET_PODCAST_DETAILS } from "../helper/APIUtils";

export const useGetSinglePodcastDetails = (trackId: string): UseQueryResult<
PodcastData | null,
AxiosError
>=>{
  return useQuery({
    queryKey: ['get-podcast-details', trackId],
    queryFn: async () => {
      try {
     
        const response = await axios.get(
          `${GET_PODCAST_DETAILS}?podcast_id=${trackId}`
        );
        return response.data as PodcastData;
      } catch (err) {
        console.error('Error fetching podcast:', err);
        return null;
      }
    },
  });  
}