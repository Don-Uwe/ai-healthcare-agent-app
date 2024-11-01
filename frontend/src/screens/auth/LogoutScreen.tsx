import React from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Image,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {PRIMARY_COLOR} from '../../helper/Theme';
import {GET_STORAGE_DATA, USER_LOGOUT} from '../../helper/APIUtils';
import {useMutation} from '@tanstack/react-query';
import axios, {AxiosError} from 'axios';
import {resetUserState, setUserId, setUserToken} from '../../store/UserSlice';
import {useDispatch, useSelector} from 'react-redux';
import {clearStorage} from '../../helper/Utils';

const LogoutScreen = ({navigation, route}) => {
  const {profile_image, username} = route.params;
  const {user_token} = useSelector((state: any) => state.user);
  const dispatch = useDispatch();
  const userLogoutMutation = useMutation({
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
      await clearStorage();
      dispatch(resetUserState());
      //navigation.navigate('LoginScreen');
      //navigation.replace('LoginScreen');
      navigation.reset({
        index: 0,
        routes: [{name: 'LoginScreen'}], // Send user to LoginScreen after logout
      });
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
  const handleLogout = () => {
    userLogoutMutation.mutate();
  };
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <View style={styles.container}>
        <View style={styles.alert}>
          <View style={styles.alertContent}>
            <Image
              alt=""
              style={[
                styles.alertAvatar,
                !profile_image && {borderWidth: 0.5, borderColor: 'black'},
              ]}
              source={{
                uri: profile_image.startsWith('https')
                  ? profile_image
                  : `${GET_STORAGE_DATA}/${profile_image}`,
              }}
            />

            <Text style={styles.alertTitle}>
              Log out of
              {'\n'}
              {username}
            </Text>

            <Text style={styles.alertMessage}>
              Are you sure you would like to log out of this account ?
            </Text>
          </View>

          <TouchableOpacity onPress={handleLogout}>
            <View style={styles.btn}>
              <Text style={styles.btnText}>Yes, log me out</Text>
            </View>
          </TouchableOpacity>

          <View style={{marginTop: 8}}>
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();
              }}>
              <View style={styles.btnSecondary}>
                <Text style={styles.btnSecondaryText}>Cancel</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LogoutScreen;

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  /** Alert */
  alert: {
    position: 'relative',
    flexDirection: 'column',
    alignItems: 'stretch',
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    paddingTop: 80,
  },
  alertContent: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  alertAvatar: {
    width: 160,
    height: 160,
    borderRadius: 9999,
    alignSelf: 'center',
    marginBottom: 24,
  },
  alertTitle: {
    marginBottom: 16,
    fontSize: 34,
    lineHeight: 44,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
  },
  alertMessage: {
    marginBottom: 24,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    color: '#9a9a9a',
  },
  /** Button */
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
  },
  btnText: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600',
    color: '#fff',
  },
  btnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  btnSecondaryText: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600',
    color: PRIMARY_COLOR,
  },
});
