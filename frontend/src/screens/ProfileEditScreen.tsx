import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../helper/Theme';
import GeneralTab, { GeneralFormData } from '../components/GeneralTab';
import ContactTab, { ContactFormData } from '../components/ContactTab';
import ProfessionalTab, { ProfFormData } from '../components/ProfessionalTab';
import PasswordTab, { PasswordFormData } from '../components/PasswordTab';
import LanguagePreferenceSelector from '../components/LanguagePreferenceSelector';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {useDispatch, useSelector} from 'react-redux';
import {AxiosError} from 'axios';
import {ProfileEditScreenProp} from '../type';
import {
  GET_STORAGE_DATA,
} from '../helper/APIUtils';
import {
  ImageLibraryOptions,
  launchImageLibrary,
  ImagePickerResponse,
} from 'react-native-image-picker';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import useUploadImage from '../hooks/useUploadImage';
import Snackbar from 'react-native-snackbar';
import {useGetUserDetails} from '../hooks/useGetUserDetails';
import {useUpdatePassword} from '../hooks/useUpdatePassword';
import {useUpdateProfileImage} from '../hooks/useUpdateProfileImage';
import {useUpdateUserContactDetail} from '../hooks/useUpdateUserContactDetail';
import {useUpdateUserGeneralDetails} from '../hooks/useUpdateUserGeneralDetails';
import {useUpdateUserProfDetails} from '../hooks/useUpdateUserProfDetails';
import LoadingSpinner from '../components/LoadingSpinner';
// eslint-disable-next-line @typescript-eslint/no-require-imports
// let validator = require('email-validator');
// let expr = /^(0|91)?[6-9][0-9]{9}$/;

