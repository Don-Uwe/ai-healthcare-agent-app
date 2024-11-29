import {useMutation} from '@tanstack/react-query';
import axios, {AxiosError} from 'axios';
import {Alert} from 'react-native';
import {
    FOLLOW_USER,
  UPDATE_PROFILE_IMAGE,
  UPDATE_USER_CONTACT_DETAILS,
  UPDATE_USER_GENERAL_DETAILS,
  UPDATE_USER_PASSWORD,
  UPDATE_USER_PROFESSIONAL_DETAILS,
} from '../helper/APIUtils';

export const useUpdateUserGeneralDetails = ({
  username,
  userhandle,
  email,
  about,
  user_token,
  success,
}: {
  username: string;
  userhandle: string;
  email: string;
  about: string;
  user_token: string;
  success: () => void;
}) => {
  return useMutation({
    mutationKey: ['user-general-details-updation'],
    mutationFn: async () => {
      const response = await axios.put(
        `${UPDATE_USER_GENERAL_DETAILS}`,
        {
          username: username,
          userHandle: userhandle,
          email: email,
          about: about,
        },
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );
      return response.data as any;
    },
    onSuccess: _data => {
      //Alert.alert('Success', 'Details submitted successfully');
      // navigation.goBack();
      success();
    },

    onError: (err: AxiosError) => {
      if (err.response) {
        const statusCode = err.response.status;
        switch (statusCode) {
          case 400:
            // Handle bad request errors (missing fields or email/user handle already in use)
            Alert.alert(
              'Update Failed',
              err?.response?.data?.error ||
                'Please fill in all fields correctly.',
            );
            break;
          case 404:
            // Handle user not found
            Alert.alert(
              'Update Failed',
              'User not found. Please check your information.',
            );
            break;
          case 409:
            // Handle conflict errors (duplicate email/user handle)
            Alert.alert(
              'Update Failed',
              'Email or user handle already exists.',
            );
            break;
          case 500:
            // Handle internal server errors
            Alert.alert(
              'Update Failed',
              'Internal server error. Please try again later.',
            );
            break;
          default:
            // Handle any other errors
            Alert.alert(
              'Update Failed',
              'Something went wrong. Please try again later.',
            );
        }
      } else {
        // Handle network errors
        console.log('General Update Error', err);
        Alert.alert(
          'Update Failed',
          'Network error. Please check your connection.',
        );
      }
    },
  });
};

export const useUpdateUserContactDetails = ({
  phone,
  email,
  user_token,
  success,
}: {
  phone: string;
  email: string;
  user_token: string;
  success: () => void;
}) => {
  return useMutation({
    mutationKey: ['user-contact-details-updation'],
    mutationFn: async () => {
      const response = await axios.put(
        `${UPDATE_USER_CONTACT_DETAILS}`,
        {
          phone: phone,
          email: email,
        },
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );
      return response.data as any;
    },
    onSuccess: _data => {
      // Alert.alert('Success', 'Details submitted successfully');
      //navigation.goBack();
      success();
    },

    onError: (err: AxiosError) => {
      if (err.response) {
        const statusCode = err.response.status;
        switch (statusCode) {
          case 400:
            // Handle bad request errors (missing fields or email/user handle already in use)
            Alert.alert(
              'Update Failed',
              err?.response?.data?.error ||
                'Please fill in all fields correctly.',
            );
            break;
          case 404:
            // Handle user not found
            Alert.alert(
              'Update Failed',
              'User not found. Please check your information.',
            );
            break;
          case 409:
            // Handle conflict errors (duplicate email/user handle)
            Alert.alert(
              'Update Failed',
              'Email or user handle already exists.',
            );
            break;
          case 500:
            // Handle internal server errors
            Alert.alert(
              'Update Failed',
              'Internal server error. Please try again later.',
            );
            break;
          default:
            // Handle any other errors
            Alert.alert(
              'Update Failed',
              'Something went wrong. Please try again later.',
            );
        }
      } else {
        // Handle network errors
        console.log('General Update Error', err);
        Alert.alert(
          'Update Failed',
          'Network error. Please check your connection.',
        );
      }
    },
  });
};

export const useUpdateUserProfessionalDetails = ({
  specialization,
  qualification,
  experience,
  user_token,
  success,
}: {
  specialization: string;
  qualification: string;
  experience: string;
  user_token: string;
  success: () => void;
}) => {
  return useMutation({
    mutationKey: ['user-professional-details-updation'],
    mutationFn: async () => {
      const response = await axios.put(
        `${UPDATE_USER_PROFESSIONAL_DETAILS}`,
        {
          specialization: specialization,
          qualification: qualification,
          experience: experience,
        },
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );
      return response.data as any;
    },
    onSuccess: _data => {
      // Alert.alert('Success', 'Details submitted successfully');
      // navigation.goBack();
      success();
    },

    onError: (err: AxiosError) => {
      if (err.response) {
        const statusCode = err.response.status;
        switch (statusCode) {
          case 400:
            // Handle bad request errors (missing fields or email/user handle already in use)
            Alert.alert(
              'Update Failed',
              err?.response?.data?.error ||
                'Please fill in all fields correctly.',
            );
            break;
          case 404:
            // Handle user not found
            Alert.alert(
              'Update Failed',
              'User not found. Please check your information.',
            );
            break;
          case 500:
            // Handle internal server errors
            Alert.alert(
              'Update Failed',
              'Internal server error. Please try again later.',
            );
            break;
          default:
            // Handle any other errors
            Alert.alert(
              'Update Failed',
              'Something went wrong. Please try again later.',
            );
        }
      } else {
        // Handle network errors
        console.log('General Update Error', err);
        Alert.alert(
          'Update Failed',
          'Network error. Please check your connection.',
        );
      }
    },
  });
};

