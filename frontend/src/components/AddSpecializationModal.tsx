import React, {useState} from 'react';
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {PRIMARY_COLOR} from '../helper/Theme';

interface AddSpecializationModalProps {
  isModalVisible: boolean;
  handleCloseModal: () => void;
  handleAddSpecialization: (specialization: string) => void;
  setspecialization: (text: string) => void;
  specialization: string;
}

const AddSpecializationModal = ({
  isModalVisible,
  handleCloseModal,
  handleAddSpecialization,
  setspecialization,
  specialization,
}: AddSpecializationModalProps) => {
  const [error, setError] = useState('');

  const validateAndAdd = () => {
    if (!specialization.trim()) {
      setError('Please enter a specialization.');
      return;
    }
    if (specialization.trim().length < 3) {
      setError('Specialization must be at least 3 characters.');
      return;
    }
    setError('');
    handleAddSpecialization(specialization);
  };

  const handleClose = () => {
    setError('');
    handleCloseModal();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isModalVisible}
      style={styles.modal}>
      <View style={styles.overlay} />
      <View style={styles.modalContent}>
        <View style={styles.input}>
          <Text style={styles.inputLabel}>Type of specialization</Text>
          <TextInput
            autoCapitalize="words"
            autoCorrect={true}
            keyboardType="default"
            placeholder="e.g. General Surgery, Cardiology"
            placeholderTextColor="#6b7280"
            value={specialization}
            onChangeText={text => {
              setspecialization(text);
              // Clear error as user types
              if (error) {
                if (!text.trim()) {
                  setError('Please enter a specialization.');
                } else if (text.trim().length < 3) {
                  setError('Specialization must be at least 3 characters.');
                } else {
                  setError('');
                }
              }
            }}
            style={[styles.inputControl, error ? styles.inputControlError : null]}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
        <View style={styles.formAction}>
          <TouchableOpacity onPress={handleClose} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={validateAndAdd}
            style={styles.addBtn}>
            <Text style={styles.addText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AddSpecializationModal;

const styles = StyleSheet.create({
  modal: {
    position: 'relative',
    width: '100%',
    height: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    flex: 1,
    width: '85%',
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    position: 'absolute',
    top: Dimensions.get('window').height / 2.5,
    padding: 10,
    paddingHorizontal: 16,
  },
  input: {
    marginTop: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  inputControl: {
    height: 44,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputControlError: {
    borderColor: '#ef4444',
    borderWidth: 2,
    backgroundColor: '#fef2f2',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 6,
    marginLeft: 2,
  },
  formAction: {
    marginTop: 24,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: PRIMARY_COLOR,
  },
  cancelText: {
    fontSize: 17,
    lineHeight: 24,
    color: PRIMARY_COLOR,
  },
  addBtn: {
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
  addText: {
    fontSize: 17,
    lineHeight: 24,
    color: 'white',
  },
});
