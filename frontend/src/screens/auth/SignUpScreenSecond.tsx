import React, {useState} from 'react';
import {Alert} from 'react-native';

import {ScrollView, YStack, XStack, Text, Input, Button, Image} from 'tamagui';
import Icon from '@expo/vector-icons/MaterialIcons';
import {Contactdetail, SignUpScreenSecondProp} from '../../type';
import {AxiosError} from 'axios';
import EmailVerifiedModal from '../../components/VerifiedModal';
import Loader from '../../components/Loader';
import Snackbar from 'react-native-snackbar';
import useUploadImage from '../../hooks/useUploadImage';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useVerificationMailMutation} from '@/src/hooks/useMailVerification';
import {useRegdMutation} from '@/src/hooks/useUserRegistration';
let validator = require('email-validator');

const SignupPageSecond = ({navigation, route}: SignUpScreenSecondProp) => {
  const {user} = route.params;
  const {uploadImage, loading} = useUploadImage();
  const [specialization, setSpecialization] = useState('');
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [token, setToken] = useState('');
  const [verifyBtntext, setVerifyBtntxt] = useState('Request Verification');
  const [verifiedModalVisible, setVerifiedModalVisible] = useState(false);
  const {mutate: verifyEmailMutation, isPending: verifyMutationPending} =
    useVerificationMailMutation();
  const {mutate: register, isPending: registerPending} = useRegdMutation();

  const callRegisterAPI = (
    profile_url: string,
    contactDetail: Contactdetail,
  ) => {
    register(
      {
        user_name: user.user_name,
        user_handle: user.user_handle,
        email: user.email,
        password: user.password,
        isDoctor: true,
        specialization: specialization,
        qualification: education,
        Years_of_experience: experience,
        Profile_image: profile_url,
        contact_detail: contactDetail,
      },
      {
        onSuccess: data => {
          setToken(data);
          setVerifiedModalVisible(true);
        },

        onError: (err: AxiosError) => {
          if (err.response) {
            const statusCode = err.response.status;
            switch (statusCode) {
              case 400:
                const errorData = err.message;
                console.log('Error message', errorData);
                Alert.alert('Registration failed', 'Please try again');
                break;
              case 409: {
                Alert.alert(
                  'Registration failed',
                  'Email or user handle already exists',
                );
                break;
              }

              case 500: {
                Alert.alert(
                  'Registration failed',
                  'Internal server error. Please try again later.',
                );
                break;
              }

              default: {
                Alert.alert(
                  'Registration failed',
                  'Something went wrong. Please try again later.',
                );
              }
            }
          } else {
            console.log('General User Registration Error', err);
            Alert.alert('Registration failed', 'Please try again');
          }
        },
      },
    );
  };

  const handleVerifyModalCallback = () => {
    if (token.length > 0) {
      verifyEmailMutation(
        {
          email: user.email,
          token,
        },
        {
          onSuccess: data => {
            setVerifyBtntxt(data);
            Snackbar.show({
              text: 'Verification email sent!',
              duration: Snackbar.LENGTH_LONG,
            });
            navigation.navigate('LoginScreen');
          },

          onError: (error: AxiosError) => {
            if (error.response) {
              const statusCode = error.response.status;
              switch (statusCode) {
                case 400:
                  Snackbar.show({
                    text: error.message,
                    duration: Snackbar.LENGTH_SHORT,
                  });
                  break;
                case 429:
                  Snackbar.show({
                    text: 'Verification email already sent. Please try again after 1 hour.',
                    duration: Snackbar.LENGTH_SHORT,
                  });
                  break;
                case 500:
                  Snackbar.show({
                    text: 'Internal server error. Please try again later.',
                    duration: Snackbar.LENGTH_SHORT,
                  });
                  break;
                default:
                  Snackbar.show({
                    text: 'Something went wrong. Please try again later.',
                    duration: Snackbar.LENGTH_SHORT,
                  });
              }
            } else {
              Snackbar.show({
                text: 'An error occured, try again!',
                duration: Snackbar.LENGTH_SHORT,
              });
            }
          },
        },
      );
    } else {
      Alert.alert(
        'Failed to authenticate, Token not found',
        'Please try again',
      );
    }
  };

  const handleSubmit = () => {
    if (
      !specialization ||
      !education ||
      !experience ||
      !businessEmail ||
      !phone
    ) {
      Alert.alert('Please fill in all fields');
      return;
    } else if (validator.validate(businessEmail) === false) {
      Alert.alert('Please enter a valid mail id');
      return;
    } else if (phone.length < 10) {
      Alert.alert('Please enter a valid phone number');
      return;
    } else {
      let contactDetail: Contactdetail = {
        email_id:
          businessEmail && businessEmail !== '' ? businessEmail : user.email,
        phone_no: phone,
      };

      registerDoctor(contactDetail);
      //doctorRegisterMutation.mutate({
      //contactDetail: contactDetail,
      //});
    }
  };

  const registerDoctor = async (contactDetail: Contactdetail) => {
    if (!user.profile_image || user.profile_image === '') {
      callRegisterAPI('', contactDetail);
    } else {
      Alert.alert(
        '',
        'Are you sure you want to use this image?',
        [
          {
            text: 'Cancel',
            onPress: () => {
              // setUserProfileImage(user?.Profile_image || '');
              //setUserProfileImage('');
              Snackbar.show({
                text: 'Your profile image will not be uploaded.',
                duration: Snackbar.LENGTH_SHORT,
              });
              callRegisterAPI('', contactDetail);
            },
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: async () => {
              try {
                // Upload the resized image
                let result;
                if (user.profile_image && user.profile_image !== '') {
                  result = await uploadImage(user.profile_image);
                }
                
               callRegisterAPI(result ?? "", contactDetail);
              
              } catch (err) {
                console.error('Registration failed', err);
                Alert.alert('Error Occured', 'Registration failed');
              }
            },
          },
        ],
        {cancelable: false},
      );
    }
  };

  if (registerPending || verifyMutationPending || loading) {
    return <Loader />;
  }
  return (
    <ScrollView
      backgroundColor="$background"
      showsVerticalScrollIndicator={false}>
      <SafeAreaView>
        {/* Header Quote */}
        <YStack
          width="92%"
          height={160}
          borderRadius="$6"
          marginTop="$6"
          alignItems="center"
          justifyContent="center"
          backgroundColor="$blue10"
          alignSelf="center"
          paddingHorizontal="$4"
          paddingVertical="$5"
          elevation={3}>
          <Text
            fontSize={18}
            color="white"
            textAlign="center"
            lineHeight={26}
            fontWeight="600">
            “Let me congratulate you on the choice of calling which offers a
            combination of intellectual and moral interest found in no other
            profession.”
          </Text>
          <Text fontSize={14} color="white" textAlign="center" marginTop="$2">
            ~ Sir William Osler
          </Text>
        </YStack>

        {/* Form Section */}
        <YStack
          width="92%"
          alignSelf="center"
          backgroundColor="$background"
          borderRadius="$6"
          padding="$5"
          marginTop="$6"
          marginBottom="$10"
          space="$5"
          elevation={2}>
          {/* Profile Image */}
          {user.profile_image && (
            <YStack
              height={110}
              width={110}
              borderRadius={55}
              backgroundColor="$blue10"
              alignItems="center"
              justifyContent="center"
              overflow="hidden"
              alignSelf="center"
              marginBottom="$4">
              <Image
                source={{uri: user.profile_image}}
                style={{
                  height: '100%',
                  width: '100%',
                  resizeMode: 'cover',
                }}
              />
            </YStack>
          )}

          {/* Input Fields */}
          {[
            {
              placeholder: 'What is your Specialization?',
              value: specialization,
              onChangeText: setSpecialization,
              icon: 'business',
            },
            {
              placeholder: 'Educational Qualification',
              value: education,
              onChangeText: setEducation,
              icon: 'school',
            },
            {
              placeholder: 'Years of Experience',
              value: experience,
              onChangeText: setExperience,
              icon: 'numbers',
              keyboardType: 'numeric',
              maxLength: 3,
            },
            {
              placeholder: 'Professional Email',
              value: businessEmail,
              onChangeText: setBusinessEmail,
              icon: 'email',
              keyboardType: 'email-address',
            },
            {
              placeholder: 'Phone number with country code',
              value: phone,
              onChangeText: setPhone,
              icon: 'phone',
              keyboardType: 'phone-pad',
              maxLength: 14,
            },
          ].map((field, index) => (
            <XStack key={index} position="relative">
              <Input
                flex={1}
                height="$6"
                borderColor="$blue10"
                borderWidth={1}
                borderRadius="$4"
                paddingHorizontal="$4"
                marginVertical="$2"
                placeholder={field.placeholder}
                value={field.value}
                onChangeText={field.onChangeText}
                keyboardType={field.keyboardType}
                maxLength={field.maxLength}
              />
              <YStack position="absolute" right={14} top={12}>
                <Icon name={field.icon} size={20} color="#000" />
              </YStack>
            </XStack>
          ))}

          {/* Submit Button */}
          <Button
            backgroundColor="$blue10"
            borderRadius="$5"
            alignSelf="center"
            width="100%"
            size="$6"
            marginTop="$2"
            onPress={handleSubmit}>
            <Text color="white" fontWeight="700" fontSize={18}>
              Register
            </Text>
          </Button>

          {/* Modal */}
          <EmailVerifiedModal
            visible={verifiedModalVisible}
            onClick={handleVerifyModalCallback}
            onClose={() => {
              if (verifyBtntext !== 'Request Verification') {
                setVerifiedModalVisible(false);
              }
            }}
            message={verifyBtntext}
          />
        </YStack>
      </SafeAreaView>
    </ScrollView>
  );
};

export default SignupPageSecond;
