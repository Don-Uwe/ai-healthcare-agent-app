import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import Feather from 'react-native-vector-icons/Feather';
import {PRIMARY_COLOR} from '../helper/Theme';

const PasswordTab = () => {
  // State hooks to manage visibility of passwords
  const [isVisibleOldPassword, setisVisibleOldPassword] = useState(false);
  const [isVisibleNewPassword, setisVisibleNewPassword] = useState(false);
  const [isVisibleConfirmPassword, setisVisibleConfirmPassword] =
    useState(false);

  // Toggle functions to change password visibility
  const toggleOldPassword = () => {
    setisVisibleOldPassword(!isVisibleOldPassword);
  };
  const toggleNewPassword = () => {
    setisVisibleNewPassword(!isVisibleNewPassword);
  };
  const toggleConfirmPassword = () => {
    setisVisibleConfirmPassword(!isVisibleConfirmPassword);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Old Password Input */}
        <View style={styles.input}>
          <Text style={styles.inputLabel}>Old Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              secureTextEntry={!isVisibleOldPassword}
              placeholder="Enter your old password"
              placeholderTextColor="#6b7280"
              style={styles.inputControl}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={toggleOldPassword}>
              {isVisibleOldPassword ? (
                <Feather name="eye-off" color={'#6b7280'} size={20} />
              ) : (
                <Feather name="eye" color={'#6b7280'} size={20} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* New Password Input */}
        <View style={styles.input}>
          <Text style={styles.inputLabel}>New Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              secureTextEntry={!isVisibleNewPassword}
              placeholder="Enter your new password"
              placeholderTextColor="#6b7280"
              style={styles.inputControl}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={toggleNewPassword}>
              {isVisibleNewPassword ? (
                <Feather name="eye-off" color={'#6b7280'} size={20} />
              ) : (
                <Feather name="eye" color={'#6b7280'} size={20} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Password Input */}
        <View style={styles.input}>
          <Text style={styles.inputLabel}>Confirm Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              secureTextEntry={!isVisibleConfirmPassword}
              placeholder="Enter your confirm password"
              placeholderTextColor="#6b7280"
              style={styles.inputControl}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={toggleConfirmPassword}>
              {isVisibleConfirmPassword ? (
                <Feather name="eye-off" color={'#6b7280'} size={20} />
              ) : (
                <Feather name="eye" color={'#6b7280'} size={20} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        onPress={() => {
          // handle onPress
        }}
        style={styles.btn}>
        <Text style={styles.btnText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PasswordTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    height: '100%',
    flexDirection: 'column',
  },
  content: {
    width: '100%',
    flexDirection: 'column',
    gap: 15,
    alignItems: 'center',
  },
  input: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  inputControl: {
    height: 50,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingLeft: 16,
    paddingRight: 40,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
    borderWidth: 1,
    borderColor: '#C9D3DB',
    borderStyle: 'solid',
  },
  passwordContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    alignItems: 'center',
  },
  btn: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: PRIMARY_COLOR,
    marginTop: 20,
  },
  btnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});
