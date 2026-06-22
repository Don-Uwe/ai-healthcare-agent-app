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
import {useGetReadHistory, ReadHistoryArticle} from '../hooks/useGetReadHistory';
import { NoArticleState } from '../components/EmptyStates';
import Ionicon from '@expo/vector-icons/Ionicons';

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


  const [activeTab, setActiveTab] = useState<'Insight' | 'Reposts' | 'Saved' | 'History'>('Insight');
  const [historyPage, setHistoryPage] = useState<number>(1);
  const [historyArticles, setHistoryArticles] = useState<ReadHistoryArticle[]>([]);
  const [historyTotalPages, setHistoryTotalPages] = useState<number>(1);

  const {
    data: readHistory,
    isLoading: isHistoryLoading,
    isFetching: isHistoryFetching,
    isError: isHistoryError,
    refetch: refetchHistory,
  } = useGetReadHistory(historyPage);

  React.useEffect(() => {
    if (readHistory) {
      if (historyPage === 1) {
        setHistoryArticles(readHistory.articles ?? []);
      } else {
        setHistoryArticles(prev => [...prev, ...(readHistory.articles ?? [])]);
      }
      if (readHistory.totalPages) {
        setHistoryTotalPages(readHistory.totalPages);
      }
    }
  }, [readHistory, historyPage]);

  const handleLoadMoreHistory = () => {
    if (!isHistoryFetching && historyPage < historyTotalPages) {
      setHistoryPage(prev => prev + 1);
    }
  };

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

        <TouchableOpacity
      style={styles.historyRow}
      onPress={() => navigation.navigate('ReadingHistoryScreen')}>
      <Ionicon name="time-outline" size={22} color={PRIMARY_COLOR} />
        <Text style={styles.historyRowText}>Reading History</Text>
        <Ionicon name="chevron-forward" size={20} color="#9ca3af" />
      </TouchableOpacity>

        {/* Custom Tab Bar */}
        <View style={[styles.tabBarContainer, { backgroundColor: tabColors.background, borderBottomColor: tabColors.border }]}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'Insight' && { borderBottomColor: tabColors.activeText }]}
            onPress={() => setActiveTab('Insight')}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'Insight' }}
            accessibilityLabel="Insight tab"
          >
            <Text style={[styles.tabButtonText, { color: activeTab === 'Insight' ? tabColors.activeText : tabColors.inactiveText }]}>
              Insight
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'Reposts' && { borderBottomColor: tabColors.activeText }]}
            onPress={() => setActiveTab('Reposts')}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'Reposts' }}
            accessibilityLabel={`Reposts tab, ${user?.repostArticles.length || 0} reposts`}
          >
            <Text style={[styles.tabButtonText, { color: activeTab === 'Reposts' ? tabColors.activeText : tabColors.inactiveText }]}>
              Reposts ({user?.repostArticles.length || 0})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'Saved' && { borderBottomColor: tabColors.activeText }]}
            onPress={() => setActiveTab('Saved')}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'Saved' }}
            accessibilityLabel={`Saved tab, ${user?.savedArticles.length || 0} saved articles`}
          >
            <Text style={[styles.tabButtonText, { color: activeTab === 'Saved' ? tabColors.activeText : tabColors.inactiveText }]}>
              Saved ({user?.savedArticles.length || 0})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'History' && { borderBottomColor: tabColors.activeText }]}
            onPress={() => setActiveTab('History')}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'History' }}
            accessibilityLabel={`History tab, ${historyArticles.length || 0} recently read articles`}
          >
            <Text style={[styles.tabButtonText, { color: activeTab === 'History' ? tabColors.activeText : tabColors.inactiveText }]}>
              History ({historyArticles.length || 0})
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
          {activeTab === 'History' && (
            isHistoryLoading ? (
              <Loader />
            ) : isHistoryError ? (
              <View style={styles.historyErrorContainer}>
                <Text style={[styles.historyErrorText, {color: theme.color10?.val}]}>
                  Couldn't load your read history. Please try again.
                </Text>
                <TouchableOpacity
                  style={[styles.historyRetryButton, {borderColor: PRIMARY_COLOR}]}
                  onPress={() => refetchHistory()}
                >
                  <Text style={{color: PRIMARY_COLOR, fontWeight: '600'}}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={historyArticles}
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
                ListFooterComponent={
                  historyPage < historyTotalPages ? (
                    <TouchableOpacity
                      style={[styles.loadMoreButton, {borderColor: PRIMARY_COLOR}]}
                      onPress={handleLoadMoreHistory}
                      disabled={isHistoryFetching}
                    >
                      {isHistoryFetching ? (
                        <Loader />
                      ) : (
                        <Text style={{color: PRIMARY_COLOR, fontWeight: '600'}}>
                          Load More
                        </Text>
                      )}
                    </TouchableOpacity>
                  ) : null
                }
              />
            )
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

  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  historyRowText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  loadMoreButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyErrorContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyErrorText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
    textAlign: 'center',
  },
  historyRetryButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderRadius: 8,
  },
});