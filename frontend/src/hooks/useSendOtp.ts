import { useMutation, UseMutationResult } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { SEND_OTP } from "../helper/APIUtils";

export const useSendOtpMutation = ():UseMutationResult<
  void,
  AxiosError,
  {email: string}
> =>{
    return useMutation({
    mutationKey: ['forgot-password-otp'],
    mutationFn: async ({email}: {email: string}) => {
      const res = await axios.post(SEND_OTP, {
        email: email,
      });
      void res;
    },
  });
};