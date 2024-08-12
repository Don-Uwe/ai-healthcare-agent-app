import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import PodcastsScreen from '../screens/PodcastsScreen';
import ProfileScreen from '../screens/ProfileScreen';
// import {KeyboardAvoidingView, StyleSheet} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import TabBar from './TabBar';
import {TouchableOpacity} from 'react-native-gesture-handler';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {View} from 'react-native';
import {TabParamList} from '../type';
const Tab = createBottomTabNavigator<TabParamList>();
const TabNavigation = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={props => <TabBar {...props} />}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false,
          headerStyle: {
            backgroundColor: Colors.darker,
          },
          headerTitleStyle: {
            color: 'white',
          },
        }}
      />
      <Tab.Screen
        name="Podcasts"
        component={PodcastsScreen}
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitleStyle: {
            color: 'white',
          },
          headerRight: () => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginRight: 10,
                gap: 10,
              }}>
              <TouchableOpacity>
                <AntDesign name="search1" color={'white'} size={24} />
              </TouchableOpacity>
              <TouchableOpacity>
                <MaterialCommunityIcons
                  name="dots-vertical"
                  color={'white'}
                  size={24}
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{headerShown: false}}
      />
    </Tab.Navigator>
  );
};
export default TabNavigation;
