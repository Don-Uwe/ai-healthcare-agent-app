import React, {useEffect} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import TabNavigation from './TabNavigation';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreenFirst from '../screens/auth/SignUpScreenFirst';
import SignUpScreenSecond from '../screens/auth/SignUpScreenSecond';
import OtpScreen from '../screens/auth/OtpScreen';
import NewPasswordScreen from '../screens/auth/NewPasswordScreen';
import CommentScreen from '../screens/CommentScreen';
import NotificationScreen from '../screens/NotificationScreen';
import EditorScreen from '../screens/article/EditorScreen';
import PreviewScreen from '../screens/article/PreviewScreen';
import ArticleScreen from '../screens/article/ArticleScreen';
import {TouchableOpacity, StyleSheet, Alert, BackHandler} from 'react-native';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Ionicon from 'react-native-vector-icons/Ionicons';
import ArticleDescriptionScreen from '../screens/article/ArticleDescriptionScreen';
import ProfileEditScreen from '../screens/ProfileEditScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import {RootStackParamList, TabParamList} from '../type';
import {PRIMARY_COLOR} from '../helper/Theme';
import LogoutScreen from '../screens/auth/LogoutScreen';
import {useNavigation, NavigationProp} from '@react-navigation/native';
const Stack = createStackNavigator<RootStackParamList>();

