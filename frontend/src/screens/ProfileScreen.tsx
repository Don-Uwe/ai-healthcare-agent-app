import {StyleSheet, View, Text, Alert, useColorScheme, ScrollView, FlatList, TouchableOpacity} from 'react-native';
import React, {useCallback, useState} from 'react';
import {StatusBar} from 'expo-status-bar';
import {PRIMARY_COLOR} from '../helper/Theme';
import ActivityOverview from '../components/ActivityOverview';
import ArticleCard from '../components/ArticleCard';
import {useDispatch, useSelector} from 'react-redux';
import { useTheme } from 'tamagui';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {SafeAreaView} from 'react-native-safe-area-context';
import ProfileHeader from '../components/ProfileHeader';
import {ArticleData, ProfileScreenProps} from '../type';
import Loader from '../components/Loader';
import {useFocusEffect} from '@react-navigation/native';
import Snackbar from 'react-native-snackbar';
import {setUserHandle} from '../store/UserSlice';
import {useGetProfile} from '../hooks/useGetProfile';
import {useUpdateViewCount} from '../hooks/useUpdateViewCount';
import { NoArticleState } from '../components/EmptyStates';

const ProfileScreen = ({navigation}: ProfileScreenProps) => {
  const theme = useTheme();
  const isDarkMode = useColorScheme() === 'dark';
  const {user_id} = useSelector((state: any) => state.user);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const {isConnected} = useSelector((state: any) => state.network);
  const [articleId, setArticleId] = useState<number>();
  const [authorId, setAuthorId] = useState<string>('');
  const [recordId, setRecordId] = useState<string>('');
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const dispatch = useDispatch();
  const {mutate: updateViewCount} =
    useUpdateViewCount(articleId ?? 0);

  const {data: user, refetch, isLoading} = useGetProfile();

  if (user) {
    dispatch(setUserHandle(user.user_handle));
  }
  const onArticleViewed = ({
    articleId,
    authorId,
    recordId,
  }: {
    articleId: number;
    authorId: string;
    recordId: string;
  }) => {
    if (isConnected) {
      setArticleId(articleId);
      setAuthorId(authorId);
      setRecordId(recordId);

      updateViewCount(Number(articleId), {
        onSuccess: async () => {
          navigation.navigate('ArticleScreen', {
            articleId: Number(articleId),
            authorId: authorId,
            recordId: recordId,
          });
        },

        onError: () => {
          Alert.alert('Internal server error, try again!');
        },
      });
      
    } else {
      Snackbar.show({
        text: 'Please check your internet connection!',
        duration: Snackbar.LENGTH_SHORT,
      });
    }
  };


  const isDoctor = user !== undefined ? user.isDoctor : false;
  const bottomBarHeight = useBottomTabBarHeight();

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


  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleReportAction = (item: ArticleData) => {
    navigation.navigate('ReportScreen', {
      articleId: item._id,
      authorId: item.authorId as string,
      commentId: null,
      podcastId: null,
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
          handleRepostAction={()=>{}}
          handleReportAction={handleReportAction}
          handleEditRequestAction={() => {}}
          source="profile"
        />
      );
    },
    [
      selectedCardId,
      navigation,
      onRefresh,
      handleReportAction,
    ],
  );

  const onFollowerClick = () => {
    if (isConnected) {
      if (user && user.followers.length > 0) {
        //dispatch(setSocialUserId(''));
        navigation.navigate('SocialScreen', {
          type: 1,
          articleId: undefined,
          social_user_id: undefined,
        });
      }
    } else {
      Snackbar.show({
        text: 'Please check your internet connection!',
        duration: Snackbar.LENGTH_SHORT,
      });
    }
  };

  const onFollowingClick = () => {
    if (isConnected) {
      if (user && user.followings.length > 0) {
        // dispatch(setSocialUserId(''));
        navigation.navigate('SocialScreen', {
          type: 2,
          articleId: undefined,
          social_user_id: undefined,
        });
      }
    } else {
      Snackbar.show({
        text: 'Please check your internet connection!',
        duration: Snackbar.LENGTH_SHORT,
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
            if (isConnected) {
              navigation.navigate('OverviewScreen');
            } else {
              Snackbar.show({
                text: 'Please check your internet connection!',
                duration: Snackbar.LENGTH_SHORT,
              });
            }
          }
        }}
      />
    );
  };


  const [activeTab, setActiveTab] = useState<'Insight' | 'Reposts' | 'Saved'>('Insight');

  if (isLoading) {
    return (
      <SafeAreaView
        style={[
          styles.loadingContainer,
          {backgroundColor: theme.background.val},
        ]}>
        <StatusBar
          style={isDarkMode ? 'light' : 'dark'}
          backgroundColor="#007AFF"
        />
        <Loader />
      </SafeAreaView>
    );
  }

  const tabColors = {
    background: isDarkMode ? '#121212' : '#ffffff',
    border: isDarkMode ? '#374151' : '#e5e7eb',
    activeText: PRIMARY_COLOR,
    inactiveText: isDarkMode ? '#9ca3af' : '#9098A3',
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {backgroundColor: isDarkMode ? '#000A60' : PRIMARY_COLOR},
      ]}>
      <StatusBar
        style={isDarkMode ? 'light' : 'dark'}
        backgroundColor="#007AFF"
      />
      <ScrollView
        style={styles.innerContainer}
        contentContainerStyle={{flexGrow: 1, backgroundColor: theme.background.val}}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}

        {/* Custom Tab Bar */}
        <View style={[styles.tabBarContainer, { backgroundColor: tabColors.background, borderBottomColor: tabColors.border }]}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'Insight' && { borderBottomColor: tabColors.activeText }]}
            onPress={() => setActiveTab('Insight')}
          >
            <Text style={[styles.tabButtonText, { color: activeTab === 'Insight' ? tabColors.activeText : tabColors.inactiveText }]}>
              Insight
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'Reposts' && { borderBottomColor: tabColors.activeText }]}
            onPress={() => setActiveTab('Reposts')}
          >
            <Text style={[styles.tabButtonText, { color: activeTab === 'Reposts' ? tabColors.activeText : tabColors.inactiveText }]}>
              Reposts ({user?.repostArticles.length || 0})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'Saved' && { borderBottomColor: tabColors.activeText }]}
            onPress={() => setActiveTab('Saved')}
          >
            <Text style={[styles.tabButtonText, { color: activeTab === 'Saved' ? tabColors.activeText : tabColors.inactiveText }]}>
              Saved ({user?.savedArticles.length || 0})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContentContainer}>
          {activeTab === 'Insight' && (
            <View style={styles.scrollViewContentContainer}>
              <ActivityOverview
                onArticleViewed={onArticleViewed}
                others={false}
                user_handle={user?.user_handle || ''}
                articlePosted={user?.articles ? user.articles.length : 0}
              />
            </View>
          )}

          {activeTab === 'Reposts' && (
            <FlatList
              data={user !== undefined ? user.repostArticles : []}
              renderItem={renderItem}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                styles.flatListContentContainer,
                {paddingBottom: bottomBarHeight + 15},
              ]}
              keyExtractor={item => item?._id}
              ListEmptyComponent={
                <NoArticleState/>
              }
            />
          )}

          {activeTab === 'Saved' && (
            <FlatList
              data={user !== undefined ? user.savedArticles : []}
              renderItem={renderItem}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                styles.flatListContentContainer,
                {paddingBottom: bottomBarHeight + 15},
              ]}
              keyExtractor={item => item?._id}
              ListEmptyComponent={
                 <NoArticleState/>
              }
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
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
  scrollViewContentContainer: {
    paddingHorizontal: 6,
    marginTop: 6,
  },
  flatListContentContainer: {
    paddingHorizontal: 16,
  },
  tabBarContainer: {
    flexDirection: 'row',
    width: '100%',
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabButtonText: {
    fontSize: 15,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  tabContentContainer: {
    flex: 1,
    width: '100%',
  },
  profileImage: {
    height: 130,
    width: 130,
    borderRadius: 100,
    objectFit: 'cover',
    resizeMode: 'contain',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
