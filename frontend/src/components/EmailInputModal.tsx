import React, {useState} from 'react';
import {
  View,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {PRIMARY_COLOR} from '../helper/Theme';
import {EmailInputModalProp} from '../type';
import {hp} from '../helper/Metric';

export default function EmailInputModal({
  visible,
  callback,
  backButtonClick,
  onDismiss,
  isRequestVerification
}: EmailInputModalProp) {
  const [modelTitle, setModelTitle] = useState(true);
  const [email, setEmail] = useState('');

  /** Back Button Click */
  const handleBackClick = () => {
    setModelTitle(true);
    setEmail('');
    backButtonClick();
  };

  /** Submit Button action click */
  const verifyEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setModelTitle(false);
      //return;
    } else {
      callback(email);
      setModelTitle(true);
      setEmail('');
    }

    // navigator.navigate('OtpScreen');
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onDismiss={onDismiss}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={modelTitle ? styles.modalTitle : styles.modalTitleError}>
            {modelTitle
              ? isRequestVerification
                ? 'Email Verification'
                : 'Forgot password'
              : 'Email is not valid'}
          </Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="Enter your email"
            placeholderTextColor="#000000"
            value={email}
            onChangeText={text => {
              setEmail(text);
              setModelTitle(true);
            }}
            style={modelTitle ? styles.modalInput : styles.modalInputError}
          />
          <TouchableOpacity style={styles.modalButton} onPress={verifyEmail}>
            <Text style={styles.modalButtonText}>
              {isRequestVerification ? 'Send Verification Link' : 'Send OTP'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{...styles.modalButton, backgroundColor: PRIMARY_COLOR}}
            onPress={handleBackClick}>
            <Text style={styles.modalButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black overlay
    justifyContent: 'center',

    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 10,
    marginHorizontal: 14,
    width: '95%',
    height: hp(45),
    justifyContent: 'center',
    // alignItems:"center"
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    //color:"black"
  },
  modalTitleError: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'red',
  },
  modalInput: {
    height: 47,
    borderColor: PRIMARY_COLOR,
    borderWidth: 1,
    backgroundColor: '#B6D0E2',
    marginVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  modalInputError: {
    height: 40,
    borderColor: 'red',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  modalButton: {
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#0F52BA',
    borderRadius: 7,
    marginVertical: 10,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
});
