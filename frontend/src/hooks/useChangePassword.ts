import {useMutation, UseMutationResult} from '@tanstack/react-query';
import axios, {AxiosError} from 'axios';
import {CHANGE_PASSWORD_API} from '../helper/APIUtils';

type ChangePassWordReq = {
  email: string;
  newPassword: string;
};
export const useChangePasswordMutation = (): UseMutationResult<
  any,
  AxiosError,
  ChangePassWordReq
> => {
  return useMutation({
    mutationKey: ['generate-new-password'],
    mutationFn: async (req: ChangePassWordReq) => {
      const res = await axios.post(CHANGE_PASSWORD_API, {
        email: req.email,
        newPassword: req.newPassword,
      });
      return res.data as any;
    },
  });
};
