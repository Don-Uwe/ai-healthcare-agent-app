import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface Props {
  visible: boolean;
  onContinue: () => void;
  onCancel: () => void;
}

const SecurityWarningModal: React.FC<Props> = ({
  visible,
  onContinue,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      onRequestClose={onCancel}
      animationType="fade">
      <View style={styles.modalBackground}>
        <View style={styles.container}>
          <Text style={styles.title}>Security Warning</Text>
          <Text style={styles.message}>
            Do not create an account using the same password as your Google,
            Facebook, or any other authentication account. Please use a unique
            and strong password for this platform. Please do not share your
            password with anyone else.
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              accessibilityLabel="Cancel account creation">
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.continueButton]}
              onPress={onContinue}
              accessibilityLabel="Acknowledge warning and continue">
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
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
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#d9534f',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#444',
    marginBottom: 24,
    lineHeight: 22,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  continueButton: {
    backgroundColor: '#007BFF',
  },
  cancelButtonText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },
  continueButtonText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
});

export default SecurityWarningModal;
