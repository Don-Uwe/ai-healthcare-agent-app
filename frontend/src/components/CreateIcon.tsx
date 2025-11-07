import { StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';
import Entypo from '@expo/vector-icons/Entypo';
import {BUTTON_COLOR, PRIMARY_COLOR} from '../helper/Theme';
import {AddIconProp} from '../type';
import { SafeAreaView } from 'react-native-safe-area-context';

const CreateIcon = ({callback}: AddIconProp) => {
  return (
    <SafeAreaView style={styles.firstcontaner}>
      <TouchableOpacity style={styles.circleview} onPress={callback}>
        <Entypo name="modern-mic" size={28} color='white' />
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
    backgroundColor: BUTTON_COLOR,
    borderRadius: 30,
    elevation: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
