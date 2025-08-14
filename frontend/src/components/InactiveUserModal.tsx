import React from 'react';
import { Modal, TouchableOpacity, Text, View, StyleSheet, Linking } from 'react-native';
import { hp } from '../helper/Metric';

interface InactiveUserModalProps {
  open: boolean;
  onRequestAdmin: () => void;
  reason?: string;
}

const InactiveUserModal: React.FC<InactiveUserModalProps> = ({
  open,
  reason,
}) => {
  const handleContactSupport = () => {
    Linking.openURL(
      'mailto:ultimatehealth.25@gmail.com?subject=Account%20Restriction%20Inquiry&body=Hello%20Support%2C%0D%0A%0D%0AMy%20account%20has%20been%20restricted.%20Reason%3A%20' +
        encodeURIComponent(reason || 'Blocked/Banned') +
        '.%0D%0A%0D%0APlease%20assist%20me%20with%20this%20issue.%0D%0A%0D%0AThank%20you.'
    );
  };

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={() => {}} // No-op for Android back button
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Account Restricted</Text>
          <Text style={styles.message}>
            Your account has been {reason ? reason : 'blocked or banned'} by the administrator. 
            This may be due to violations of our terms of service, suspicious activity, or other 
            policy-related concerns.  
            If you believe this is a mistake or would like to appeal, please reach out to our 
            support team for assistance.
          </Text>

          <TouchableOpacity onPress={handleContactSupport} style={styles.button} activeOpacity={0.8}>
            <Text style={styles.buttonText}> Contact Support</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 8,
    width: '85%',
    elevation: 5,
  
  },
  title: {
    fontSize: hp(3),
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000',
    textAlign: 'center',
  },
  message: {
    fontSize: hp(2),
    color: '#333',
    marginBottom: 20,
    lineHeight: 20,
    textAlign: 'justify',
  },
  button: {
    backgroundColor: '#1976d2',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: 'center',
    //alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default InactiveUserModal;
