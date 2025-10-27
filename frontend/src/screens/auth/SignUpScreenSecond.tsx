import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';

import {ScrollView, YStack, XStack, Text, Input, Button, Image} from 'tamagui';
import Icon from '@expo/vector-icons/MaterialIcons';
import {hp, wp} from '../../helper/Metric';
import {PRIMARY_COLOR} from '../../helper/Theme';
import {Contactdetail, SignUpScreenSecondProp} from '../../type';
import {useMutation} from '@tanstack/react-query';
import axios, {AxiosError} from 'axios';
import {REGISTRATION_API, VERIFICATION_MAIL_API} from '../../helper/APIUtils';
import EmailVerifiedModal from '../../components/VerifiedModal';
import Loader from '../../components/Loader';
import Snackbar from 'react-native-snackbar';
import useUploadImage from '../../../hooks/useUploadImage';
import {SafeAreaView} from 'react-native-safe-area-context';
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

  const doctorRegisterMutation = useMutation({
    mutationKey: ['doctor-user-registration'],
    mutationFn: async ({
      contactDetail,
      profile_url,
    }: {
      contactDetail: Contactdetail;
      profile_url: string;
    }) => {
      const res = await axios.post(REGISTRATION_API, {
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
      });
      return res.data.token as string;
    },
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
  });

  const verifyMail = useMutation({
    mutationKey: ['send-verification-mail'],
    mutationFn: async () => {
      const res = await axios.post(VERIFICATION_MAIL_API, {
        email: user.email,
        token: token,
      });

      return res.data.message as string;
    },

    onSuccess: data => {
      setVerifyBtntxt(data);
      Alert.alert('Verification Email Sent');
      navigation.navigate('LoginScreen');
    },
    onError: (error: AxiosError) => {
      if (error.response) {
        const statusCode = error.response.status;
        switch (statusCode) {
          case 400:
            if (error.message === 'Email and token are required') {
              Alert.alert('Error', 'Email and token are required');
            } else if (error.message === 'User not found or already verified') {
              Alert.alert('Error', 'User not found or already verified');
            } else {
              Alert.alert('Error', 'Please provide all required fields');
            }
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
        // console.log('Email Verification error', error);
        Alert.alert('Error', 'Please try again');
      }
    },
  });

  const handleVerifyModalCallback = () => {
    if (token.length > 0) {
      verifyMail.mutate();
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
            doctorRegisterMutation.mutate({
              contactDetail: contactDetail,
              profile_url: '',
            });
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
              doctorRegisterMutation.mutate({
                contactDetail: contactDetail,
                profile_url: result ? result : '',
              });
              // setSubmitProfileUrl(result ? result : '');
            } catch (err) {
              console.error('Registration failed', err);
              Alert.alert('Error Occured', 'Registration failed');
            }
          },
        },
      ],
      {cancelable: false},
    );
  };
  const validPhoneNumber = phone => {
    const phoneNumberRegex = /^\+\d{1,3}\d{7,10}$/;
    return phoneNumberRegex.test(phone);
  };

  if (doctorRegisterMutation.isPending || verifyMail.isPending || loading) {
    return <Loader />;
  }
  return (
    <ScrollView backgroundColor="$background">
      <SafeAreaView>
        {/* Header Quote */}
        <YStack
          width="92%"
          height={160}
          borderRadius="$6"
          marginTop="$4"
          alignItems="center"
          justifyContent="center"
          backgroundColor="$blue10"
          alignSelf="center"
          paddingHorizontal="$4"
          paddingVertical="$4"
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
          padding="$4"
          marginTop="$5"
          space="$4"
          elevation={2}>
          {/* Profile Image */}
           {user.profile_image && (
          <YStack
            height={100}
            width={100}
            borderRadius={50}
            backgroundColor="$blue10"
            alignItems="center"
            justifyContent="center"
            overflow="hidden"
            alignSelf="center"
            marginBottom="$3">
           
              <Image
                source={{uri: user.profile_image}}
                style={{
                  height: '100%',
                  width: '100%',
    
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
                height="$5"
                borderColor="$blue10"
                borderWidth={1}
                borderRadius="$4"
                placeholder={field.placeholder}
                value={field.value}
                onChangeText={field.onChangeText}
                keyboardType={field.keyboardType}
                maxLength={field.maxLength}
                paddingRight="$8"
              
                marginVertical="$1" 
              />
              <YStack position="absolute" right={14} top={10}>
                <Icon name={field.icon} size={20} color="#000" />
              </YStack>
            </XStack>
          ))}

          {/* Submit Button */}
          <Button
            backgroundColor="$blue10"
            borderRadius="$4"
            alignSelf="center"
            width="100%"
            size="$6"
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
