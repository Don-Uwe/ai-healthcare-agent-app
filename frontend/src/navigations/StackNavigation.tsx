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
import ReportScreen from '../screens/report/ReportScreen';
import ReportConfirmationScreen from '../screens/report/ReportConfirmationScreen';
import NotificationScreen from '../screens/NotificationScreen';
import EditorScreen from '../screens/article/EditorScreen';
import PreviewScreen from '../screens/article/PreviewScreen';
import ArticleScreen from '../screens/article/ArticleScreen';
import {
  TouchableOpacity,
  StyleSheet,
  Alert,
  BackHandler,
  Pressable,
} from 'react-native';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicon from '@expo/vector-icons/Ionicons';
import ArticleDescriptionScreen from '../screens/article/ArticleDescriptionScreen';
import ProfileEditScreen from '../screens/ProfileEditScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import {RootStackParamList, TabParamList} from '../type';
import {PRIMARY_COLOR} from '../helper/Theme';
import LogoutScreen from '../screens/auth/LogoutScreen';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import OverviewScreen from '../screens/overview/OverviewScreen';
import ReviewScreen from '../screens/overview/ReviewScreen';
import ImprovementReviewScreen from '../screens/overview/ImprovementReviewScreen';
import SocialScreen from '../screens/SocialScreen';
import {useQueryClient} from '@tanstack/react-query';
import RenderSuggestion from '../screens/article/RenderSuggestion';
import PodcastDetail from '../screens/PodcastDetail';
import OfflinePodcastList from '../screens/OfflinePodcastList';
import OfflinePodcastDetail from '../screens/OfflinePodcastDetails';
import PodcastDiscussion from '../screens/PodcastDiscussion';
import PodcastSearch from '../screens/PodcastSearch';
import PodcastRecorder from '../screens/PodcastRecorder';
import PodcastForm from '../screens/PodcastForm';
import PodcastPlayer from '../screens/PodcastPlayer';
import PodcastProfile from '../screens/PodcastProfile';
import PrivacyPolicyScreen from '../screens/PrivacyPolicy';
import ContributorPage from '../screens/ContributorPage';
import OpenSourcePage from '../screens/OpenSourcePage';

const Stack = createStackNavigator<RootStackParamList>();

