import { useMutation, UseMutationResult } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { VERIFICATION_MAIL_API } from "../helper/APIUtils";

type VerificationReq = {
    email: string;
    token: string
}
export const useVerificationMailMutation = (): UseMutationResult<
  string,
  AxiosError,
  VerificationReq
  
>=>{
   return useMutation({
    mutationKey: ['send-verification-mail'],
    mutationFn: async (req: VerificationReq) => {
      const res = await axios.post(VERIFICATION_MAIL_API, {
        email: req.email,
        token: req.token,
      });

      return res.data.message as string;
    },
  });
}