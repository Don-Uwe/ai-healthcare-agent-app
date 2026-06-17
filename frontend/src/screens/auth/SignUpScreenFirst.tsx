import React, {useState} from 'react';
import {ScrollView, YStack, XStack, Text, Input, Button, Image, useTheme} from 'tamagui';
import Icon from '@expo/vector-icons/MaterialIcons';
import { Alert } from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Dropdown} from 'react-native-element-dropdown';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {SignUpScreenFirstProp, UserDetail} from '../../type';
import {AxiosError} from 'axios';
import Snackbar from 'react-native-snackbar';
import EmailVerifiedModal from '../../components/VerifiedModal';
import SecurityWarningModal from '../../components/SecurityWarningModal';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import Loader from '../../components/Loader';
import useUploadImage from '../../hooks/useUploadImage';
import {
  ImageLibraryOptions,
  launchImageLibrary,
  ImagePickerResponse,
} from 'react-native-image-picker';
import {useCheckUserHandleAvailability} from '@/src/hooks/useCheckUserHandleAvailability';
import {useVerificationMailMutation} from '@/src/hooks/useMailVerification';
import {useRegdMutation} from '@/src/hooks/useUserRegistration';

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  username: z.string().min(1, 'User Handle is required'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.string().min(1, 'Please select a role'),
});
type SignupFormData = z.infer<typeof signupSchema>;

