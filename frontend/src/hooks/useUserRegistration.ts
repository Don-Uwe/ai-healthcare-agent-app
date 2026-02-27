import {useMutation, UseMutationResult} from '@tanstack/react-query';
import axios, {AxiosError} from 'axios';
import {REGISTRATION_API} from '../helper/APIUtils';
import {Contactdetail} from '../type';

type RegdReq = {
  user_name: string;
  user_handle: string;
  email: string;
  password: string;
  isDoctor: boolean;
  Profile_image: string | null;
  specialization?: string | null;
  qualification?: string | null;
  Years_of_experience?: string | null;

  contact_detail?: Contactdetail;
};

const regdFunc = async (request: RegdReq) => {
  const res = await axios.post(REGISTRATION_API, request);
  return res.data.token as string;
};

export const useRegdMutation = (): UseMutationResult<
  string,
  AxiosError<unknown>,
  RegdReq
> => {
  return useMutation({
    mutationKey: ['user_registration'],
    mutationFn: regdFunc,
  });
};
