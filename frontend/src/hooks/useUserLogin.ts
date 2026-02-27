import {useMutation, UseMutationResult} from '@tanstack/react-query';
import axios, {AxiosError} from 'axios';
import {LOGIN_API} from '../helper/APIUtils';
import {User} from '../type';

type LoginReq = {
  email: string;
  password: string;
  fcmToken: string;
};

const loginFunc = async ({email, password, fcmToken}: LoginReq) => {
  const res = await axios.post(LOGIN_API, {
    email,
    password,
    fcmToken,
  });
  return res.data.user as User;
};

export const useLoginMutation = (): UseMutationResult<
  User,
  AxiosError<unknown>,
  LoginReq
> => {
  return useMutation({
    mutationKey: ['user_login'],
    mutationFn: loginFunc,
  });
};