const SignupPageFirst = ({navigation}: SignUpScreenFirstProp) => {
  const {uploadImage, loading} = useUploadImage();
  const theme = useTheme();
  const [user_profile_image, setUserProfileImage] = useState('');
  const [verifyBtntext, setVerifyBtntxt] = useState('Request Verification');
  const [verifiedModalVisible, setVerifiedModalVisible] = useState(false);
  const [token, setToken] = useState('');
  const [isFocus, setIsFocus] = useState(false);
  const [isSecureEntry, setIsSecureEntry] = useState(true);
  const [securityWarningVisible, setSecurityWarningVisible] = useState(false);
  const [pendingSubmitAction, setPendingSubmitAction] = useState<(() => void) | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { isValid },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      role: '',
    },
  });

  const username = watch('username');
  const userHandle = username?.trim();

  const {data: handleAvailability, isLoading: isCheckingHandle} =
    useCheckUserHandleAvailability(userHandle);
  const {mutate: verifyEmailMutation, isPending: verifyEmailPending} =
    useVerificationMailMutation();

  const {mutate: register, isPending: registerPending} = useRegdMutation();
  const[isSubmitting, setIsSubmitting] = useState(false);

  const selectImage = async () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
    };

    launchImageLibrary(options, async (response: ImagePickerResponse) => {
      if (response.didCancel) {
        // console.log('User cancelled image picker');
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
            })
            .catch(err => {
              console.log(err);
              Alert.alert('Error', 'Could not resize the image.');
              setUserProfileImage('');
            });
        }
      }
    });
  };


  const handleVerifyModalCallback = () => {
    if (token.length > 0) {
      verifyEmailMutation(
        {
          email: email,
          token: token,
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

          onError: (err: any) => {
            if (err.response) {
              const statusCode = err.response.status;
              switch (statusCode) {
                case 400:
                  Snackbar.show({
                    text: err.message,
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
              console.log('Email Verification error', err);
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

  const onSubmit = (data: SignupFormData) => {
    if (handleAvailability && !handleAvailability.isAvailable) {
      Alert.alert('User handle is not available', 'Please choose a different handle.');
      return;
    }

    // Show security warning before proceeding with registration
    if (data.role === 'general') {
      setPendingSubmitAction(() => () => registerGeneralUser(data));
    } else {
      const detail: UserDetail = {
        user_name: data.name,
        user_handle: data.username.trim(),
        email: data.email,
        password: data.password,
        profile_image: user_profile_image,
      };
      setPendingSubmitAction(() => () => {
        console.log('General');
        navigation.navigate('SignUpScreenSecond', {
          user: detail,
        });
      });
    }
    setSecurityWarningVisible(true);
  };

  const handleSecurityWarningContinue = () => {
    setSecurityWarningVisible(false);
    if (pendingSubmitAction) {
      pendingSubmitAction();
      setPendingSubmitAction(null);
    }
  };

  const handleSecurityWarningCancel = () => {
    setSecurityWarningVisible(false);
    setPendingSubmitAction(null);
  };

  const callRegisterAPI = (profile_url: string, data: SignupFormData) => {
    register(
      {
        user_name: data.name,
        user_handle: data.username.trim(),
        email: data.email,
        password: data.password,
        isDoctor: false,
        Profile_image: profile_url,
      },
      {
        onSuccess: data => {
          setToken(data);
          setVerifiedModalVisible(true);
        },

        onError: (err: AxiosError) => {
          console.log(err.message);
          if (err.response) {
            const statusCode = err.response.status;
            switch (statusCode) {
              case 400:
                const errorData = err.message;
                console.log('Error message', errorData);
                Alert.alert('Registration failed', 'Please try again');
                break;
              case 409:
                Alert.alert(
                  'Registration failed',
                  'Email or user handle already exists',
                );
                break;
              case 500:
                Alert.alert(
                  'Registration failed',
                  'Internal server error. Please try again later.',
                );
                break;
              default:
                Alert.alert(
                  'Registration failed',
                  'Something went wrong. Please try again later.',
                );
            }
          } else {
            console.log('General User Registration Error', err);
            Alert.alert('Registration failed', 'Please try again');
          }
        },
      },
    );
  };

  const registerGeneralUser = async (data: SignupFormData) => {
    if (user_profile_image === '') {
      callRegisterAPI('', data);
    } else {
      Alert.alert(
        '',
        'Are you sure you want to use this image?',
        [
          {
            text: 'Cancel',
            onPress: () => {
              // setUserProfileImage(user?.Profile_image || '');
              setUserProfileImage('');
              Snackbar.show({
                text: 'Your profile image will not  be uploaded.',
                duration: Snackbar.LENGTH_SHORT,
              });
             callRegisterAPI('', data);
            },
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: async () => {
              try {
                // Upload the resized image
                const result = await uploadImage(user_profile_image);

                callRegisterAPI(result ?? '', data);
              } catch (err) {
                console.error('Upload failed');
                Alert.alert('Error', 'Upload failed');
              }
            },
          },
        ],
        {cancelable: false},
      );
    }
  };

  const data = [
    {label: 'General User', value: 'general'},
    {label: 'Doctor', value: 'doctor'},
  ];

  if (registerPending || verifyEmailPending || loading) {
    return <Loader />;
  }

  return (
    <ScrollView
      backgroundColor="$background"
      showsVerticalScrollIndicator={false}>
      <SafeAreaView>
        {/* Header */}
        <YStack
          width="94%"
          height={140}
          alignItems="center"
          justifyContent="center"
          backgroundColor="$blue10"
          alignSelf="center"
          borderRadius="$4"
          marginTop="$2"
          padding="$3"
          space="$2">
          <Text fontSize={16} color="white" textAlign="center" fontWeight="600">
            He who has health has hope and he who has hope has everything.
          </Text>
          <Text fontSize={16} color="white" textAlign="center" fontWeight="600">
            ~ Arabian Proverb.
          </Text>
        </YStack>

        {/* Profile Image */}
        <YStack alignItems="center" marginTop="$4" marginBottom="$3">
          <Button
            circular
            size="$9"
            backgroundColor="$blue10"
            onPress={selectImage}
            padding="$3">
            {user_profile_image === '' ? (
              <AntDesign
                name="camera"
                size={26}
                color={theme.white.val}
                style={{transform: [{scaleX: -1}]}}
              />
            ) : (
              <Image
                source={{uri: user_profile_image}}
                style={{
                  height: 80,
                  width: 80,
                  borderRadius: 40,
                }}
              />
            )}
          </Button>
        </YStack>

        {/* Title */}
        <Text
          fontSize={20}
          fontWeight="700"
          color="$blue10"
          textAlign="center"
          textTransform="uppercase">
          Sign up
        </Text>

        {/* Form */}
        <YStack padding="$4" space="$4">
          {/* Name */}
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <YStack gap="$1">
                <XStack position="relative">
                  <Input
                    flex={1}
                    height="$5"
                    borderColor={error ? "$red10" : "$blue10"}
                    borderWidth={1}
                    borderRadius="$3"
                    placeholder="Name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                  <YStack position="absolute" right={14} top={10}>
                    <Icon name="person" size={20} color={theme.black.val} />
                  </YStack>
                </XStack>
                {error && <Text color="$red10" fontSize={12}>{error.message}</Text>}
              </YStack>
            )}
          />

          {/* User Handle */}
          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <YStack gap="$1">
                <XStack position="relative">
                  <Input
                    flex={1}
                    height="$5"
                    borderColor={error ? "$red10" : "$blue10"}
                    borderWidth={1}
                    borderRadius="$3"
                    placeholder="User Handle"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                  <YStack position="absolute" right={14} top={10}>
                    <Icon name="person" size={20} color={theme.black.val} />
                  </YStack>
                </XStack>
                {error && <Text color="$red10" fontSize={12}>{error.message}</Text>}
              </YStack>
            )}
          />

          {/* Handle Availability Feedback */}
          {isCheckingHandle && (
            <Text color="$gray10" fontSize={14}>
              Checking availability...
            </Text>
          )}
          {!isCheckingHandle && handleAvailability && !handleAvailability.isAvailable && (
            <Text color="$red10" fontSize={14}>
              {handleAvailability.message}
            </Text>
          )}
          {!isCheckingHandle && handleAvailability?.isAvailable && (
            <Text color="green" fontSize={14}>
              {handleAvailability.message}
            </Text>
          )}

          {/* Email */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <YStack gap="$1">
                <XStack position="relative">
                  <Input
                    flex={1}
                    height="$5"
                    borderColor={error ? "$red10" : "$blue10"}
                    borderWidth={1}
                    borderRadius="$3"
                    placeholder="Email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <YStack position="absolute" right={14} top={10}>
                    <Icon name="email" size={20} color={theme.black.val} />
                  </YStack>
                </XStack>
                {error && <Text color="$red10" fontSize={12}>{error.message}</Text>}
              </YStack>
            )}
          />

          {/* Password */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <YStack gap="$1">
                <XStack position="relative">
                  <Input
                    flex={1}
                    height="$5"
                    borderColor={error ? "$red10" : "$blue10"}
                    borderWidth={1}
                    borderRadius="$3"
                    placeholder="Password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry={isSecureEntry}
                    autoCapitalize="none"
                  />
                  <Button
                    chromeless
                    position="absolute"
                    right={1}
                    top={8}
                    onPress={() => setIsSecureEntry(!isSecureEntry)}>
                    <AntDesign
                      name={isSecureEntry ? 'eye-invisible' : 'eye'}
                      size={17}
                      color={theme.black.val}
                    />
                  </Button>
                </XStack>
                {error && <Text color="$red10" fontSize={12}>{error.message}</Text>}
              </YStack>
            )}
          />

          {/* Role Dropdown */}
          <Controller
            control={control}
            name="role"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <YStack gap="$1">
                <Dropdown
                  style={{
                    height: 40,
                    borderColor: error ? 'red' : theme.blue10.val,
                    borderWidth: 1,
                    borderRadius: 5,
                    paddingHorizontal: 10,
                    marginBottom: error ? 0 : 20,
                  }}
                  placeholderStyle={{fontSize: 15}}
                  data={data}
                  labelField="label"
                  valueField="value"
                  placeholder={!isFocus ? 'Select your role' : '...'}
                  value={value}
                  onFocus={() => setIsFocus(true)}
                  onBlur={() => setIsFocus(false)}
                  onChange={item => {
                    onChange(item.value);
                    setIsFocus(false);
                  }}
                />
                {error && <Text color="$red10" fontSize={12} marginBottom="$4">{error.message}</Text>}
              </YStack>
            )}
          />

          {/* Submit Button */}
          <Button
            backgroundColor="$blue10"
            size={'$7'}
            padding="$3"
            borderRadius="$4"
            alignItems="center"
            alignSelf="center"
            width="100%"
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid || registerPending}
            opacity={!isValid || registerPending ? 0.5 : 1}>
            <Text color="white" fontWeight="bold" fontSize={18}>
              {watch('role') === 'general' ? 'Register' : 'Continue'}
            </Text>
          </Button>
        </YStack>

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
      </SafeAreaView>
    </ScrollView>
  );
};

export default SignupPageFirst;
