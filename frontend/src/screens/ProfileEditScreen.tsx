import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../helper/Theme';
import {hp} from '../helper/Metric';
import GeneralTab from '../components/GeneralTab';
import ContactTab from '../components/ContactTab';
import ProfessionalTab from '../components/ProfessionalTab';
import PasswordTab from '../components/PasswordTab';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {useMutation, useQuery} from '@tanstack/react-query';
import axios, {AxiosError} from 'axios';
import {
  GET_STORAGE_DATA,
  GET_USER_DETAILS_API,
  UPDATE_PROFILE_IMAGE,
  UPDATE_USER_CONTACT_DETAILS,
  UPDATE_USER_GENERAL_DETAILS,
  UPDATE_USER_PROFESSIONAL_DETAILS,
  UPDATE_USER_PASSWORD,
} from '../helper/APIUtils';
import {User} from '../type';
import Loader from '../components/Loader';
import {
  ImageLibraryOptions,
  launchImageLibrary,
  ImagePickerResponse,
} from 'react-native-image-picker';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import useUploadImage from '../../hooks/useUploadImage';
var validator = require('email-validator');
var expr = /^(0|91)?[6-9][0-9]{9}$/;
const ProfileEditScreen = ({navigation}) => {
  const {uploadImage, loading} = useUploadImage();

  // Get safe area insets for handling notches and status bars on device
  const insets = useSafeAreaInsets();

  // Define the tabs available in the profile edit screen
  const tabs: string[] = ['General', 'Professional', 'Contact', 'Password'];

  // State to keep track of the currently selected tab
  const [currentTab, setcurrentTab] = useState<string>(tabs[0]);

  // Initialize state variables
  const [user_profile_image, setUserProfileImage] = useState('');
  const [username, setUsername] = useState('');
  const [userHandle, setUserHandle] = useState('');
  const [email, setEmail] = useState('');
  const [about, setAbout] = useState('');
  const [contact_email, setContactEmail] = useState('');
  const [contact_number, setContactNumber] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [qualification, setQualification] = useState('');
  const [experience, setExperience] = useState('');
  const [old_password, setOldPassword] = useState('');
  const [new_password, setNewPassword] = useState('');
  const [confirm_password, setConfirmPassword] = useState('');
  const {user_token} = useSelector((state: any) => state.user);
  const {data: user, isLoading} = useQuery({
    queryKey: ['get-user-details-by-id'],
    queryFn: async () => {
      const response = await axios.get(`${GET_USER_DETAILS_API}`, {
        headers: {
          Authorization: `Bearer ${user_token}`,
        },
      });

      return response.data.profile as User;
    },
  });
  const userGeneralDetailsMutation = useMutation({
    mutationKey: ['user-general-details-updation'],
    mutationFn: async () => {
      const response = await axios.put(
        `${UPDATE_USER_GENERAL_DETAILS}`,
        {
          username: username,
          userHandle: userHandle,
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
      Alert.alert('Success', 'Details submitted successfully');
      navigation.goBack();
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
  const userConatctDetailsMutation = useMutation({
    mutationKey: ['user-contact-details-updation'],
    mutationFn: async () => {
      const response = await axios.put(
        `${UPDATE_USER_CONTACT_DETAILS}`,
        {
          phone: contact_number,
          email: contact_email,
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
      Alert.alert('Success', 'Details submitted successfully');
      navigation.goBack();
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
  const userProfessionalDetailsMutation = useMutation({
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
      Alert.alert('Success', 'Details submitted successfully');
      navigation.goBack();
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
  const userProfileImageMutation = useMutation({
    mutationKey: ['user-profile-image-updation'],
    mutationFn: async (profileImageUrl: string) => {
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
  const userPasswordUpdateMutation = useMutation({
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
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
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
  useEffect(() => {
    if (user) {
      //console.log(user);
      setUserProfileImage(
        user.Profile_image ? `${GET_STORAGE_DATA}/${user.Profile_image}` : '',
      );
      setUsername(user.user_name || '');
      setUserHandle(user.user_handle || '');
      setEmail(user.email || '');
      setAbout(user.about || '');
      setContactEmail(user.contact_detail?.email_id || '');
      setContactNumber(user.contact_detail?.phone_no || '');
      setSpecialization(user.specialization || '');
      setQualification(user.qualification || '');
      setExperience(user.Years_of_experience || '');
    }
  }, [user]); // Runs when the `user` data changes

  // showing loading state when fetching data
  if (isLoading) {
    return <Loader />;
  }
  // Boolean to check if the user is a doctor
  const isDoctor = user ? user?.isDoctor! : false;
  // Function to handle tab selection
  const handleTab = (tab: string) => {
    setcurrentTab(tab);
  };
  const validateGeneralFields = () => {
    if (!username) {
      return 'Username is required';
    }
    if (!userHandle) {
      return 'User Handle is required';
    }
    if (!email) {
      return 'Email is required';
    } else if (!validator.validate(email)) {
      return 'Email is not valid';
    }
    if (!about) {
      return 'About is required';
    }
    return null; // No errors
  };
  const validateContactFields = () => {
    if (!contact_number) {
      return 'contact number is required';
    } else if (!expr.test(contact_number)) {
      return 'Phone number is not valid';
    }
    if (!contact_email) {
      return 'Email is required';
    } else if (!validator.validate(email)) {
      return 'Email is not valid';
    }
    return null; // No errors
  };
  const validateProfessionalFields = () => {
    if (!specialization) {
      return 'Specialization is required';
    }
    if (!qualification) {
      return 'Qualification is required';
    }
    if (!experience) {
      return 'Experience is required';
    }
    return null; // No errors
  };
  const handleSubmitGeneralDetails = () => {
    const errorMessage = validateGeneralFields();
    if (errorMessage) {
      Alert.alert('Validation Error', errorMessage);
      return;
    }
    userGeneralDetailsMutation.mutate();
  };
  const handleSubmitContactDetails = () => {
    const errorMessage = validateContactFields();
    if (errorMessage) {
      Alert.alert('Validation Error', errorMessage);
      return;
    }
    //console.log('donee');
    userConatctDetailsMutation.mutate();
  };
  const handleSubmitProfessionalDetails = () => {
    const errorMessage = validateProfessionalFields();
    if (errorMessage) {
      Alert.alert('Validation Error', errorMessage);
      return;
    }
    //console.log('donee');
    userProfessionalDetailsMutation.mutate();
  };
  const handleSubmitPassword = () => {
    if (old_password === '') {
      Alert.alert('Error', 'Please enter your current password.');
      return;
    }

    if (new_password === '') {
      Alert.alert('Error', 'Please enter a new password.');
      return;
    }

    if (confirm_password === '') {
      Alert.alert('Error', 'Please confirm your new password.');
      return;
    }

    if (old_password === new_password) {
      Alert.alert(
        'Error',
        'The new password must be different from the current password.',
      );
      return;
    }

    if (new_password.length < 6) {
      Alert.alert(
        'Error',
        'The new password must be at least 6 characters long.',
      );
      return;
    }

    if (new_password !== confirm_password) {
      Alert.alert('Error', 'The new password and confirmation do not match.');
      return;
    }
    userPasswordUpdateMutation.mutate();
  };
  const selectImage = async () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
    };

    launchImageLibrary(options, async (response: ImagePickerResponse) => {
      if (response.didCancel) {
        //console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets) {
        const {uri, fileSize} = response.assets[0];

        // Check file size (1 MB limit)
        if (fileSize && fileSize > 1024 * 1024) {
          Alert.alert('Error', 'File size exceeds 1 MB.');
          return;
        }

        if (uri) {
          ImageResizer.createResizedImage(uri, 1000, 1000, 'JPEG', 100)
            .then(async resizedImageUri => {
              setUserProfileImage(resizedImageUri.uri);
              Alert.alert(
                '',
                'Are you sure you want to use this image?',
                [
                  {
                    text: 'Cancel',
                    onPress: () => {
                      setUserProfileImage(user?.Profile_image || '');
                    },
                    style: 'cancel',
                  },
                  {
                    text: 'OK',
                    onPress: async () => {
                      try {
                        //console.log("Image uri", resizedImageUri.uri);
                        // Upload the resized image
                        const result = await uploadImage(resizedImageUri.uri);
                        // console.log('Image uploaded:', result);
                        // After uploading, update the profile image with the returned URL
                        userProfileImageMutation.mutate(result);
                      } catch (err) {
                        console.error('Upload failed');
                        Alert.alert('Error', 'Upload failed');
                      }
                    },
                  },
                ],
                {cancelable: false},
              );
            })
            .catch(err => {
              //console.log(err);
              Alert.alert('Error', 'Could not resize the image.');
            });
        }
      }
    });
  };

  const Loading =
    loading ||
    userGeneralDetailsMutation.isPending ||
    userConatctDetailsMutation.isPending ||
    userProfessionalDetailsMutation.isPending ||
    userProfileImageMutation.isPending ||
    userPasswordUpdateMutation.isPending;
  return (
    <SafeAreaView style={styles.safeAreaView}>
      <ScrollView
        style={styles.container}
        contentInsetAdjustmentBehavior="always"
        contentContainerStyle={[
          styles.contentContainer,
          {paddingBottom: insets.bottom},
        ]}>
        {/* Horizontal scroll view for the tabs */}
        <ScrollView
          horizontal={true}
          style={styles.horizontalScroll}
          contentContainerStyle={styles.horizontalScrollContent}
          showsHorizontalScrollIndicator={false}>
          {tabs.map((tab: string) => {
            if (isDoctor || tab !== 'Professional') {
              return (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.tabButton,
                    currentTab === tab && styles.activeTabButton,
                  ]}
                  onPress={() => {
                    handleTab(tab);
                  }}>
                  <Text
                    style={[
                      styles.tabText,
                      currentTab === tab && styles.activeTabText,
                    ]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            }
          })}
        </ScrollView>

        {/* Content of the selected tab */}
        <View style={styles.tabContent}>
          {currentTab === 'General' && (
            <GeneralTab
              username={username}
              setUsername={setUsername}
              userhandle={userHandle}
              setUserHandle={setUserHandle}
              email={email}
              setEmail={setEmail}
              about={about}
              setAbout={setAbout}
              imgUrl={user_profile_image}
              handleSubmitGeneralDetails={handleSubmitGeneralDetails}
              selectImage={selectImage}
            />
          )}
          {currentTab === 'Professional' && (
            <ProfessionalTab
              specialization={specialization}
              qualification={qualification}
              years_of_experience={experience}
              setSpecialization={setSpecialization}
              setQualification={setQualification}
              setExperience={setExperience}
              handleSubmitProfessionalDetails={handleSubmitProfessionalDetails}
            />
          )}
          {currentTab === 'Contact' && (
            <ContactTab
              phone_number={contact_number}
              contact_email={contact_email}
              setContactEmail={setContactEmail}
              setContactNumber={setContactNumber}
              handleSubmitContactDetails={handleSubmitContactDetails}
            />
          )}
          {currentTab === 'Password' && (
            <PasswordTab
              handleSubmitPassword={handleSubmitPassword}
              old_password={old_password}
              new_password={new_password}
              confirm_password={confirm_password}
              setConfirmPassword={setConfirmPassword}
              setNewPassword={setNewPassword}
              setOldPassword={setOldPassword}
            />
          )}
        </View>
      </ScrollView>
      {Loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size={50} color={PRIMARY_COLOR} />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: ON_PRIMARY_COLOR,
  },
  container: {
    flex: 1,
    backgroundColor: ON_PRIMARY_COLOR,
    paddingHorizontal: 16,
  },
  contentContainer: {
    paddingBottom: 0, // Will be adjusted dynamically based on insets
  },
  horizontalScroll: {
    marginTop: 10,
  },
  horizontalScrollContent: {
    columnGap: 2, // Space between tabs
  },
  tabButton: {
    paddingHorizontal: 18,
    borderRadius: 100,
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  activeTabButton: {
    backgroundColor: PRIMARY_COLOR, // Highlight the active tab
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500', // Font weight '500' for normal tabs
    color: '#B1B2B2',
  },
  activeTabText: {
    fontWeight: 'bold', // Bold font for active tab text
    color: 'white',
  },
  tabContent: {
    marginTop: 25,
    minHeight: Dimensions.get('window').height - hp(25), // Ensure content takes full screen height
  },
  overlay: {
    flex: 1,
    //backgroundColor: 'rgba(0,0,0,0.4)',
    backgroundColor: ON_PRIMARY_COLOR,
    position: 'absolute',
    height: '100%',
    width: '100%',
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProfileEditScreen;
