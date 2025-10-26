import {SafeAreaView, StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import {PRIMARY_COLOR} from '../helper/Theme';
import {AddIconProp} from '../type';

const AddIcon = ({callback}: AddIconProp) => {
  return (
    <SafeAreaView style={styles.firstcontaner}>
      <TouchableOpacity style={styles.circleview} onPress={callback}>
        <FontAwesome6 name="pen" size={24} color={PRIMARY_COLOR} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default AddIcon;

const styles = StyleSheet.create({
  firstcontaner: {
    flex: 1,
  },
  circleview: {
    height: 58,
    width: 58,
    backgroundColor: 'white',
    borderRadius: 30,
    elevation: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
