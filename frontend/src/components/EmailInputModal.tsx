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

export default function EmailInputModal({
  visible,
  callback,
  backButtonClick,
  onDismiss,
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
      callback();
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
            {modelTitle ? 'Enter your email id' : 'Email is not valid'}
          </Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="Enter your email"
            placeholderTextColor="#948585"
            value={email}
            onChangeText={text => {
              setEmail(text);
              setModelTitle(true);
            }}
            style={modelTitle ? styles.modalInput : styles.modalInputError}
          />
          <TouchableOpacity style={styles.modalButton} onPress={verifyEmail}>
            <Text style={styles.modalButtonText}>Submit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalButton}
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
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 20,
    width: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 15,
  },
  modalTitleError: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'red',
  },
  modalInput: {
    height: 40,
    borderColor: PRIMARY_COLOR,
    borderWidth: 1,
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
  },
  modalButtonText: {
    color: PRIMARY_COLOR,
    fontWeight: 'bold',
  },
});
