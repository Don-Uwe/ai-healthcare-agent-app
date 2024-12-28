import {StyleSheet, View, BackHandler, Text, Alert, Image} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {PRIMARY_COLOR} from '../helper/Theme';
import ActivityOverview from '../components/ActivityOverview';
import {Tabs, MaterialTabBar} from 'react-native-collapsible-tab-view';
import ArticleCard from '../components/ArticleCard';
import {useSelector} from 'react-redux';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ProfileHeader from '../components/ProfileHeader';
import {GET_PROFILE_API, UPDATE_VIEW_COUNT} from '../helper/APIUtils';
import {ArticleData, ProfileScreenProps, User} from '../type';
import {useMutation, useQuery} from '@tanstack/react-query';
import axios from 'axios';
import Loader from '../components/Loader';
import {useFocusEffect} from '@react-navigation/native';

const ProfileScreen = ({navigation}: ProfileScreenProps) => {
  const {user_id, user_token} = useSelector((state: any) => state.user);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [articleId, setArticleId] = useState<number>();
  const [authorId, setAuthorId] = useState<string>('');
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  //const fallback_profile = require('../assets/avatar.jpg');
  //const user_fallback_profile = Image.resolveAssetSource(fallback_profile).uri;

  // console.log('user fallback profile', user_token);

  const {
    data: user,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ['get-profile'],
    queryFn: async () => {
      const response = await axios.get(`${GET_PROFILE_API}`, {
        headers: {
          Authorization: `Bearer ${user_token}`,
        },
      });
      return response.data.profile as User;
    },
  });

  const onArticleViewed = ({
    articleId,
    authorId,
  }: {
    articleId: number;
    authorId: string;
  }) => {
    setArticleId(articleId);
    setAuthorId(authorId);

    updateViewCountMutation.mutate({
      articleId: Number(articleId),
    });
  };
  const updateViewCountMutation = useMutation({
    mutationKey: ['update-view-count'],
    mutationFn: async ({
      articleId,
    }: // authorId,
    {
      articleId: number;
      //  authorId: string;
    }) => {
      if (user_token === '') {
        Alert.alert('No token found');
        return;
      }
      const res = await axios.post(
        UPDATE_VIEW_COUNT,
        {
          article_id: articleId,
        },
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );

      return res.data.article as ArticleData;
    },
    onSuccess: async data => {
      //  console.log('Article Id', articleId);
      //  console.log('Author Id', authorId);

      navigation.navigate('ArticleScreen', {
        articleId: Number(articleId),
        authorId: authorId,
      });
    },

    onError: error => {
      // console.log('Update View Count Error', error);
      Alert.alert('Internal server error, try again!');
    },
  });
  /*
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', e => {
      e.preventDefault();
      Alert.alert(
        'Warning',
        'Do you want to exit',
        [
          {text: 'No', onPress: () => null},
          {
            text: 'Yes',
            onPress: () => {
              BackHandler.exitApp();
            },
          },
        ],
        {cancelable: true},
      );
    });
    return unsubscribe;
  }, [navigation]);
  */

  const isDoctor = user !== undefined ? user.isDoctor : false;
  const bottomBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  const onRefresh = () => {
    setRefreshing(true);
    refetch();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const renderItem = useCallback(
    ({item}: {item: ArticleData}) => {
      return (
        <ArticleCard
          item={item}
          isSelected={selectedCardId === item._id}
          setSelectedCardId={setSelectedCardId}
          navigation={navigation}
          success={onRefresh}
        />
      );
    },
    [navigation, onRefresh],
  );

  const renderHeader = () => {
    if (user === undefined) {
      return null;
    } // Safeguard to prevent rendering if user is undefined

    return (
      <ProfileHeader
        isDoctor={isDoctor}
        username={user.user_name || ''}
        userhandle={user.user_handle || ''}
        profileImg={
          user.Profile_image ||
          'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500'
        }
        articlesPosted={user.articles ? user.articles.length : 0}
        articlesSaved={user.savedArticles ? user.savedArticles.length : 0}
        userPhoneNumber={isDoctor ? user.contact_detail?.phone_no || '' : ''}
        userEmailID={isDoctor ? user.contact_detail?.email_id || '' : ''}
        specialization={user.specialization || ''}
        experience={user.Years_of_experience || 0}
        qualification={user.qualification || ''}
        navigation={navigation}
        other={true}
        followers={user ? user.followerCount : 0}
        followings={user ? user.followingCount : 0}
      />
    );
  };

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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Loader />
      </View>
    );
  }

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
              <ActivityOverview
                onArticleViewed={onArticleViewed}
                others={false}
                articlePosted={user?.articles ? user.articles.length : 0}
              />
            </Tabs.ScrollView>
          </Tabs.Tab>
          {/* Tab 2 */}
          <Tabs.Tab name="My Articles">
            <Tabs.FlatList
              data={user !== undefined ? user.articles : []}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                styles.flatListContentContainer,
                {paddingBottom: bottomBarHeight + 15},
              ]}
              keyExtractor={item => item?._id}
              refreshing={refreshing}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.message}>No Article Found</Text>
                </View>
              }
            />
          </Tabs.Tab>
          {/* Tab 3 */}
          <Tabs.Tab name="Saved Articles">
            <Tabs.FlatList
              data={user !== undefined ? user.savedArticles : []}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                styles.flatListContentContainer,
                {paddingBottom: bottomBarHeight + 15},
              ]}
              keyExtractor={item => item?._id}
              refreshing={refreshing}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.message}>No Article Found</Text>
                </View>
              }
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

  profileImage: {
    height: 130,
    width: 130,
    borderRadius: 100,
    objectFit: 'cover',
    resizeMode: 'contain',
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
  message: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