export const useUpdateUserProfileImage = ({
  profileImageUrl,
  user_token,
}: {
  profileImageUrl: string;
  user_token: string;
}) => {
  useMutation({
    mutationKey: ['user-profile-image-updation'],
    mutationFn: async () => {
      const response = await axios.post(
        `${UPDATE_PROFILE_IMAGE}`,
        {
          profileImageUrl, // Use the uploaded image URL here
        },
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );
      return response.data as any;
    },
    onSuccess: _data => {
      Alert.alert('Success', 'Profile updated successfully');
    },
    onError: (err: AxiosError) => {
      if (err.response) {
        const statusCode = err.response.status;
        const errorMessage = err?.response?.data?.error;

        switch (statusCode) {
          case 400:
            // Handle validation errors (like invalid image format, file too large)
            if (errorMessage?.includes('File too large')) {
              Alert.alert(
                'Update Failed',
                'The image file exceeds the size limit of 1 MB. Please select a smaller image.',
              );
            } else if (errorMessage?.includes('Invalid image format')) {
              Alert.alert(
                'Update Failed',
                'The image format is invalid. Please upload a valid image (JPEG, PNG, etc.).',
              );
            } else {
              Alert.alert(
                'Update Failed',
                errorMessage ||
                  'Please ensure the image is valid and all fields are filled correctly.',
              );
            }
            break;

          case 401:
            // Handle unauthorized access (e.g., expired token)
            Alert.alert(
              'Update Failed',
              'You are not authorized to update the profile image. Please log in again.',
            );
            break;

          case 404:
            // Handle user not found errors
            Alert.alert(
              'Update Failed',
              'User not found. Please ensure your account information is correct.',
            );
            break;

          case 413:
            // Handle payload too large errors (typically for image uploads)
            Alert.alert(
              'Update Failed',
              'The uploaded image is too large. Please select an image under 1 MB.',
            );
            break;

          case 500:
            // Handle server-side errors
            Alert.alert(
              'Update Failed',
              'An internal server error occurred. Please try again later.',
            );
            break;

          default:
            // Handle unexpected errors
            Alert.alert(
              'Update Failed',
              'An unexpected error occurred. Please try again later.',
            );
        }
      } else {
        // Handle network errors or other Axios-related issues
        if (err.message === 'Network Error') {
          Alert.alert(
            'Update Failed',
            'A network error occurred. Please check your internet connection and try again.',
          );
        } else {
          console.log('General Update Error:', err);
          Alert.alert(
            'Update Failed',
            'Something went wrong. Please try again.',
          );
        }
      }
    },
  });
};

export const usePasswordUpdateMutation = ({
  old_password,
  new_password,
  user_token,
  success,
}: {
  old_password: string;
  new_password: string;
  user_token: string;
  success: () => void;
}) => {
  return useMutation({
    mutationKey: ['user-password-updation'],
    mutationFn: async () => {
      const response = await axios.put(
        `${UPDATE_USER_PASSWORD}`,
        {
          old_password: old_password,
          new_password: new_password,
        },
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );
      return response.data as any;
    },
    onSuccess: _data => {
      Alert.alert('Success', 'Password updated sucessfully');
      //setOldPassword('');
      //setNewPassword('');
      //setConfirmPassword('');
      success();
    },

    onError: (err: AxiosError) => {
      if (err.response) {
        const statusCode = err.response.status;
        switch (statusCode) {
          case 400:
            Alert.alert('Password Update Failed', err?.response?.data?.error);
            break;
          case 401:
            Alert.alert('Password Update Failed', 'Old password is incorrect.');
            break;
          case 404:
            Alert.alert('Password Update Failed', 'User not found.');
            break;
          case 500:
            Alert.alert(
              'Password Update Failed',
              'Internal server error. Please try again later.',
            );
            break;
          default:
            Alert.alert(
              'Password Update Failed',
              'Something went wrong. Please try again later.',
            );
        }
      } else {
        // console.log('Password Update Error', err);
        Alert.alert(
          'Password Update Failed',
          'Network error. Please check your connection.',
        );
      }
    },
  });
};

export const useUpdateUserFollowerStatus = ({
  user_token,
  authorId,
  success,
}: {
  user_token: string;
  authorId: string;
  success: () => void;
}) => {
  return useMutation({
    mutationKey: ['update-follow-status'],

    mutationFn: async () => {
      if (!user_token || user_token === '') {
        Alert.alert('No token found');
        return;
      }
      const res = await axios.post(
        FOLLOW_USER,
        {
          followUserId: authorId,
          //user_id: user_id,
        },
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );
      return res.data as any;
    },

    onSuccess: () => {
      //console.log('follow success');
      //refetchFollowers();
      // refetchProfile();
      success();
    },

    onError: err => {
      console.log('Update Follow mutation error', err);
      Alert.alert('Try Again!');
      //console.log('Follow Error', err);
    },
  });
};


