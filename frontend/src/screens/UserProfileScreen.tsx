import {StyleSheet, View, Text, Alert, TouchableOpacity} from 'react-native';
import React, {useCallback, useState} from 'react';
import {PRIMARY_COLOR} from '../helper/Theme';
import ActivityOverview from '../components/ActivityOverview';
import {Tabs, MaterialTabBar} from 'react-native-collapsible-tab-view';
import ArticleCard from '../components/ArticleCard';
import {useSelector} from 'react-redux';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ProfileHeader from '../components/ProfileHeader';
import {
  EC2_BASE_URL,
  REPOST_ARTICLE,
  UPDATE_VIEW_COUNT,
} from '../helper/APIUtils';
import {ArticleData, UserProfileScreenProp, User} from '../type';
import {useMutation, useQuery} from '@tanstack/react-query';
import axios from 'axios';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Loader from '../components/Loader';
import {useFocusEffect} from '@react-navigation/native';
import Snackbar from 'react-native-snackbar';
import {useSocket} from '../../SocketContext';

const UserProfileScreen = ({navigation, route}: UserProfileScreenProp) => {
  const {authorId, author_handle} = route.params;
  const {user_id, user_handle, user_token} = useSelector(
    (state: any) => state.user,
  );
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [articleId, setArticleId] = useState<number>();
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [repostItem, setRepostItem] = useState<ArticleData | null>(null);
  //const [authorId, setAuthorId] = useState<string>('');
  const socket = useSocket();
  const {
    data: user,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ['get-user-profile'],
    queryFn: async () => {
      let url: string;
      if (authorId) {
        url = `${EC2_BASE_URL}/user/getuserprofile?id=${authorId}`;
      } else if (author_handle) {
        url = `${EC2_BASE_URL}/user/getuserprofile?handle=${author_handle}`;
      } else {
        url = `${EC2_BASE_URL}/user/getuserprofile?id=${user_id}`;
      }
      console.log('User token', user_token);
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${user_token}`,
        },
      });
      return response.data.profile as User;
    },
  });

  //console.log('User', user);
  /*
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', e => {
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
    });
    return unsubscribe;
  }, [navigation]);
  */

  const isDoctor = user !== undefined ? user.isDoctor : false;
  //const bottomBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  const handleRepostAction = (item: ArticleData) => {
    setRepostItem(item);
    repostMutation.mutate({
      articleId: Number(item._id),
    });
  };

  const onArticleViewed = ({
    articleId,
    authorId,
  }: {
    articleId: number;
    authorId: string;
  }) => {
    setArticleId(articleId);
    //setAuthorId(authorId);

    updateViewCountMutation.mutate({
      articleId: Number(articleId),
    });
  };

  const repostMutation = useMutation({
    mutationKey: ['repost-user-article'],
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
        REPOST_ARTICLE,
        {
          articleId: articleId,
        },
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );

      return res.data as any;
    },
    onSuccess: () => {
      //refetch();
      Snackbar.show({
        text: 'Article reposted in your feed',
        duration: Snackbar.LENGTH_SHORT,
      });

      // Emit notification
      if (repostItem) {
        //emitNotification(repostItem);
        socket.emit('notification', {
          type: 'repost',
          userId: user_id,
          authorId: repostItem.authorId,
          postId: repostItem._id,
          message: {
            title: `${user_handle} reposted`,
            body: `${repostItem.title}`,
          },
          authorMessage: {
            title: `${user_handle} reposted your article`,
            body: `${repostItem.title}`,
          },
        });
      }
    },

    onError: error => {
      console.log('Repost Error', error);
      Alert.alert('Internal server error, try again!');
    },
  });

  const updateViewCountMutation = useMutation({
    mutationKey: ['update-view-count-user-profile'],
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
      //console.log('Article Id', articleId);
      //console.log('Author Id', authorId);

      navigation.navigate('ArticleScreen', {
        articleId: Number(articleId),
        authorId: authorId,
      });
    },

    onError: error => {
      console.log('Update View Count Error', error);
      Alert.alert('Internal server error, try again!');
    },
  });

  const onRefresh = () => {
    setRefreshing(true);
    refetch();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      console.log('Current authorId:', authorId); // Check if authorId changes
      refetch();
    }, [refetch, authorId]), // Ensure authorId is a stable value
  );

  const handleReportAction = (item: ArticleData) => {
    navigation.navigate('ReportScreen', {
      articleId: item._id,
      authorId: item.authorId,
      commentId: null
    });
  };

  const renderItem = useCallback(
    ({item}: {item: ArticleData}) => {
      return (
        <ArticleCard
          item={item}
          navigation={navigation}
          success={onRefresh}
          isSelected={selectedCardId.toString() === item._id.toString()}
          setSelectedCardId={setSelectedCardId}
          handleRepostAction={handleRepostAction}
          handleReportAction={handleReportAction}
        />
      );
    },
    [navigation, onRefresh, selectedCardId],
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
        other={false}
        followers={user ? user.followers.length : 0}
        followings={user ? user.followings.length : 0}
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
      <TouchableOpacity
        style={styles.headerLeftButtonEditorScreen}
        onPress={() => {
          // console.log('States', navigation.getState());
          // console.log('Can go back', navigation.canGoBack());
          navigation.goBack();
        }}>
        <FontAwesome6 size={25} name="arrow-left" color="white" />
      </TouchableOpacity>
      <View style={[styles.innerContainer, {paddingTop: insets.top}]}>
        <Tabs.Container
          renderHeader={renderHeader}
          renderTabBar={renderTabBar}
          containerStyle={styles.tabsContainer}>
          {/* Tab 1 */}
          <Tabs.Tab name="User Insights">
            <Tabs.ScrollView
              automaticallyAdjustContentInsets={true}
              contentInsetAdjustmentBehavior="always"
              contentContainerStyle={styles.scrollViewContentContainer}>
              <ActivityOverview
                onArticleViewed={onArticleViewed}
                others={true}
                userId={user?._id}
                articlePosted={user?.articles ? user.articles.length : 0}
              />
            </Tabs.ScrollView>
          </Tabs.Tab>
          {/* Tab 2 */}
          <Tabs.Tab name="User Articles">
            <Tabs.FlatList
              data={user !== undefined ? user.articles : []}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                styles.flatListContentContainer,
                {paddingBottom: 15},
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

          <Tabs.Tab name="Reposts">
            <Tabs.FlatList
              data={user !== undefined ? user.repostArticles : []}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                styles.flatListContentContainer,
                {paddingBottom: 15},
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

export default UserProfileScreen;

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
  headerLeftButtonEditorScreen: {
    marginLeft: 15,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
});
