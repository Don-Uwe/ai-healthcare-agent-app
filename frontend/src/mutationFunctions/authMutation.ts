// src/api/auth/authMutation.ts
import {useMutation} from '@tanstack/react-query';
import axios, {AxiosError} from 'axios';
import {Alert} from 'react-native';
import {
  CHANGE_PASSWORD_API,
  CHECK_OTP,
  LOGIN_API,
  RESEND_VERIFICATION,
  SEND_OTP,
  USER_LOGOUT,
} from '../helper/APIUtils';
import {KEYS, storeItem} from '../helper/Utils';

// Constants for the API endpoints (you should define them somewhere globally)

// Interfaces
interface AuthData {
  userId: string;
  token: string;
}

interface User {
  _id: string;
  refreshToken: string;
}

interface LoginMutationProps {
  email: string;
  password: string;
  // navigation: any;
  success: (userId: string, token: string) => void;
  error: () => void;
}

interface SendOtpMutationProps {
  email: string;
}

interface RequestVerificationProps {
  email: string;
  success: () => void;
}

interface UserLogoutMutationProps {
  user_token: string;
  success: () => void;
}

// Interfaces
interface ChangePasswordMutationProps {
  email: string;
  password: string;
  success: () => void;
}

interface SendOtpMutationProps {
  email: string;
  success: () => void;
}

interface VerifyOtpMutationProps {
  email: string;
  otp: string;
  success: () => void;
  error: () => void;
}

// Login Mutation
export const useLoginMutation = ({
  email,
  password,
  success,
}: LoginMutationProps) => {
  return useMutation({
    mutationKey: ['login'],
    mutationFn: async () => {
      const res = await axios.post(LOGIN_API, {
        email: email,
        password: password,
      });

      return res.data.user as User;
    },

    onSuccess: async data => {
      const auth: AuthData = {
        userId: data._id,
        token: data?.refreshToken,
      };
      try {
        await storeItem(KEYS.USER_ID, auth.userId.toString());
        if (auth.token) {
          await storeItem(KEYS.USER_TOKEN, auth.token.toString());
          await storeItem(
            KEYS.USER_TOKEN_EXPIRY_DATE,
            new Date().toISOString(),
          );
          //dispatch(setUserId(auth.userId));
          // dispatch(setUserToken(auth.token));
          // setTimeout(() => {
          // navigation.reset({
          //   index: 0,
          //  routes: [{name: 'TabNavigation'}], // Send user to LoginScreen after logout
          //  });
          //navigation.navigate('TabNavigation');
          // }, 1000);
          success(auth.userId, auth.token);
        } else {
          Alert.alert('Token not found');
        }
      } catch (e) {
        console.log('Async Storage ERROR', e);
      }
    },

    onError: (error: AxiosError) => {
      console.log('Error', error);
      if (error.response) {
        const errorCode = error.response.status;
        switch (errorCode) {
          case 400:
            Alert.alert('Error', 'Please provide email and password');
            break;
          case 401:
            Alert.alert('Error', 'Invalid password');
            break;
          case 403:
            Alert.alert(
              'Error',
              'Email not verified. Please check your email.',
            );
            break;
          case 404:
            Alert.alert('Error', 'User not found');
            break;
          default:
            Alert.alert('Error', 'Internal server error');
        }
      } else {
        Alert.alert('Error', 'User not found');
      }
    },
  });
};

// Send OTP Mutation (Forgot Password)
export const useSendOtpMutation = ({email, success}: SendOtpMutationProps) => {
  return useMutation({
    mutationKey: ['forgot-password-otp'],
    mutationFn: async () => {
      const res = await axios.post(SEND_OTP, {
        email: email,
      });
      return res.data.otp as string;
    },

    onSuccess: () => {
      Alert.alert('OTP has sent to your mail');
      //navigateToOtpScreen();
      success();
    },
    onError: error => {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          if (error.response.status === 400) {
            Alert.alert('Error', 'User with this email does not exist.');
          } else if (error.response.status === 500) {
            Alert.alert('Error', 'Error sending email.');
          } else {
            Alert.alert('Error', 'Something went wrong.');
          }
        } else {
          Alert.alert('Error', 'Network error.');
        }
      } else {
        Alert.alert('Error', 'Network error.');
      }
    },
  });
};