const StackNavigation = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const nav = useNavigation<NavigationProp<TabParamList>>();

  useEffect(() => {
    const backAction = () => {
      const currentRoute =
        navigation?.getState()?.routes[navigation?.getState()?.index || 0]
          ?.name;
      const currTab = nav?.getState().routes[nav?.getState()?.index || 0]?.name;

      //console.log('Current Route', currentRoute);
      //console.log('Current Route', currTab);
      if (
        currentRoute === 'TabNavigation' ||
        currentRoute === 'LoginScreen' ||
        currTab === 'Home' ||
        currTab === 'Podcasts' ||
        currTab === 'Profile'
      ) {
        Alert.alert('Warning', 'Do you want to exit?', [
          {text: 'No', onPress: () => null},
          {text: 'Yes', onPress: () => BackHandler.exitApp()},
        ]);
        return true; // Prevent default behavior
      } else if (navigation.canGoBack()) {
        navigation.goBack(); // Allow back navigation for other screens
      } else {
        Alert.alert('Warning', 'Do you want to exit?', [
          {text: 'No', onPress: () => null},
          {text: 'Yes', onPress: () => BackHandler.exitApp()},
        ]);
        return true; // Prevent default behavior
      }
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler;
  }, [navigation, nav]);
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SplashScreen"
        component={SplashScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="TabNavigation"
        component={TabNavigation}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="LoginScreen"
        component={LoginScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="SignUpScreenFirst"
        component={SignUpScreenFirst}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="SignUpScreenSecond"
        component={SignUpScreenSecond}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="OtpScreen"
        component={OtpScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="NewPasswordScreen"
        component={NewPasswordScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="EditorScreen"
        component={EditorScreen}
        options={({navigation}) => ({
          headerShown: true,
          headerTitle: 'Write your post',
          headerBackTitleVisible: false,
          // eslint-disable-next-line react/no-unstable-nested-components
          headerLeft: () => (
            <TouchableOpacity
              style={styles.headerLeftButtonEditorScreen}
              onPress={() => {
                navigation.goBack();
              }}>
              <FontAwesome6 size={25} name="arrow-left" color="black" />
            </TouchableOpacity>
          ),
        })}
      />

      <Stack.Screen
        name="ArticleDescriptionScreen"
        component={ArticleDescriptionScreen}
        options={({navigation}) => ({
          headerShown: true,
          headerTitle: 'Start Writing',
          headerBackTitleVisible: false,
          headerTitleStyle: {color: PRIMARY_COLOR},
          // eslint-disable-next-line react/no-unstable-nested-components
          headerLeft: () => (
            <TouchableOpacity
              style={styles.headerLeftButtonEditorScreen}
              onPress={() => {
                navigation.goBack();
              }}>
              <Ionicon name="chevron-back" size={26} color={PRIMARY_COLOR} />
              {/* <FontAwesome6 size={25} name="arrow-left" color="black" /> */}
            </TouchableOpacity>
          ),
        })}
      />

      <Stack.Screen
        name="PreviewScreen"
        component={PreviewScreen}
        options={({navigation}) => ({
          headerShown: true,
          headerTitle: '',
          headerBackTitleVisible: false,
          // eslint-disable-next-line react/no-unstable-nested-components
          headerLeft: () => (
            <TouchableOpacity
              style={styles.headerLeftButtonEditorScreen}
              onPress={() => {
                navigation.goBack();
              }}>
              <FontAwesome6 size={25} name="arrow-left" color={PRIMARY_COLOR} />
            </TouchableOpacity>
          ),
        })}
      />

      <Stack.Screen
        name="ArticleScreen"
        component={ArticleScreen}
        options={({navigation}) => ({
          headerShown: true,
          headerTitle: '',
          headerTransparent: true,
          headerBackTitleVisible: false,
          // eslint-disable-next-line react/no-unstable-nested-components
          headerLeft: () => (
            <TouchableOpacity
              style={styles.headerLeftButton}
              onPress={() => {
                navigation.goBack();
              }}>
              <FontAwesome6 size={25} name="arrow-left" color="white" />
            </TouchableOpacity>
          ),
        })}
      />

      <Stack.Screen
        name="CommentScreen"
        component={CommentScreen}
        options={({navigation}) => ({
          headerShown: true,
          headerTitle: '',
          headerTransparent: true,
          headerBackTitleVisible: false,
          // eslint-disable-next-line react/no-unstable-nested-components
          headerLeft: () => (
            <TouchableOpacity
              style={styles.headerLeftButtonCommentScreen}
              onPress={() => {
                navigation.goBack();
              }}>
              <FontAwesome6 size={25} name="arrow-left" color={PRIMARY_COLOR} />
            </TouchableOpacity>
          ),
        })}
      />

      <Stack.Screen
        name="NotificationScreen"
        component={NotificationScreen}
        options={({navigation}) => ({
          headerShown: true,
          headerTitle: '',
          headerTransparent: true,
          headerBackTitleVisible: false,
          // eslint-disable-next-line react/no-unstable-nested-components
          headerLeft: () => (
            <TouchableOpacity
              style={styles.headerLeftButtonCommentScreen}
              onPress={() => {
                navigation.goBack();
              }}>
              <FontAwesome6 size={25} name="arrow-left" color={PRIMARY_COLOR} />
            </TouchableOpacity>
          ),
        })}
      />

      <Stack.Screen
        name="UserProfileScreen"
        component={UserProfileScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ProfileEditScreen"
        component={ProfileEditScreen}
        options={({navigation}) => ({
          headerShown: true,
          title: 'Edit Profile',
          headerBackTitleVisible: false,
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              style={styles.profileScreenHeaderLeftButton}
              onPress={() => {
                navigation.goBack();
              }}>
              <FontAwesome6 size={25} name="arrow-left" color="black" />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="LogoutScreen"
        component={LogoutScreen}
        options={{
          headerShown: false,
        }}
      />
      {/* <Stack.Screen
        name="ChatbotScreen"
        component={ChatbotScreen}
        options={({navigation}) => ({
          headerTitleAlign: 'center',
          title: 'Chatbot',
          headerShown: true,
          headerBackTitleVisible: false,
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              style={{
                marginLeft: 15,
                height: 40,
                width: 40,
                borderRadius: 50,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'white',
              }}
              onPress={() => {
                navigation.goBack();
              }}>
              <FontAwesome6 size={20} name="arrow-left" color="black" />
            </TouchableOpacity>
          ),
        })}
      /> */}
    </Stack.Navigator>
  );
};
const styles = StyleSheet.create({
  headerLeftButton: {
    marginLeft: 15,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 50,
  },
  headerLeftButtonEditorScreen: {
    marginLeft: 15,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  headerLeftButtonCommentScreen: {
    marginLeft: 15,
    paddingHorizontal: 6,
    paddingVertical: 6,
    marginTop: 0,
  },
  profileScreenHeaderLeftButton: {
    marginLeft: 15,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 50,
  },
  dropdown: {
    height: 40,
    // borderColor: '#0CAFFF',
    // borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: 17,
    marginBottom: 20,
    paddingRight: 12,
    width: 150,
    backgroundColor: 'rgb(229, 233, 241)',
  },
  placeholderStyle: {
    fontSize: 15,
    color: 'black',
  },
});
export default StackNavigation;
