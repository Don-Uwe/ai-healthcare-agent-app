import {useMutation, UseMutationResult} from '@tanstack/react-query';
import axios, {AxiosError} from 'axios';
import {RESEND_VERIFICATION} from '../helper/APIUtils';

export const useRequestVerification = (): UseMutationResult<
  string,
  AxiosError,
  {email: string}
> => {
  return useMutation({
    mutationKey: ['resend-verification-mail'],
    mutationFn: async ({email}: {email: string}) => {
      const res = await axios.post(RESEND_VERIFICATION, {
        email: email,
      });

      return res.data.message as string;
    },
  });
};