// Resend Verification Email
export const useRequestVerificationMutation = ({
  email,
  success,
}: RequestVerificationProps) => {
  return useMutation({
    mutationKey: ['resend-verification-mail'],
    mutationFn: async () => {
      const res = await axios.post(RESEND_VERIFICATION, {
        email: email,
      });

      return res.data.message as string;
    },

    onSuccess: () => {
      /** Check Status */
      //Alert.alert('Verification Email Sent');
      //setEmail('');
      //setPassword('');
      success();
    },
    onError: (error: AxiosError) => {
      console.log('Email Verification error', error);

      if (error.response) {
        const statusCode = error.response.status;
        switch (statusCode) {
          case 400:
            Alert.alert('Error', 'User not found or already verified');
            break;
          case 429:
            Alert.alert(
              'Error',
              'Verification email already sent. Please try again after 1 hour.',
            );
            break;
          case 500:
            Alert.alert(
              'Error',
              'Internal server error. Please try again later.',
            );
            break;
          default:
            Alert.alert(
              'Error',
              'Something went wrong. Please try again later.',
            );
        }
      } else {
        console.log('Email Verification error', error);
      }
    },
  });
};

// User Logout Mutation
export const useUserLogoutMutation = ({
  user_token,
  success,
}: UserLogoutMutationProps) => {
  return useMutation({
    mutationKey: ['user-logout'],
    mutationFn: async () => {
      const response = await axios.post(
        `${USER_LOGOUT}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );
      return response.data as any;
    },
    onSuccess: async () => {
      Alert.alert('Success', 'Logout successfully');
      //  await clearStorage();
      //dispatch(resetUserState());

      // navigation.reset({
      // index: 0,
      // routes: [{name: 'LoginScreen'}], // Send user to LoginScreen after logout
      //});
      success();
    },

    onError: (err: AxiosError) => {
      if (err.response) {
        const statusCode = err.response.status;
        switch (statusCode) {
          case 500:
            // Handle internal server errors
            Alert.alert(
              'Logout Failed',
              'Internal server error. Please try again later.',
            );
            break;
          default:
            // Handle any other errors
            Alert.alert(
              'Logout Failed',
              'Something went wrong. Please try again later.',
            );
        }
      } else {
        // Handle network errors
        console.log('General Update Error', err);
        Alert.alert(
          'Logout Failed',
          'Network error. Please check your connection.',
        );
      }
    },
  });
};

// Change Password Mutation
export const useChangePasswordMutation = ({
  email,
  password,
  success,
}: ChangePasswordMutationProps) => {
  return useMutation({
    mutationKey: ['generate-new-password'],
    mutationFn: async () => {
      const res = await axios.post(CHANGE_PASSWORD_API, {
        email: email,
        newPassword: password,
      });
      return res.data as any;
    },
    onSuccess: () => {
      Alert.alert('Password reset successfully');
      //navigation.navigate('LoginScreen');
      success();
    },

    onError: (error: AxiosError) => {
      if (error.response) {
        const statusCode = error.response.status;
        switch (statusCode) {
          case 400:
            Alert.alert('Error', 'User not found');
            break;
          case 402:
            Alert.alert(
              'Error',
              'New password should not be same as old password',
            );
            break;
          default:
            Alert.alert('Error', 'Something went wrong. Please try again.');
        }
      } else {
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
    },
  });
};

// Verify OTP Mutation
export const useVerifyOtpMutation = ({
  email,
  otp,
  success,
  error,
}: VerifyOtpMutationProps) => {
  return useMutation({
    mutationKey: ['verify-otp'],
    mutationFn: async () => {
      const res = await axios.post(CHECK_OTP, {
        email: email,
        otp: otp,
      });
      return res.data.message as string;
    },

    onSuccess: () => {
      //navigation.navigate('NewPasswordScreen', {
      //  email: email,
      // });
      success();
    },
    onError: (er: AxiosError) => {
      console.log('OTP ERROR', er);
      //setErrorMessages(['Invalid or expired otp']);
      //Alert.alert('Invalid or expired otp');
      error();
    },
  });
};
