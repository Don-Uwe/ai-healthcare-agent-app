import React from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface Props {
  visible: boolean;
  onClick: () => void;
  onClose: () => void;
  message: string;
}

const EmailVerifiedModal: React.FC<Props> = ({
  visible,
  onClick,
  onClose,
  message,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      onRequestClose={onClose}
      animationType="fade">
      <View style={styles.modalBackground}>
        <View style={styles.container}>
          <Image
            source={{uri: 'https://imgur.com/I5lDXoI.png'}}
            style={styles.logo}
          />
          <Text style={styles.title}>Welcome </Text>
          <Text style={styles.message}>
            Registration successful. Please verify your email.
          </Text>
          <TouchableOpacity style={styles.button} onPress={onClick}>
            <Text style={styles.buttonText}>{message}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 40,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    color: '#007BFF',
    marginBottom: 10,
    alignSelf: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    alignSelf: 'center',
  },
});

export default EmailVerifiedModal;
