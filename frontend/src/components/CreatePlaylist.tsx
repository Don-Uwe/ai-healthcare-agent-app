import React from 'react';
import {Modal, View, Text, StyleSheet, Dimensions} from 'react-native';

interface Props {
  podcast_ids: string[];
  visible: boolean;
  dismiss: () => void;
}
export default function CreatePlaylist({podcast_ids, visible, dismiss}: Props) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      style={styles.modal}
      visible={visible}
      onDismiss={dismiss}>
        <View style={styles.overlay} />
      <View style={styles.modalContent}>
        <Text>Coming soon</Text>
      </View>
    </Modal>
  );
}
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
});
