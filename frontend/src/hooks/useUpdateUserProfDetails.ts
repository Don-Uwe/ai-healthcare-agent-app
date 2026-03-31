import axios, { AxiosError } from "axios";
import { UPDATE_USER_PROFESSIONAL_DETAILS } from "../helper/APIUtils";
import { useMutation, UseMutationResult } from "@tanstack/react-query";


type UpdateReq ={
    specialization: string;
    qualification: string;
    experience: string;
}
export const useUpdateUserProfDetails = ():UseMutationResult<
any,
AxiosError,
UpdateReq
>=>{

    return useMutation({
    mutationKey: ['user-professional-details-updation'],
    mutationFn: async (req: UpdateReq) => {
      const response = await axios.put(
        `${UPDATE_USER_PROFESSIONAL_DETAILS}`,
        {
          specialization: req.specialization,
          qualification: req.qualification,
          experience: req.experience,
        }
      );
      return response.data as any;
    },
  });
}