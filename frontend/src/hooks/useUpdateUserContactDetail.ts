import {useMutation, UseMutationResult} from '@tanstack/react-query';
import axios, {AxiosError} from 'axios';
import {UPDATE_USER_CONTACT_DETAILS} from '../helper/APIUtils';

type UpdateReq = {
  phone: string;
  email: string;
};
export const useUpdateUserContactDetail = (): UseMutationResult<
  any,
  AxiosError,
  UpdateReq
> => {
  return useMutation({
    mutationKey: ['user-contact-details-updation'],
    mutationFn: async (req: UpdateReq) => {
      const response = await axios.put(`${UPDATE_USER_CONTACT_DETAILS}`, {
        phone: req.phone,
        email: req.email,
      });
      return response.data as any;
    },
  });
};