const ProfileEditScreen = ({navigation}: ProfileEditScreenProp) => {
  const {uploadImage, loading} = useUploadImage();

  const dispatch = useDispatch();

  // Get safe area insets for handling notches and status bars on device
  const insets = useSafeAreaInsets();

  // Define the tabs available in the profile edit screen
  const tabs: string[] = ['General', 'Professional', 'Contact', 'Password', 'Language'];

  // State to keep track of the currently selected tab
  const [currentTab, setcurrentTab] = useState<string>(tabs[0]);

  const {mutate: updatePassword, isPending: passwordMutationPending} =
    useUpdatePassword();

  const {mutate: updateProfileImage, isPending: profileImagePending} =
    useUpdateProfileImage();

  const {mutate: updateContactDetails, isPending: contactDetailsPending} =
    useUpdateUserContactDetail();

  const {mutate: updateGeneralDetails, isPending: generalDetailsPending} =
    useUpdateUserGeneralDetails();
  const {
    mutate: updateProfessionalDetails,
    isPending: professionalDetailPending,
  } = useUpdateUserProfDetails();

  // Initialize state variables
  const [user_profile_image, setUserProfileImage] = useState('');
  const {user_token} = useSelector((state: any) => state.user);
  const {isConnected} = useSelector((state: any) => state.network);

  const {data: user} = useGetUserDetails(isConnected);



  useEffect(() => {
    if (user) {
      setUserProfileImage(
        user.Profile_image ?
        user.Profile_image.startsWith("http") ? user.Profile_image :
         `${GET_STORAGE_DATA}/${user.Profile_image}` : '',
      );
    }
  }, [user]);
  // Boolean to check if the user is a doctor
  const isDoctor = user ? user?.isDoctor! : false;
  // Function to handle tab selection
  const handleTab = (tab: string) => {
    setcurrentTab(tab);
  };
  const handleSubmitGeneralDetails = (data: GeneralFormData) => {
    if (!isConnected) {
      Snackbar.show({
        text: 'Please check your internet connection!',
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }

    updateGeneralDetails(
      {
        username: data.username,
        about: data.about,
        userHandle: data.userHandle,
        email: data.email,
      },
      {
        onSuccess: _data => {
          Alert.alert('Success', 'Details submitted successfully');
          //navigation.goBack();
        },

        onError: (err: AxiosError) => {
          if (err.response) {
            const statusCode = err.response.status;
            switch (statusCode) {
              case 400:
                // Handle bad request errors (missing fields or email/user handle already in use)
                Alert.alert(
                  'Update Failed',
                  (err?.response?.data as any)?.error ||
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
      },
    );
  };
  const handleSubmitContactDetails = (data: ContactFormData) => {
    if (!isConnected) {
      Snackbar.show({
        text: 'Please check your internet connection!',
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }

    updateContactDetails(
      {
        phone: data.phone_number,
        email: data.contact_email,
      },
      {
        onSuccess: _data => {
          Alert.alert('Success', 'Details submitted successfully');

         // navigation.goBack();
        },

        onError: (err: AxiosError) => {
          if (err.response) {
            const statusCode = err.response.status;
            switch (statusCode) {
              case 400:
                // Handle bad request errors (missing fields or email/user handle already in use)
                Alert.alert(
                  'Update Failed',
                  (err?.response?.data as any)?.error ||
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
      },
    );
  };
  const handleSubmitProfessionalDetails = (data: ProfFormData) => {
    if (!isConnected) {
      Snackbar.show({
        text: 'Please check your internet connection!',
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }

    updateProfessionalDetails(
      {
        specialization: data.specialization,
        qualification: data.qualification,
        experience: data.experience,
      },
      {
        onSuccess: _data => {
          Alert.alert('Success', 'Details submitted successfully');
        //  navigation.goBack();
        },

        onError: (err: AxiosError) => {
          if (err.response) {
            const statusCode = err.response.status;
            switch (statusCode) {
              case 400:
                // Handle bad request errors (missing fields or email/user handle already in use)
                Alert.alert(
                  'Update Failed',
                  (err?.response?.data as any)?.error ||
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
      },
    );
  };
  const handleSubmitPassword = (data: PasswordFormData) => {
    if (!isConnected) {
      Snackbar.show({
        text: 'Please check your internet connection!',
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }

    updatePassword(
      {
        old_password: data.old_password,
        new_password: data.new_password,
      },
      {
        onSuccess: _data => {
          Snackbar.show({
            text: 'Password updated sucessfully',
            duration: Snackbar.LENGTH_SHORT,
          });
        },

        onError: (err: AxiosError) => {
          if (err.response) {
            const statusCode = err.response.status;
            switch (statusCode) {
              case 400:
                Alert.alert(
                  'Password Update Failed',
                  (err?.response?.data as any)?.error,
                );
                break;
              case 401:
                Alert.alert(
                  'Password Update Failed',
                  'Old password is incorrect.',
                );
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
      },
    );
    //  userPasswordUpdateMutation.mutate();
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
                        if (isConnected) {
                          const result = await uploadImage(resizedImageUri.uri);

                          updateProfileImage(result as string, {
                            onSuccess: _data => {
                              Alert.alert(
                                'Success',
                                'Profile updated successfully',
                              );
                            },
                            onError: (err: AxiosError) => {
                              if (err.response) {
                                const statusCode = err.response.status;
                                const errorMessage = (err?.response?.data as any)?.error;

                                switch (statusCode) {
                                  case 400:
                                    // Handle validation errors (like invalid image format, file too large)
                                    if (
                                      errorMessage?.includes('File too large')
                                    ) {
                                      Alert.alert(
                                        'Update Failed',
                                        'The image file exceeds the size limit of 1 MB. Please select a smaller image.',
                                      );
                                    } else if (
                                      errorMessage?.includes(
                                        'Invalid image format',
                                      )
                                    ) {
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
                        } else {
                          Snackbar.show({
                            text: 'Please check your internet connection!',
                            duration: Snackbar.LENGTH_SHORT,
                          });
                          return;
                        }
                      } catch (err: any) {
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
    generalDetailsPending ||
    contactDetailsPending ||
    professionalDetailPending ||
    profileImagePending ||
    passwordMutationPending;
  return (
    <SafeAreaView style={styles.safeAreaView} edges={['top']}>
      <KeyboardAwareScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          {paddingBottom: Math.max(insets.bottom, 20) + 40},
        ]}
        bottomOffset={100}
        showsVerticalScrollIndicator={false}
        extraKeyboardSpace={40}
        keyboardShouldPersistTaps="handled">
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
              user={user}
              imgUrl={user_profile_image}
              handleSubmitGeneralDetails={handleSubmitGeneralDetails}
              selectImage={selectImage}
            />
          )}
          {currentTab === 'Professional' && (
            <ProfessionalTab
              user={user}
              handleSubmitProfessionalDetails={handleSubmitProfessionalDetails}
            />
          )}
          {currentTab === 'Contact' && (
            <ContactTab
              user={user}
              handleSubmitContactDetails={handleSubmitContactDetails}
            />
          )}
          {currentTab === 'Password' && (
            <PasswordTab
              handleSubmitPassword={handleSubmitPassword}
            />
          )}
          {currentTab === 'Language' && (
            <LanguagePreferenceSelector
              title="Preferred Languages"
              description="Choose the languages you want to see articles and podcasts in"
              showHeader={false}
            />
          )}
        </View>
      </KeyboardAwareScrollView>
      {Loading && (
        <View style={styles.overlay}>
          <LoadingSpinner size={50} />
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
    paddingBottom: 20,
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
