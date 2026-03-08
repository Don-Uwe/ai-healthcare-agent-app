import axios, { AxiosError } from "axios";
import { UPDATE_USER_GENERAL_DETAILS } from "../helper/APIUtils";
import { useMutation, UseMutationResult } from "@tanstack/react-query";


type UpdateReq ={
    username: string;
    about: string;
}
export const useUpdateUserGeneralDetails = ():UseMutationResult<
any,
AxiosError,
UpdateReq
>=>{

    return useMutation({
    mutationKey: ['user-general-details-updation'],
    mutationFn: async (req: UpdateReq) => {
      const response = await axios.put(
        `${UPDATE_USER_GENERAL_DETAILS}`,
        {
          username: req.username,
          about: req.about,
        }
      );
      return response.data as any;
    },

  });
}