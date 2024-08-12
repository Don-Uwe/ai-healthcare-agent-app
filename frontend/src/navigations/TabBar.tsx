import React from 'react';
import {View, Pressable, StyleSheet, useColorScheme} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {PRIMARY_COLOR} from '../helper/Theme';

import Ionicons from 'react-native-vector-icons/Ionicons';
const TabBar = ({state, descriptors, navigation}: any) => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View
      style={[
        styles.mainContainer,
        {backgroundColor: isDarkMode ? 'black' : 'white'},
      ]}>
      {state.routes.map((route: any, index: number) => {
        const {options} = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <View
            key={index}
            style={[
              styles.mainItemContainer,
              {borderRightWidth: label == 'notes' ? 3 : 0},
            ]}>
            <Pressable
              onPress={onPress}
              style={{
                backgroundColor: isFocused
                  ? PRIMARY_COLOR
                  : isDarkMode
                  ? 'black'
                  : 'white',
                borderRadius: 50,
                width: 40,
                height: 40,
                justifyContent: 'center',
                alignItems: 'center',
                padding: 5,
              }}>
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  flex: 1,
                  //   padding: 10,
                }}>
                {label === 'Home' && (
                  <Ionicons
                    name="home"
                    size={24}
                    color={isFocused ? 'white' : isDarkMode ? 'white' : 'black'}
                  />
                )}
                {label === 'Podcasts' && (
                  <FontAwesome
                    name="podcast"
                    size={24}
                    color={isFocused ? 'white' : isDarkMode ? 'white' : 'black'}
                  />
                )}
                {label === 'Profile' && (
                  <FontAwesome
                    name="user-circle"
                    size={24}
                    color={isFocused ? 'white' : isDarkMode ? 'white' : 'black'}
                  />
                )}
              </View>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingBottom: 8,
    backgroundColor: 'red',
    borderWidth: 0.19,
  },
  mainItemContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 7,
    borderRadius: 1,
    borderColor: '#333B42',
    zIndex: -2,
  },
});

export default TabBar;
