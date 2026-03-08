import axios, { AxiosError } from "axios";
import { GET_PROFILE_IMAGE_BY_ID } from "../helper/APIUtils";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

export const useGetUserProfileImage = (authorId: string): UseQueryResult<
 string,
 AxiosError
>=>{

    return useQuery({
    queryKey: ['author_profile_image', authorId],
    queryFn: async () => {
      const response = await axios.get(
        `${GET_PROFILE_IMAGE_BY_ID}/${authorId}`);
      return response.data.profile_image as string;
    },
  });
}