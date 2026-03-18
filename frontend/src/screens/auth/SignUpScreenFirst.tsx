import React, {useState} from 'react';
import {Alert} from 'react-native';
import {ScrollView, YStack, XStack, Text, Input, Button, Image} from 'tamagui';
import Icon from '@expo/vector-icons/MaterialIcons';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Dropdown} from 'react-native-element-dropdown';
import AntDesign from '@expo/vector-icons/AntDesign';
import {SignUpScreenFirstProp, UserDetail} from '../../type';
import {useMutation} from '@tanstack/react-query';
import axios, {AxiosError} from 'axios';
import Snackbar from 'react-native-snackbar';
import {REGISTRATION_API} from '../../helper/APIUtils';
import EmailVerifiedModal from '../../components/VerifiedModal';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import Loader from '../../components/Loader';
import useUploadImage from '../../hooks/useUploadImage';
import {
  ImageLibraryOptions,
  launchImageLibrary,
  ImagePickerResponse,
} from 'react-native-image-picker';
import {useCheckUserHandleAvailability} from '@/src/hooks/useCheckUserHandle';
import {useVerificationMailMutation} from '@/src/hooks/useMailVerification';
// eslint-disable-next-line @typescript-eslint/no-require-imports
let validator = require('email-validator');

const SignupPageFirst = ({navigation}: SignUpScreenFirstProp) => {
  const {uploadImage, loading} = useUploadImage();
  const [user_profile_image, setUserProfileImage] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [verifyBtntext, setVerifyBtntxt] = useState('Request Verification');
  const [verifiedModalVisible, setVerifiedModalVisible] = useState(false);
  // const [isHandleAvailable, setIsHandleAvailable] = useState(false);
  const [token, setToken] = useState('');
  const [isFocus, setIsFocus] = useState(false);
  const [isSecureEntry, setIsSecureEntry] = useState(true);
  //const [error, setError] = useState('');

  const {data: checkhandle, isLoading} =
    useCheckUserHandleAvailability(username);
  const {mutate: verifyEmailMutation, isPending: verifyEmailPending} =
    useVerificationMailMutation();

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

  const handleUserHandleChange = (text: string) => {
    setUsername(text);
  };

  const userRegisterMutation = useMutation({
    mutationKey: ['general-user-registration'],
    mutationFn: async ({profile_url}: {profile_url: string}) => {
      const res = await axios.post(REGISTRATION_API, {
        user_name: name,
        user_handle: username,
        email: email,
        password: password,
        isDoctor: false,
        Profile_image: profile_url,
      });
      return res.data.token as string;
    },
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
  });

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
            navigation.navigate('LoginScreen');
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
  const handleSubmit = () => {
    // if (!isHandleAvailable) {
    //   return;
    // }
    if (!name || !username || !email || !password || !role) {
      Alert.alert('Please fill in all fields');
      return;
    } else if (validator.validate(email) === false) {
      Alert.alert('Email id is not valid');
      return;
    } else if (password.length < 6) {
      Alert.alert('Password must be at least of 6 length');
      return;
    }

    if (role === 'general') {
      registerGeneralUser();
      // userRegisterMutation.mutate();
    } else {
      const detail: UserDetail = {
        user_name: name,
        user_handle: username,
        email: email,
        password: password,
        profile_image: user_profile_image,
      };
      console.log('General');
      navigation.navigate('SignUpScreenSecond', {
        user: detail,
      });
    }
  };

  const registerGeneralUser = async () => {
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
            userRegisterMutation.mutate({
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
              const result = await uploadImage(user_profile_image);

              userRegisterMutation.mutate({
                profile_url: result ? result : '',
              });
            } catch (err) {
              console.error('Upload failed');
              Alert.alert('Error', 'Upload failed');
            }
          },
        },
      ],
      {cancelable: false},
    );
  };
  const data = [
    {label: 'General User', value: 'general'},
    {label: 'Doctor', value: 'doctor'},
  ];

  if (userRegisterMutation.isPending || verifyEmailPending || loading) {
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
                color="#ffffff"
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
          <XStack position="relative">
            <Input
              flex={1}
              height="$5"
              borderColor="$blue10"
              borderWidth={1}
              borderRadius="$3"
              placeholder="Name"
              value={name}
              onChangeText={setName}
            />
            <YStack position="absolute" right={14} top={10}>
              <Icon name="person" size={20} color="#000" />
            </YStack>
          </XStack>

          {/* Handle Error */}
          {checkhandle?.status === false && (
            <Text color="red" fontSize={14}>
              User handle is already in use.
            </Text>
          )}
          {isLoading && (
            <Text color="green" fontSize={14}>
              Checking...
            </Text>
          )}
          {/* User Handle */}
          <XStack position="relative">
            <Input
              flex={1}
              height="$5"
              borderColor="$blue10"
              borderWidth={1}
              borderRadius="$3"
              placeholder="User Handle"
              value={username}
              onChangeText={handleUserHandleChange}
            />
            <YStack position="absolute" right={14} top={10}>
              <Icon name="person" size={20} color="#000" />
            </YStack>
          </XStack>

          {/* Email */}
          <XStack position="relative">
            <Input
              flex={1}
              height="$5"
              borderColor="$blue10"
              borderWidth={1}
              borderRadius="$3"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <YStack position="absolute" right={14} top={10}>
              <Icon name="email" size={20} color="#000" />
            </YStack>
          </XStack>

          {/* Password */}
          <XStack position="relative">
            <Input
              flex={1}
              height="$5"
              borderColor="$blue10"
              borderWidth={1}
              borderRadius="$3"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={isSecureEntry}
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
                color="#000"
              />
            </Button>
          </XStack>

          {/* Role Dropdown */}
          <Dropdown
            style={{
              height: 40,
              borderColor: '#0CAFFF',
              borderWidth: 1,
              borderRadius: 5,
              paddingHorizontal: 10,
              marginBottom: 20,
            }}
            placeholderStyle={{fontSize: 15}}
            data={data}
            labelField="label"
            valueField="value"
            placeholder={!isFocus ? 'Select your role' : '...'}
            value={role}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={item => {
              setRole(item.value);
              setIsFocus(false);
            }}
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
            onPress={handleSubmit}>
            <Text color="white" fontWeight="bold" fontSize={18}>
              {role === 'general' ? 'Register' : 'Continue'}
            </Text>
          </Button>
        </YStack>

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
