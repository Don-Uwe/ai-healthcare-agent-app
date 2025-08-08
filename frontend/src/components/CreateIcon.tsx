import {SafeAreaView, StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import {PRIMARY_COLOR} from '../helper/Theme';
import {AddIconProp} from '../type';

const CreateIcon = ({callback}: AddIconProp) => {
  return (
    <SafeAreaView style={styles.firstcontaner}>
      <TouchableOpacity style={styles.circleview} onPress={callback}>
        <FontAwesome6 name="add" size={28} color='white' />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default CreateIcon;

const styles = StyleSheet.create({
  firstcontaner: {
    flex: 1,
  },
  circleview: {
    height: 58,
    width: 58,
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 30,
    elevation: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
