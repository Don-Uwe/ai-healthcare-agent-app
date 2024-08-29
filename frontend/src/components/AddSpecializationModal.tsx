import React from 'react';
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

const AddSpecializationModal = ({
  isModalVisible,
  handleCloseModal,
  handleAddSpecialization,
  setspecialization,
  specialization,
}) => {
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
            placeholder="General Surgeons"
            placeholderTextColor="#6b7280"
            value={specialization}
            onChangeText={text => setspecialization(text)}
            style={styles.inputControl}
          />
        </View>
        <View style={styles.formAction}>
          <TouchableOpacity onPress={handleCloseModal} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              handleAddSpecialization(specialization);
            }}
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
