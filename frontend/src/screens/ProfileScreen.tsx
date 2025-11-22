import {StyleSheet, View, Text, Alert} from 'react-native';
import React, {useCallback, useState} from 'react';
import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../helper/Theme';
import ActivityOverview from '../components/ActivityOverview';
import {Tabs, MaterialTabBar} from 'react-native-collapsible-tab-view';
import ArticleCard from '../components/ArticleCard';
import {useDispatch, useSelector} from 'react-redux';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ProfileHeader from '../components/ProfileHeader';
import {
  GET_PROFILE_API,
  REPOST_ARTICLE,
  UPDATE_VIEW_COUNT,
} from '../helper/APIUtils';
import {ArticleData, ProfileScreenProps, User} from '../type';
import {useMutation, useQuery} from '@tanstack/react-query';
import axios from 'axios';
import Loader from '../components/Loader';
import {useFocusEffect} from '@react-navigation/native';
import Snackbar from 'react-native-snackbar';
import {useSocket} from '../../SocketContext';
import {setUserHandle} from '../store/UserSlice';
import { StatusBar } from 'expo-status-bar';

const ProfileScreen = ({navigation}: ProfileScreenProps) => {
  const {user_handle, user_id, user_token} = useSelector(
    (state: any) => state.user,
  );
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [articleId, setArticleId] = useState<number>();
  const [authorId, setAuthorId] = useState<string>('');
  const [recordId, setRecordId] = useState<string>('');
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [repostItem, setRepostItem] = useState<ArticleData | null>(null);
  const socket = useSocket();
  const dispatch = useDispatch();

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

  if (user) {
    dispatch(setUserHandle(user.user_handle));
  }
  const onArticleViewed = ({
    articleId,
    authorId,
    recordId
  }: {
    articleId: number;
    authorId: string;
    recordId: string
  }) => {
    setArticleId(articleId);
    setAuthorId(authorId);
    setRecordId(recordId);

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

      navigation.navigate('ArticleScreen', {
        articleId: Number(articleId),
        authorId: authorId,
        recordId: recordId
      });
    },

    onError: error => {
      // console.log('Update View Count Error', error);
      Alert.alert('Internal server error, try again!');
    },
  });
  

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

  const handleRepostAction = (item: ArticleData) => {
    setRepostItem(item);
    repostMutation.mutate({
      articleId: Number(item._id),
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
      refetch();
      Snackbar.show({
        text: 'Article reposted in your feed',
        duration: Snackbar.LENGTH_SHORT,
      });

      if (repostItem) {
        //emitNotification(repostItem);
        socket.emit('notification', {
          type: 'repost',
          userId: user_id,
          authorId: repostItem.authorId,
          postId: repostItem._id,
          articleRecordId: repostItem.pb_recordId,
          message: {
            title: `${user_handle} reposted`,
            message: `${repostItem.title}`,
          },
          authorMessage: {
            title: `${user_handle} reposted your article`,
            message: `${repostItem.title}`,
          },
        });
      }

      // Emit notification
    },

    onError: error => {
      console.log('Repost Error', error);
      Alert.alert('Internal server error, try again!');
    },
  });
  const handleReportAction = (item: ArticleData) => {
    navigation.navigate('ReportScreen', {
      articleId: item._id,
      authorId: item.authorId as string,
      commentId: null,
      podcastId: null
    });
  };
  const renderItem = useCallback(
    ({item}: {item: ArticleData}) => {
      return (
        <ArticleCard
          item={item}
          isSelected={selectedCardId === item._id}
          setSelectedCardId={setSelectedCardId}
          navigation={navigation}
          success={onRefresh}
          handleRepostAction={handleRepostAction}
          handleReportAction={handleReportAction}
          handleEditRequestAction={() => {}}
        />
      );
    },
    [selectedCardId, navigation, onRefresh, handleRepostAction, handleReportAction],
  );

  const onFollowerClick = () => {
    if (user && user.followers.length > 0) {
      //dispatch(setSocialUserId(''));
      navigation.navigate('SocialScreen', {
        type: 1,
        articleId: undefined,
        social_user_id: undefined,
      });
    }
  };

  const onFollowingClick = () => {
    if (user && user.followings.length > 0) {
      // dispatch(setSocialUserId(''));
      navigation.navigate('SocialScreen', {
        type: 2,
        articleId: undefined,
        social_user_id: undefined,
      });
    }
  };

  const renderHeader = () => {
    if (user === undefined) {
      return null;
    }

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
        followers={user ? user.followers.length : 0}
        followings={user ? user.followings.length : 0}
        onFollowerPress={onFollowerClick}
        onFollowingPress={onFollowingClick}
        isFollowing={false}
        onFollowClick={() => {}}
        onOverviewClick={() => {
          if (user) {
            //navigation.navigate('OverviewScreen', {articles: user.articles});
            navigation.navigate('OverviewScreen');
          }
        }}
        improvementPublished={user ? user.improvements.length : 0}
      />
    );
  };

  const renderTabBar = (props:any) => {
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
          <Tabs.Tab name="Insight">
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
      
          <Tabs.Tab name={`Reposts (${user?.repostArticles.length})`}>
            <Tabs.FlatList
              data={user !== undefined ? user.repostArticles : []}
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
          <Tabs.Tab name={`Saved(${user?.savedArticles.length})`}>
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
  //  backgroundColor: '#0CAFFF',
  },
  innerContainer: {
    flex: 1,
  //  backgroundColor: ON_PRIMARY_COLOR,
  },
  tabsContainer: {
  //  backgroundColor: ON_PRIMARY_COLOR,
    overflow: 'hidden',
  },
  scrollViewContentContainer: {
    paddingHorizontal: 6,
    marginTop: 6,
    //backgroundColor: ON_PRIMARY_COLOR,
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
    //backgroundColor: ON_PRIMARY_COLOR,
  },
  labelStyle: {
    fontWeight: '600',
    fontSize: 15,
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
