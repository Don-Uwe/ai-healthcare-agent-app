import axios, { AxiosError } from "axios"
import { PodcastData } from "../type"
import { useQuery, UseQueryResult } from "@tanstack/react-query"
import { SEARCH_PODCAST } from "../helper/APIUtils"


type SearchResponse = {
    totalPages: number,
    matchPodcasts: PodcastData[]
}
export const useGetSearchPodcasts = (isConnected: boolean, page: number, q: string): UseQueryResult<
SearchResponse,
AxiosError
>=>{
  return useQuery({
    queryKey: ['serach-podcasts', page],
    queryFn: async () => {
      const res = await axios.get(`${SEARCH_PODCAST}?q=${q}&page=${page}`);

      return res.data as SearchResponse;
    },
    enabled: isConnected && !!q && !!page,
  });
}