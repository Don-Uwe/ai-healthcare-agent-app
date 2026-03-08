import {useMutation, UseMutationResult} from '@tanstack/react-query';
import axios, {AxiosError} from 'axios';
import {CHECK_OTP} from '../helper/APIUtils';

type VerifyReq = {
  email: string;
  otp: string;
};
export const useVerifyOtpMutation = (): UseMutationResult<
  string,
  AxiosError,
  VerifyReq
> => {
  return useMutation({
    mutationKey: ['verify-otp'],
    mutationFn: async (req: VerifyReq) => {
      const res = await axios.post(CHECK_OTP, {
        email: req.email,
        otp: req.otp,
      });
      return res.data.message as string;
    },
  });
};
