import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {PRIMARY_COLOR} from '../../helper/Theme';
import {GET_STORAGE_DATA, USER_LOGOUT} from '../../helper/APIUtils';
import axios, {AxiosError} from 'axios';
import {resetUserState} from '../../store/UserSlice';
import {useDispatch, useSelector} from 'react-redux';
import {clearStorage} from '../../helper/Utils';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LogoutScreenProp} from '@/src/type';
import {useUserLogout} from '@/src/hooks/useUserLogout';
import {useTheme} from 'tamagui';

const LogoutScreen = ({navigation, route}: LogoutScreenProp) => {
  const {profile_image, username} = route.params;
 // const {user_token} = useSelector((state: any) => state.user);
  const dispatch = useDispatch();
  const theme = useTheme();
  const {mutate: logout} = useUserLogout();  

  const handleLogout = () => {
    logout(
      {},
      {
        onSuccess: async () => {
          Alert.alert('Success', 'Logout successfully');
          await clearStorage();
          dispatch(resetUserState());
          navigation.reset({
            index: 0,
            routes: [{name: 'LoginScreen'}], 
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
      },
    );
  };
  return (
    <SafeAreaView style={{flex: 1, backgroundColor:theme.background.val}}>
      <View style={styles.container}>
        <View style={styles.alert}>
          <View style={styles.alertContent}>
            <Image
              alt=""
              style={[
                styles.alertAvatar,
                !profile_image && {borderWidth: 0.5, borderColor: theme.black.val},
              ]}
              source={{
                uri: profile_image
                  ? profile_image.startsWith('https')
                    ? profile_image
                    : `${GET_STORAGE_DATA}/${profile_image}`
                  : undefined,
              }}
            />

            <Text style={[
              styles.alertTitle,
              {color:theme.color.val}]}>
              Log out of
              {'\n'}
              {username}
            </Text>

            <Text style={[
              styles.alertMessage,
              {color:theme.gray500.val}]}>
              Are you sure you would like to log out of this account ?
            </Text>
          </View>

          <TouchableOpacity onPress={handleLogout}>
            <View style={styles.btn}>
              <Text style={[
                styles.btnText,
                {color:theme.white.val}]}>Yes, log me out</Text>
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
    
    textAlign: 'center',
  },
  alertMessage: {
    marginBottom: 24,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
   
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