const StackNavigation = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const nav = useNavigation<NavigationProp<TabParamList>>();
  const queryClient = useQueryClient();
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
        name="PodcastPlayer"
        component={PodcastPlayer}
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
          headerTintColor: 'white',
          headerTransparent: false,
          headerStyle: {
            backgroundColor: '#000A60',
          },
          // eslint-disable-next-line react/no-unstable-nested-components
          headerLeft: () => (
            <TouchableOpacity
              style={styles.headerLeftButtonEditorScreen}
              onPress={() => {
                navigation.goBack();
              }}>
              <FontAwesome6 size={25} name="arrow-left" color="white" />
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

          headerTintColor: 'white',
          headerTransparent: false,
          headerStyle: {
            backgroundColor: '#000A60',
          },
          // eslint-disable-next-line react/no-unstable-nested-components
          headerLeft: () => (
            <TouchableOpacity
              style={styles.headerLeftButtonEditorScreen}
              onPress={() => {
                navigation.goBack();
              }}>
              <Ionicon name="arrow-back" size={36} color={'white'} />
              {/* <FontAwesome6 size={25} name="arrow-left" color="black" /> */}
            </TouchableOpacity>
          ),
        })}
      />

      <Stack.Screen
        name="PodcastForm"
        component={PodcastForm}
        options={({navigation}) => ({
          headerShown: true,
          headerTitle: 'Start Podcasting',
          headerBackTitleVisible: false,
          headerTitleStyle: {color: '#ffffff'},
          headerStyle: {
            backgroundColor: '#000A60',
          },
          headerLeft: () => (
            <TouchableOpacity
              style={styles.headerLeftButtonEditorScreen}
              onPress={() => {
                navigation.goBack();
              }}>
              <Ionicon name="arrow-back" size={36} color={'#ffffff'} />
              {/* <FontAwesome6 size={25} name="arrow-left" color="black" /> */}
            </TouchableOpacity>
          ),
        })}
      />

      <Stack.Screen
        name="PodcastSearch"
        component={PodcastSearch}
        options={{
          headerShown: false,
          headerTitle: 'Search Podcast',
          headerStyle: {
            backgroundColor: '#000A60',
          },
          headerTitleStyle: {color: 'white'},

          headerLeft: () => (
            <TouchableOpacity
              style={styles.headerLeftButtonEditorScreen}
              onPress={() => {
                navigation.goBack();
              }}>
              <Ionicon name="arrow-back" size={36} color={'white'} />
              {/* <FontAwesome6 size={25} name="arrow-left" color="black" /> */}
            </TouchableOpacity>
          ),
        }}
      />

      <Stack.Screen
        name="PreviewScreen"
        component={PreviewScreen}
        options={({navigation}) => ({
          headerShown: true,
          headerTitle: 'Preview your post',
          headerBackTitleVisible: false,
          headerTintColor: 'white',
          headerTransparent: false,
          headerStyle: {
            backgroundColor: '#000A60',
          },
          // eslint-disable-next-line react/no-unstable-nested-components
          headerLeft: () => (
            <TouchableOpacity
              style={styles.headerLeftButtonEditorScreen}
              onPress={() => {
                navigation.goBack();
              }}>
              <FontAwesome6 size={25} name="arrow-left" color={'white'} />
            </TouchableOpacity>
          ),
        })}
      />

      <Stack.Screen
        name="OfflinePodcastList"
        component={OfflinePodcastList}
        options={({navigation}) => ({
          headerShown: true,
          headerTitle: 'Downloaded Podcasts',
          headerTintColor: '#ffffff',
          headerBackTitleVisible: false,
          headerTransparent: true,
          headerStyle: {
            backgroundColor: '#000A60',
          },
          // eslint-disable-next-line react/no-unstable-nested-components
          headerLeft: () => (
            <TouchableOpacity
              style={styles.headerLeftButtonEditorScreen}
              onPress={() => {
                navigation.goBack();
              }}>
              <FontAwesome6 size={25} name="arrow-left" color={'#ffffff'} />
            </TouchableOpacity>
          ),
        })}
      />

      <Stack.Screen
        name="OfflinePodcastDetail"
        component={OfflinePodcastDetail}
        options={({navigation}) => ({
          headerShown: true,
          headerTitle: '',
          headerBackTitleVisible: false,
          headerTransparent: true,
          // eslint-disable-next-line react/no-unstable-nested-components
          headerLeft: () => (
            <TouchableOpacity
              style={styles.headerLeftButtonEditorScreen}
              onPress={() => {
                navigation.goBack();
              }}>
              <FontAwesome6 size={25} name="arrow-left" color={'white'} />
            </TouchableOpacity>
          ),
        })}
      />

      <Stack.Screen
        name="RenderSuggestion"
        component={RenderSuggestion}
        options={({navigation}) => ({
          headerShown: true,
          headerTitle: 'Suggestions',
          headerBackTitleVisible: false,
          headerTintColor: 'white',
          headerTransparent: false,
          headerStyle: {
            backgroundColor: '#000A60',
          },
          // eslint-disable-next-line react/no-unstable-nested-components
          headerLeft: () => (
            <TouchableOpacity
              style={styles.headerLeftButtonEditorScreen}
              onPress={() => {
                navigation.goBack();
              }}>
              <FontAwesome6 size={25} name="arrow-left" color={'white'} />
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
        name="PodcastDetail"
        component={PodcastDetail}
        options={({navigation}) => ({
          headerShown: false,
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
        name="ReviewScreen"
        component={ReviewScreen}
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
        name="PodcastRecorder"
        component={PodcastRecorder}
        options={{headerShown: false}}
      />

        <Stack.Screen
        name="ContributorPage"
        component={ContributorPage}
        options={{headerShown: false}}
      />

        <Stack.Screen
        name="OpenSourcePage"
        component={OpenSourcePage}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="ImprovementReviewScreen"
        component={ImprovementReviewScreen}
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
          headerTitle: 'Leave a feedback',
          headerTintColor: 'white',
          headerTransparent: false,
          headerStyle: {
            backgroundColor: '#000A60',
          },
          headerBackTitleVisible: false,
          // eslint-disable-next-line react/no-unstable-nested-components
          headerLeft: () => (
            <TouchableOpacity
              style={styles.headerLeftButtonCommentScreen}
              onPress={() => {
                queryClient.invalidateQueries({queryKey: ['get-user-socials']});
                navigation.goBack();
              }}>
              <FontAwesome6 size={25} name="arrow-left" color={'white'} />
            </TouchableOpacity>
          ),
        })}
      />

      <Stack.Screen
        name="PodcastDiscussion"
        component={PodcastDiscussion}
        options={({navigation}) => ({
          headerShown: true,
          headerTitle: 'Start Discussion',
          headerTintColor: 'white',
          headerTransparent: false,
          headerStyle: {
            backgroundColor: '#000A60',
          },
          headerBackTitleVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              style={styles.headerLeftButtonCommentScreen}
              onPress={() => {
                queryClient.invalidateQueries({queryKey: ['get-user-socials']});
                navigation.goBack();
              }}>
              <FontAwesome6 size={25} name="arrow-left" color={'white'} />
            </TouchableOpacity>
          ),
        })}
      />

      <Stack.Screen
        name="PodcastProfile"
        component={PodcastProfile}
        options={({navigation}) => ({
          headerShown: true,
          headerTitle: 'Profile',
          headerTintColor: 'white',
          headerTransparent: false,
          headerStyle: {
            backgroundColor: '#000A60',
          },
          headerBackTitleVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              style={styles.headerLeftButtonCommentScreen}
              onPress={() => {
                queryClient.invalidateQueries({queryKey: ['get-user-socials']});
                navigation.goBack();
              }}>
              <FontAwesome6 size={25} name="arrow-left" color={'white'} />
            </TouchableOpacity>
          ),
        })}
      />

      <Stack.Screen
        name="NotificationScreen"
        component={NotificationScreen}
        options={({navigation}) => ({
          headerShown: true,
          headerTitle: 'Notifications',
          //headerTransparent: true,
          headerTitleAlign: 'center',
          headerBackTitleVisible: false,
          headerTintColor: 'white',
          headerTransparent: false,

          headerStyle: {
            elevation: 4,

            backgroundColor: '#000A60',
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.25,
            shadowRadius: 3.5,
          },
          // eslint-disable-next-line react/no-unstable-nested-components
          headerLeft: () => (
            <TouchableOpacity
              style={styles.headerLeftButtonCommentScreen}
              onPress={() => {
                navigation.goBack();
              }}>
              <FontAwesome6 size={25} name="arrow-left" color={'white'} />
            </TouchableOpacity>
          ),
        })}
      />

      <Stack.Screen
        name="Privacy"
        component={PrivacyPolicyScreen}
        options={({navigation}) => ({
          headerShown: true,
          headerTitle: 'Terms and Conditions',
          //headerTransparent: true,
          headerTitleAlign: 'center',
          headerBackTitleVisible: false,
          headerTintColor: 'white',
          headerTransparent: false,

          headerStyle: {
            elevation: 4,

            backgroundColor: '#000A60',
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.25,
            shadowRadius: 3.5,
          },
          // eslint-disable-next-line react/no-unstable-nested-components
          headerLeft: () => (
            <TouchableOpacity
              style={styles.headerLeftButtonCommentScreen}
              onPress={() => {
                navigation.goBack();
              }}>
              <FontAwesome6 size={25} name="arrow-left" color={'white'} />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="ReportScreen"
        component={ReportScreen}
        options={({navigation}) => ({
          headerShown: true,
          headerTitle: 'Report',
          //headerTransparent: true,
          headerTitleAlign: 'center',
          headerBackTitleVisible: false,
          headerStyle: {
            elevation: 4, // Elevation for Android
            // backgroundColor:'red',
            shadowColor: '#000', // Shadow color for iOS
            shadowOffset: {width: 0, height: 2}, // Shadow offset for iOS
            shadowOpacity: 0.25, // Shadow opacity for iOS
            shadowRadius: 3.5, // Shadow radius for iOS
          },
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
        name="ReportConfirmationScreen"
        component={ReportConfirmationScreen}
        options={({navigation}) => ({
          headerShown: true,
          headerTitle: 'Confirmation',
          //headerTransparent: true,
          headerTitleAlign: 'center',
          headerBackTitleVisible: false,
          headerStyle: {
            elevation: 4, // Elevation for Android
            // backgroundColor:'red',
            shadowColor: '#000', // Shadow color for iOS
            shadowOffset: {width: 0, height: 2}, // Shadow offset for iOS
            shadowOpacity: 0.25, // Shadow opacity for iOS
            shadowRadius: 3.5, // Shadow radius for iOS
          },
          // eslint-disable-next-line react/no-unstable-nested-components
          headerLeft: () => (
            <Pressable
              style={styles.headerLeftButtonCommentScreen}
              onPress={() => {
                // navigation.goBack();
              }}>
              <FontAwesome6 size={25} name="arrow-left" color={'white'} />
            </Pressable>
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
        name="OverviewScreen"
        component={OverviewScreen}
        options={({navigation}) => ({
          headerShown: false,
          headerTitle: 'Overview',
          //headerTransparent: true,
          headerTitleAlign: 'center',
          headerBackTitleVisible: false,
          headerStyle: {
            elevation: 4, // Elevation for Android
            // backgroundColor:'red',
            shadowColor: '#000', // Shadow color for iOS
            shadowOffset: {width: 0, height: 2}, // Shadow offset for iOS
            shadowOpacity: 0.25, // Shadow opacity for iOS
            shadowRadius: 3.5, // Shadow radius for iOS
          },
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

      {/* <Stack.Screen
        name="ConversationScreen"
        component={ConversationScreen}
        options={{
          headerShown: false,
        }}
      /> */}

      <Stack.Screen
        name="SocialScreen"
        component={SocialScreen}
        options={({navigation}) => ({
          headerShown: true,
          // headerTitle: 'Followers',
          //headerTransparent: true,
          headerTitleAlign: 'center',
          headerBackTitleVisible: false,
          headerStyle: {
            elevation: 4, // Elevation for Android
            // backgroundColor:'red',
            shadowColor: '#000', // Shadow color for iOS
            shadowOffset: {width: 0, height: 2}, // Shadow offset for iOS
            shadowOpacity: 0.25, // Shadow opacity for iOS
            shadowRadius: 3.5, // Shadow radius for iOS
          },
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
    paddingHorizontal: 15,
    paddingVertical: 6,
  },

  headerLeftButtonCommentScreen: {
    marginStart: 15,
    //backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 4,
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
