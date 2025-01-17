import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';

interface ArticleFloatingMenuProp {
  items: Item[];
  top: number;
  left: number; 
}

interface Item {
  name: string;
  action: () => void;
  icon: string;
}

export default function ArticleFloatingMenu(props: ArticleFloatingMenuProp) {
  return (
    <View style={[styles.container, {top: props.top, left: props.left}]}>
      <View style={styles.arrow} />
      {props.items.map((item, index) => (
        <TouchableOpacity key={index} style={styles.box} onPress={item.action}>
          <AntDesign name={item.icon} size={20} color="#1F1F1F" />
          <Text style={styles.text}>{item.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '90%',
    flexDirection: 'column',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 6,
    elevation: 5,
    shadowColor: 'black',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
  },
  arrow: {
    position: 'absolute',
    top: -10, 
    left: '30%',
    marginLeft: -10, 
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'white',
  },
  box: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    //borderWidth: 0.5,
    borderRadius: 4,
    borderColor: '#c1c1c1',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    color: 'black',
    fontWeight: '500',
    marginLeft: 10, 
  },
});
