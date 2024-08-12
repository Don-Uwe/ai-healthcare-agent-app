import {StyleSheet, View, BackHandler, Alert} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {PRIMARY_COLOR} from '../helper/Theme';
import ActivityOverview from '../components/ActivityOverview';
import {Tabs, MaterialTabBar} from 'react-native-collapsible-tab-view';
import ArticleCard from '../components/ArticleCard';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ProfileHeader from '../components/ProfileHeader';
import {articles} from '../helper/Utils';
import {getMethodCallwithToken} from '../helper/CallAPI';
import {BASE_URL, GET_PROFILE_API} from '../helper/APIUtils';
import {Article, ProfileScreenProps, User} from '../type';

// Sample article data

const ProfileScreen = ({navigation}: ProfileScreenProps) => {
  const [userData, setUserData] = useState<User>();
  const auth_token = '';
  const getUserProfileData = async () => {
    const data = await getMethodCallwithToken(
      `${BASE_URL + GET_PROFILE_API}`,
      auth_token,
    );
    setUserData(data?.profile);
  };
  useEffect(() => {
    getUserProfileData();
  }, []);

  // Handle back button press to show a confirmation alert before exiting the app
  useEffect(
    () =>
      navigation.addListener('beforeRemove', e => {
        e.preventDefault();
        Alert.alert(
          'Warning',
          'Do you want to exit',
          [
            {text: 'No', onPress: () => null},
            {text: 'Yes', onPress: () => BackHandler.exitApp()},
          ],
          {cancelable: true},
        );
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const isDoctor = userData?.isDoctor!; // Example flag to indicate if the user is a doctor
  const bottomBarHeight = useBottomTabBarHeight(); // Get the bottom tab bar height
  const insets = useSafeAreaInsets(); // Get safe area insets
  // Memoized function to render each article item

  const renderItem = useCallback(({item}: {item: Article}) => {
    return <ArticleCard item={item} navigation={navigation} />;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Function to render the header

  const renderHeader = () => {
    return (
      <ProfileHeader
        isDoctor={isDoctor}
        username={userData?.user_name || ''}
        userhandle={userData?.user_handle || ''}
        profileImg={userData?.Profile_image || ''}
        articlesPosted={userData?.articles.length || 0}
        articlesSaved={userData?.savedArticles.length || 0}
        userPhoneNumber={
          isDoctor ? userData?.contact_detail?.phone_no || '' : ''
        }
        userEmailID={isDoctor ? userData?.contact_detail?.email_id || '' : ''}
        specialization={userData?.specialization || ''}
        experience={userData?.Years_of_experience || 0}
        qualification={userData?.qualification || ''}
        navigation={navigation}
      />
    );
  };
  // Function to render the custom tab bar

  const renderTabBar = props => {
    return (
      <MaterialTabBar
        {...props}
        indicatorStyle={styles.indicatorStyle}
        style={styles.tabBarStyle}
        activeColor={PRIMARY_COLOR}
        inactiveColor="#9098A3"
        labelStyle={styles.labelStyle}
        contentContainerStyle={styles.contentContainerStyle}
      />
    );
  };
  return (
    <View style={styles.container}>
      <View style={[styles.innerContainer, {paddingTop: insets.top}]}>
        <Tabs.Container
          renderHeader={renderHeader}
          renderTabBar={renderTabBar}
          containerStyle={styles.tabsContainer}>
          {/* Tab 1 */}
          <Tabs.Tab name="My Insights">
            <Tabs.ScrollView
              automaticallyAdjustContentInsets={true}
              contentInsetAdjustmentBehavior="always"
              contentContainerStyle={styles.scrollViewContentContainer}>
              <ActivityOverview />
            </Tabs.ScrollView>
          </Tabs.Tab>
          {/* Tab 2 */}
          <Tabs.Tab name="My Articles">
            <Tabs.FlatList
              data={articles}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                styles.flatListContentContainer,
                {paddingBottom: bottomBarHeight + 15},
              ]}
              keyExtractor={item => item?.id}
            />
          </Tabs.Tab>
          {/* Tab 3 */}
          <Tabs.Tab name="Saved Articles">
            <Tabs.FlatList
              data={articles}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                styles.flatListContentContainer,
                {paddingBottom: bottomBarHeight + 15},
              ]}
              keyExtractor={item => item?.id}
            />
          </Tabs.Tab>
        </Tabs.Container>
      </View>
    </View>
  );
};
export default ProfileScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0CAFFF',
  },
  innerContainer: {
    flex: 1,
  },
  tabsContainer: {
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  scrollViewContentContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  flatListContentContainer: {
    paddingHorizontal: 16,
  },
  indicatorStyle: {
    backgroundColor: 'white',
  },
  tabBarStyle: {
    backgroundColor: 'white',
  },
  labelStyle: {
    fontWeight: '600',
    fontSize: 14,
    color: 'black',
    textTransform: 'capitalize',
  },
  contentContainerStyle: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowOpacity: 0,
    shadowOffset: {width: 0, height: 0},
    shadowColor: 'white',
  },
});
