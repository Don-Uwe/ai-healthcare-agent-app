import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {hp} from '../../helper/Metric';
import {PRIMARY_COLOR} from '../../helper/Theme';
import AntIcon from 'react-native-vector-icons/AntDesign';
import {Contactdetail, SignUpScreenSecondProp} from '../../type';
import {useMutation} from '@tanstack/react-query';
import axios, {AxiosError} from 'axios';
import {REGISTRATION_API, VERIFICATION_MAIL_API} from '../../helper/APIUtils';
import EmailVerifiedModal from '../../components/VerifiedModal';
import Loader from '../../components/Loader';
import Snackbar from 'react-native-snackbar';
import useUploadImage from '../../../hooks/useUploadImage';
var validator = require('email-validator');

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
    <ScrollView style={styles.container}>
      <TouchableOpacity
        style={{flex: 0, backgroundColor: PRIMARY_COLOR}}
        onPress={() => {
          navigation.goBack();
        }}>
        <AntIcon name="arrowleft" size={35} color="white" />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>...let me congratulate on the</Text>
        <Text style={styles.title}>choice of calling which offers a</Text>
        <Text style={styles.title}>combination of intellectual and</Text>
        <Text style={styles.title}>moral interest found in no other</Text>
        <Text style={styles.title}>profession</Text>
        <Text style={styles.subtitle}> ~ Sir William Olser.</Text>
      </View>
      <View style={styles.footer}>
        <View style={styles.form}>
          <View style={{alignSelf: 'center', marginBottom: 10}}>
            {user.profile_image === '' ? (
              <Icon name="person-add" size={70} color="#0CAFFF" />
            ) : (
              <Image
                style={{
                  height: 80,
                  width: 80,
                  borderRadius: 40,
                  resizeMode: 'cover',
                }}
                source={{uri: user.profile_image}}
              />
            )}
          </View>
          <View style={styles.field}>
            <TextInput
              style={styles.input}
              placeholder="What is your Specialization ?"
              onChangeText={setSpecialization}
              value={specialization}
            />
            <View style={styles.inputIcon}>
              <Icon name="business" size={20} color="#000" />
            </View>
          </View>

          <View style={styles.field}>
            <TextInput
              style={styles.input}
              placeholder="Educational Qualification"
              onChangeText={setEducation}
              value={education}
            />
            <View style={styles.inputIcon}>
              <Icon name="school" size={20} color="#000" />
            </View>
          </View>

          <View style={styles.field}>
            <TextInput
              style={styles.input}
              placeholder="Years of Experience"
              onChangeText={setExperience}
              value={experience}
              keyboardType="numeric"
              maxLength={3}
            />
            <View style={styles.inputIcon}>
              <Icon name="numbers" size={20} color="#000" />
            </View>
          </View>

          <View style={styles.field}>
            <TextInput
              style={styles.input}
              placeholder="Professional Email"
              onChangeText={setBusinessEmail}
              value={businessEmail}
            />
            <View style={styles.inputIcon}>
              <Icon name="email" size={20} color="#000" />
            </View>
          </View>

          <View style={styles.field}>
            <TextInput
              style={styles.input}
              placeholder="phone number with country code"
              onChangeText={setPhone}
              value={phone}
              keyboardType="phone-pad"
              maxLength={14}
            />
            <View style={styles.inputIcon}>
              <Icon name="phone" size={20} color="#000" />
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
        </View>

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
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    width: '100%',
    height: hp(36),
    paddingTop: 0,
    alignItems: 'center',
    backgroundColor: PRIMARY_COLOR,
  },
  footer: {
    flex: 1,
    width: '98%',
    alignSelf: 'center',
    backgroundColor: 'white',
    marginTop: -50,
    borderRadius: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 10,
  },
  iconContainer: {
    alignSelf: 'center',
    marginTop: 20,
  },
  form: {
    padding: 20,
    marginTop: 15,
  },
  field: {},
  input: {
    height: 40,
    borderColor: '#0CAFFF',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    fontSize: 15,
  },
  inputIcon: {
    position: 'absolute',
    right: 14,
    top: 12,
  },
  button: {
    backgroundColor: '#0CAFFF',
    padding: 10,
    borderRadius: 40,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20,
    width: '90%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },
});

export default SignupPageSecond;
