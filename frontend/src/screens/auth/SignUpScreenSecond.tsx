import React, {useState} from 'react';
import {Alert} from 'react-native';

import {ScrollView, YStack, XStack, Text, Input, Button, Image, useTheme} from 'tamagui';
import Icon from '@expo/vector-icons/MaterialIcons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {Contactdetail, SignUpScreenSecondProp} from '../../type';
import {AxiosError} from 'axios';
import EmailVerifiedModal from '../../components/VerifiedModal';
import SecurityWarningModal from '../../components/SecurityWarningModal';
import Loader from '../../components/Loader';
import Snackbar from 'react-native-snackbar';
import useUploadImage from '../../hooks/useUploadImage';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useVerificationMailMutation} from '@/src/hooks/useMailVerification';
import {useRegdMutation} from '@/src/hooks/useUserRegistration';
let validator = require('email-validator');
const signupSecondSchema = z.object({
  specialization: z.string().min(1, 'Specialization is required'),
  education: z.string().min(1, 'Educational Qualification is required'),
  experience: z.string().min(1, 'Years of Experience is required'),
  businessEmail: z.string().email('Please enter a valid email'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
});
type SignupSecondFormData = z.infer<typeof signupSecondSchema>;

const SignupPageSecond = ({navigation, route}: SignUpScreenSecondProp) => {
  const {user} = route.params;
  const {uploadImage, loading} = useUploadImage();
  const [token, setToken] = useState('');
  const [verifyBtntext, setVerifyBtntxt] = useState('Request Verification');
  const [verifiedModalVisible, setVerifiedModalVisible] = useState(false);
  const [securityWarningVisible, setSecurityWarningVisible] = useState(false);
  const [pendingSubmitData, setPendingSubmitData] = useState<{
    contactDetail: Contactdetail;
    data: SignupSecondFormData;
  } | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<SignupSecondFormData>({
    resolver: zodResolver(signupSecondSchema),
    mode: 'onChange',
    defaultValues: {
      specialization: '',
      education: '',
      experience: '',
      businessEmail: '',
      phone: '',
    },
  });
  const {mutate: verifyEmailMutation, isPending: verifyMutationPending} =
    useVerificationMailMutation();
  const {mutate: register, isPending: registerPending} = useRegdMutation();
  const theme = useTheme();
  const callRegisterAPI = (
    profile_url: string,
    contactDetail: Contactdetail,
    data: SignupSecondFormData,
  ) => {
    register(
      {
        user_name: user.user_name,
        user_handle: user.user_handle,
        email: user.email,
        password: user.password,
        isDoctor: true,
        specialization: data.specialization,
        qualification: data.education,
        Years_of_experience: data.experience,
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
            navigation.navigate('LoginScreen', {});
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

  const onSubmit = (data: SignupSecondFormData) => {
    let contactDetail: Contactdetail = {
      email_id:
        data.businessEmail && data.businessEmail !== '' ? data.businessEmail : user.email,
      phone_no: data.phone,
    };

    // Show security warning before proceeding with registration
    setPendingSubmitData({ contactDetail, data });
    setSecurityWarningVisible(true);
  };

  const handleSecurityWarningContinue = () => {
    setSecurityWarningVisible(false);
    if (pendingSubmitData) {
      registerDoctor(pendingSubmitData.contactDetail, pendingSubmitData.data);
      setPendingSubmitData(null);
    }
  };

  const handleSecurityWarningCancel = () => {
    setSecurityWarningVisible(false);
    setPendingSubmitData(null);
  };

  const registerDoctor = async (contactDetail: Contactdetail, data: SignupSecondFormData) => {
    if (!user.profile_image || user.profile_image === '') {
      callRegisterAPI('', contactDetail, data);
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
              callRegisterAPI('', contactDetail, data);
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
                
               callRegisterAPI(result ?? "", contactDetail, data);
              
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
            color="$white"
            textAlign="center"
            lineHeight={26}
            fontWeight="600">
            “Let me congratulate you on the choice of calling which offers a
            combination of intellectual and moral interest found in no other
            profession.”
          </Text>
          <Text fontSize={14} color="$white" textAlign="center" marginTop="$2">
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
                }}
                resizeMode="cover"
              />
            </YStack>
          )}

          {/* Input Fields */}
          {[
            {
              placeholder: 'What is your Specialization?',
              name: 'specialization',
              icon: 'business',
            },
            {
              placeholder: 'Educational Qualification',
              name: 'education',
              icon: 'school',
            },
            {
              placeholder: 'Years of Experience',
              name: 'experience',
              icon: 'numbers',
              keyboardType: 'numeric',
              maxLength: 3,
            },
            {
              placeholder: 'Professional Email',
              name: 'businessEmail',
              icon: 'email',
              keyboardType: 'email-address',
            },
            {
              placeholder: 'Phone number with country code',
              name: 'phone',
              icon: 'phone',
              keyboardType: 'phone-pad',
              maxLength: 14,
            },
          ].map((field, index) => (
            <Controller
              key={index}
              control={control}
              name={field.name as any}
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <YStack gap="$1">
                  <XStack position="relative">
                    <Input
                      flex={1}
                      height="$6"
                      borderColor={error ? "$red10" : "$blue10"}
                      borderWidth={1}
                      borderRadius="$4"
                      paddingHorizontal="$4"
                      marginVertical="$2"
                      placeholder={field.placeholder}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType={field.keyboardType as any}
                      maxLength={field.maxLength}
                    />
                    <YStack position="absolute" right={14} top={12}>
                      <Icon name={field.icon as any} size={20} color={theme.black.val} />
                    </YStack>
                  </XStack>
                  {error && <Text color="$red10" fontSize={12}>{error.message}</Text>}
                </YStack>
              )}
            />
          ))}

          {/* Submit Button */}
          <Button
            backgroundColor="$blue10"
            borderRadius="$5"
            alignSelf="center"
            width="100%"
            size="$6"
            marginTop="$2"
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid || registerPending}
            opacity={!isValid || registerPending ? 0.5 : 1}>
            <Text color="$white" fontWeight="700" fontSize={18}>
              Register
            </Text>
          </Button>

          {/* Security Warning Modal */}
          <SecurityWarningModal
            visible={securityWarningVisible}
            onContinue={handleSecurityWarningContinue}
            onCancel={handleSecurityWarningCancel}
          />

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
