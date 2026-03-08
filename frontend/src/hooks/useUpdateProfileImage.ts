import { useMutation, UseMutationResult } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { UPDATE_PROFILE_IMAGE } from "../helper/APIUtils";


export const useUpdateProfileImage = (): UseMutationResult<
 any,
 AxiosError,
 string
>=>{
    return useMutation({
    mutationKey: ['user-profile-image-updation'],
    mutationFn: async (profileImageUrl: string) => {
      const response = await axios.post(
        `${UPDATE_PROFILE_IMAGE}`,
        {
          profileImageUrl,
        }
      );
      return response.data as any;
    },
  
  });
}