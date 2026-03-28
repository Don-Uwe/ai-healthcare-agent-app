import {
  StyleSheet,
  View,
  Alert,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../helper/Theme';
import AddIcon from '../components/AddIcon';
import ArticleCard from '../components/ArticleCard';

import HomeScreenHeader from '../components/HomeScreenHeader';
import {ArticleData, Category, CategoryType, HomeScreenProps} from '../type';
import FilterModal from '../components/FilterModal';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {useSelector, useDispatch} from 'react-redux';
import Loader from '../components/Loader';

import {
  setFilteredArticles,
  setSearchedArticles,
  setSearchMode,
  setSelectedTags,
  setSortType,
  setTags,
} from '../store/dataSlice';
import Snackbar from 'react-native-snackbar';
import {useSocket} from '../../SocketContext';
import {useFocusEffect} from '@react-navigation/native';
import InactiveUserModal from '../components/InactiveUserModal';
import {StatusBar} from 'expo-status-bar';
import {wp} from '../helper/Metric';
import {useRepostArticle} from '../hooks/useArticleRepost';
import {useGetCategories} from '../hooks/useGetArticleTags';
import {useGetProfile} from '../hooks/useGetProfile';
import {useRequestArticleEdit} from '../hooks/useRequestArticleEdit';
import {useGetUnreadNotificationCount} from '../hooks/useGetUnreadNotificationCount';
import {useGetPaginatedArticle} from '../hooks/useGetPaginatedArticles';

// Loading State Component with Animation
const LoadingState = () => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Rotate animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [pulseAnim, rotateAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.stateContainer}>
      <Animated.View
        style={[
          styles.iconCircle,
          {
            transform: [{scale: pulseAnim}, {rotate}],
          },
        ]}>
        <Text style={styles.iconEmoji}>📚</Text>
      </Animated.View>
      <Text style={styles.stateTitle}>Loading Articles</Text>
      <Text style={styles.stateDescription}>
        Gathering the latest health insights for you...
      </Text>
      <View style={styles.dotsContainer}>
        <AnimatedDot delay={0} />
        <AnimatedDot delay={200} />
        <AnimatedDot delay={400} />
      </View>
    </View>
  );
};

// Animated Dot Component
const AnimatedDot = ({delay}: {delay: number}) => {
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [delay, fadeAnim]);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          opacity: fadeAnim,
        },
      ]}
    />
  );
};

// Error State Component
const ErrorState = ({onRetry}: {onRetry: () => void}) => {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [shakeAnim]);

  return (
    <View style={styles.stateContainer}>
      <Animated.View
        style={[
          styles.iconCircle,
          styles.errorCircle,
          {
            transform: [{translateX: shakeAnim}],
          },
        ]}>
        <Text style={styles.iconEmoji}>📭</Text>
      </Animated.View>
      <Text style={styles.stateTitle}>No Articles Found</Text>
      <Text style={styles.stateDescription}>
        We couldn&apos;t find any articles at the moment.{'\n'}
        Please try refreshing or check back later.
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
};

// Offline State Component
const OfflineState = () => {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [bounceAnim]);

  return (
    <View style={styles.stateContainer}>
      <Animated.View
        style={[
          styles.iconCircle,
          styles.offlineCircle,
          {
            transform: [{translateY: bounceAnim}],
          },
        ]}>
        <Text style={styles.iconEmoji}>📡</Text>
      </Animated.View>
      <Text style={styles.stateTitle}>You&apos;re Offline</Text>
      <Text style={styles.stateDescription}>
        Connect to the internet to view articles.{'\n'}
        Offline mode coming in the next update!
      </Text>
    </View>
  );
};

// Empty Article State Component (for FlatList empty state)
const EmptyArticleState = () => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Float animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [floatAnim, fadeAnim]);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  return (
    <Animated.View style={[styles.emptyArticleContainer, {opacity: fadeAnim}]}>
      <Animated.View
        style={[
          styles.emptyIconCircle,
          {
            transform: [{translateY}],
          },
        ]}>
        <Text style={styles.emptyIconEmoji}>🔍</Text>
      </Animated.View>
      <Text style={styles.emptyArticleTitle}>No Articles Here</Text>
      <Text style={styles.emptyArticleDescription}>
        We couldn&apos;t find any articles in this category.{'\n'}
        Try selecting a different category or{'\n'}
        check back later for new content!
      </Text>
      <View style={styles.emptyTagsContainer}>
        <View style={styles.emptyTag}>
          <Text style={styles.emptyTagText}>Try other tags</Text>
        </View>
      </View>
    </Animated.View>
  );
};

// Here The purpose of using Redux is to maintain filter state throughout the app session. globally
const HomeScreen = ({navigation}: HomeScreenProps) => {
  const dispatch = useDispatch();
  const [articleCategories, setArticleCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>();
  const [sortingType, setSortingType] = useState<string>('');
  const {isConnected} = useSelector((state: any) => state.network);
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  // const [repostItem, setRepostItem] = useState<ArticleData | null>(null);
  const [selectCategoryList, setSelectCategoryList] = useState<Category[]>([]);
  const [filterLoading, setFilterLoading] = useState<boolean>(false);

  const {mutate: repost, isPending: repostPending} = useRepostArticle();
  const {mutate: requestEdit, isPending: requestEditPending} =
    useRequestArticleEdit();

  const {
    filteredArticles,
    searchedArticles,
    searchMode,
    selectedTags,
    sortType,
  } = useSelector((state: any) => state.data);

  const {user_id, user_token, user_handle} = useSelector(
    (state: any) => state.user,
  );

  const [refreshing, setRefreshing] = useState(false);
  const socket = useSocket();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const {data: user, refetch: refetchUser} = useGetProfile();
  const {data: categoryData, isSuccess} = useGetCategories(isConnected);

  useEffect(() => {
    if (!isSuccess || !categoryData) return;

    if (!selectedTags || selectedTags.length === 0) {
      dispatch(
        setSelectedTags({
          selectedTags: categoryData,
        }),
      );
      setSelectedCategory(categoryData[0]);
    } else {
      setSelectedCategory(selectedTags[0]);
    }

    setArticleCategories(categoryData);
    dispatch(setTags({tags: categoryData}));
  }, [categoryData, isSuccess]);

  const handleCategorySelection = (category: CategoryType) => {
    // Update Redux State
    setSelectCategoryList(prevList => {
      const updatedList = prevList.some(p => p.id === category.id)
        ? prevList.filter(item => item.id !== category.id)
        : [...prevList, category];
      return updatedList;
    });
  };

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const {data: unreadCount, refetch: refetchUnreadCount} =
    useGetUnreadNotificationCount(isConnected);

  useFocusEffect(
    useCallback(() => {
      if (isConnected && user_token) {
        refetchUser();
        refetchUnreadCount();
      } else {
        Alert.alert(
          'No Internet 😶‍🌫️',
          'Offline mode will be available in the next update.',
        );
      }
    }, [isConnected, user_token, refetchUser, refetchUnreadCount]),
  );

  const handleNoteIconClick = () => {
    navigation.navigate('ArticleDescriptionScreen', {
      article: null,
      htmlContent: undefined,
    });
  };

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
  };

  const handleRepostAction = (item: ArticleData) => {
    if (!isConnected) {
      Snackbar.show({
        text: 'Please check your network connection',
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }

    repost(Number(item._id), {
      onSuccess: () => {
        refetch();

        Snackbar.show({
          text: 'Article reposted in your feed',
          duration: Snackbar.LENGTH_SHORT,
        });

        const body = {
          type: 'repost',
          userId: user_id,
          authorId: item.authorId,
          postId: item._id,
          articleRecordId: item.pb_recordId,
          message: {
            title: `${user_handle} reposted`,
            message: `${item.title}`,
          },
          authorMessage: {
            title: `${user_handle} reposted your article`,
            message: `${item.title}`,
          },
        };

        socket.emit('notification', body);
      },

      onError: error => {
        console.log('Repost Error', error);
        Alert.alert('Internal server error, try again!');
      },
    });
  };

  const handleReportAction = (item: ArticleData) => {
    navigation.navigate('ReportScreen', {
      articleId: item._id,
      authorId: item.authorId as string,
      commentId: null,
      podcastId: null,
    });
  };
  const renderItem = ({item}: {item: ArticleData}) => {
    return (
      <ArticleCard
        item={item}
        isSelected={selectedCardId === item._id}
        setSelectedCardId={setSelectedCardId}
        navigation={navigation}
        success={onRefresh}
        handleRepostAction={handleRepostAction}
        handleReportAction={handleReportAction}
        handleEditRequestAction={(item, index, reason) => {
          // submitRequest
          requestEdit(
            {
              articleId: item._id,
              reason: reason,
              articleRecordId: item.pb_recordId,
            },
            {
              onSuccess: data => {
                Snackbar.show({
                  text: data,
                  duration: Snackbar.LENGTH_SHORT,
                });
              },
              onError: err => {
                console.log(err);
                Snackbar.show({
                  text: 'Try again!',
                  duration: Snackbar.LENGTH_SHORT,
                });
              },
            },
          );
        }}
        source="home"
      />
    );
  };

  const handleFilterReset = () => {
    // Update Redux State Variables
    setSelectCategoryList([]);
    setSortingType('');
    dispatch(
      setSelectedTags({
        selectedTags: articleCategories,
      }),
    );
    dispatch(setSortType({sortType: ''}));
    dispatch(setFilteredArticles({filteredArticles: articleData?.articles}));
  };

  const handleFilterApply = () => {
    // Update Redux State Variables
    console.log('enter');
    if (selectCategoryList.length > 0) {
      //   console.log("enter")
      dispatch(setSelectedTags({selectedTags: selectCategoryList}));
    } else {
      //console.log("enter ele", articleCategories);

      dispatch(
        setSelectedTags({
          selectedTags: articleCategories,
        }),
      );
    }

    if (sortingType && sortingType !== '') {
      console.log('Sort type', sortType);
      dispatch(setSortType({sortType: sortingType}));
    }

    if (sortingType && sortingType !== '') {
      console.log('Sort type', sortType);
      dispatch(setSortType({sortType: sortingType}));
    }

    updateArticles(articleData?.articles);
  };

  const updateArticles = (articleData?: ArticleData[]) => {
    setFilterLoading(true);
    if (!articleData) {
      setFilterLoading(false);
      return;
    }

    let filtered = articleData;

    if (selectedTags.length > 0) {
      filtered = filtered.filter(article =>
        selectedTags.some(tag =>
          article.tags.some(category => category.name === tag.name),
        ),
      );
    }
    //  console.log('Filtered before sort', filtered);
    if (sortType && sortType === 'recent' && filtered.length > 1) {
      filtered = filtered.sort(
        (a, b) =>
          new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime(),
      );
    } else if (sortType && sortType === 'oldest' && filtered.length > 1) {
      filtered.sort(
        (a, b) =>
          new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime(),
      );
    } else if (sortType && sortType === 'popular' && filtered.length > 1) {
      filtered.sort((a, b) => b.viewCount - a.viewCount);
    }
    dispatch(setFilteredArticles({filteredArticles: filtered}));
    setFilterLoading(false);
  };

  const {
    data: articleData,
    isLoading,
    isError,
    refetch,
  } = useGetPaginatedArticle(isConnected, page);

  useEffect(() => {
    if (articleData) {
      if (Number(page) === 1 && articleData.totalPages) {
        setTotalPages(articleData.totalPages);
      }

      if (Number(page) === 1) {
        updateArticles(articleData.articles);
      } else {
        updateArticles([...filteredArticles, ...articleData.articles]);
      }
    }
  }, [articleData, page]);


  const onRefresh = () => {
    console.log('is connected', isConnected);
    if (isConnected) {
      setRefreshing(true);
      refetch();
      refetchUnreadCount();
      setRefreshing(false);
    } else {
      Snackbar.show({
        text: 'Please check your network connection',
        duration: Snackbar.LENGTH_SHORT,
      });
    }
  };
  const handleSearch = (textInput: string) => {
    //console.log('Search Input', textInput);
    if (textInput === '' || articleData === undefined) {
      dispatch(setSearchedArticles({searchedArticles: []}));
      dispatch(setSearchMode({searchMode: false}));
    } else {
      dispatch(setSearchMode({searchMode: true}));
      const matchesSearch = articleData?.articles.filter(article => {
        const matchesTitle = article.title
          .toLowerCase()
          .includes(textInput.toLowerCase());
        const matchesTags = article.tags.some(tag =>
          tag.name.toLowerCase().includes(textInput.toLowerCase()),
        );

        return matchesTitle || matchesTags;
      });
      dispatch(setSearchedArticles({searchedArticles: matchesSearch}));
    }
  };

  const listData = useMemo(() => {
    if (searchMode) return searchedArticles;

    const filtered = filteredArticles.filter(
      (article: ArticleData) =>
        article.tags &&
        article.tags.some(tag => tag.name === selectedCategory?.name),
    );

    return filtered.sort(() => Math.random() - 0.5);
  }, [searchMode, searchedArticles, filteredArticles, selectedCategory]);

  if (!articleData || articleData.articles?.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <HomeScreenHeader
          handlePresentModalPress={handlePresentModalPress}
          onTextInputChange={handleSearch}
          onNotificationClick={() => navigation.navigate('NotificationScreen')}
          unreadCount={unreadCount || 0}
        />

        <LoadingState />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        <HomeScreenHeader
          handlePresentModalPress={handlePresentModalPress}
          onTextInputChange={handleSearch}
          onNotificationClick={() => navigation.navigate('NotificationScreen')}
          unreadCount={unreadCount || 0}
        />

        <ErrorState onRetry={refetch} />
      </SafeAreaView>
    );
  }

  if (isConnected === false) {
    return (
      <SafeAreaView style={styles.container}>
        <HomeScreenHeader
          handlePresentModalPress={handlePresentModalPress}
          onTextInputChange={handleSearch}
          onNotificationClick={() => navigation.navigate('NotificationScreen')}
          unreadCount={unreadCount || 0}
        />

        <OfflineState />
      </SafeAreaView>
    );
  }

  if (isLoading || requestEditPending) {
    return <Loader />;
  }

  if (user && (user.isBlockUser || user.isBannedUser)) {
    return (
      <SafeAreaView style={styles.blockContainer}>
        <StatusBar style="light" backgroundColor="#007AFF" />
        <HomeScreenHeader
          handlePresentModalPress={handlePresentModalPress}
          onTextInputChange={handleSearch}
          onNotificationClick={() => {
            navigation.navigate('NotificationScreen');
          }}
          unreadCount={unreadCount ? unreadCount : 0}
        />

        <View style={styles.buttonContainer}>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            //contentContainerStyle={{flex:1}}
          >
            {selectedTags &&
              selectedTags.length > 0 &&
              !searchMode &&
              selectedTags.map((item: Category, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    ...styles.button,
                    backgroundColor:
                      selectedCategory && selectedCategory._id !== item._id
                        ? 'white'
                        : PRIMARY_COLOR,
                    borderColor:
                      selectedCategory && selectedCategory._id !== item._id
                        ? PRIMARY_COLOR
                        : 'white',
                  }}
                  onPress={() => {
                    handleCategoryClick(item);
                  }}>
                  <Text
                    style={{
                      ...styles.labelStyle,
                      color:
                        selectedCategory && selectedCategory._id !== item._id
                          ? 'black'
                          : 'white',
                    }}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>

        <InactiveUserModal
          open={true}
          onRequestAdmin={() => {
            //navigation.navigate('ContactAdminScreen');
          }}
          reason={
            user.isBlockUser
              ? 'blocked'
              : user.isBannedUser
                ? 'banned'
                : undefined
          }
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <HomeScreenHeader
        handlePresentModalPress={handlePresentModalPress}
        onTextInputChange={handleSearch}
        onNotificationClick={() => {
          navigation.navigate('NotificationScreen');
        }}
        unreadCount={unreadCount ? unreadCount : 0}
      />
      <FilterModal
        bottomSheetModalRef={bottomSheetModalRef}
        categories={articleCategories}
        handleCategorySelection={handleCategorySelection}
        selectCategoryList={selectCategoryList}
        handleFilterReset={handleFilterReset}
        handleFilterApply={handleFilterApply}
        setSortingType={setSortingType}
        sortingType={sortingType}
      />
      <View style={styles.buttonContainer}>
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          //contentContainerStyle={{flex:1}}
        >
          {selectedTags &&
            selectedTags.length > 0 &&
            !searchMode &&
            selectedTags.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  ...styles.button,
                  backgroundColor:
                    selectedCategory && selectedCategory._id !== item._id
                      ? 'white'
                      : '#000A60',
                  borderColor:
                    selectedCategory && selectedCategory._id !== item._id
                      ? PRIMARY_COLOR
                      : 'white',
                }}
                onPress={() => {
                  handleCategoryClick(item);
                }}>
                <Text
                  style={{
                    ...styles.labelStyle,
                    color:
                      selectedCategory && selectedCategory._id !== item._id
                        ? 'black'
                        : 'white',
                  }}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
        </ScrollView>
      </View>
      <View style={styles.articleContainer}>
        {((filteredArticles && filteredArticles.length > 0) ||
          searchedArticles.length > 0) && (
          <FlatList
            data={listData}
            renderItem={renderItem}
            keyExtractor={item => item._id.toString()}
            contentContainerStyle={styles.flatListContentContainer}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListEmptyComponent={<EmptyArticleState />}
            onEndReached={() => {
              if (page < totalPages) {
                setPage(prev => prev + 1);
              }
            }}
            onEndReachedThreshold={0.5}
          />
        )}
      </View>

      <View style={styles.homePlusIconview}>
        <AddIcon callback={handleNoteIconClick} />
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8FF',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },

  blockContainer: {
    flex: 0,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    //alignItems: 'center',
  },
  buttonContainer: {
    marginTop: wp(3),
    flexDirection: 'row',
    paddingHorizontal: 6,
  },
  button: {
    flex: 0,
    borderRadius: wp(4),
    marginHorizontal: 6,
    marginVertical: 4,
    padding: wp(3.1),
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelStyle: {
    fontWeight: 'bold',
    fontSize: 15,
    textTransform: 'capitalize',
  },
  articleContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 0,
    zIndex: -2,
  },
  flatListContentContainer: {
    paddingHorizontal: 16,
    marginTop: 10,
    paddingBottom: 120,
  },
  homePlusIconview: {
    bottom: 100,
    right: 25,
    position: 'absolute',
    zIndex: -2,
  },

  message: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'bold',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: ON_PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    top: 30,
  },
  emptyImgStyle: {
    width: 100,
    height: 200,
    borderRadius: 8,
    marginBottom: 1,
    resizeMode: 'contain',
  },

  // New state styles
  stateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F0F8FF',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  errorCircle: {
    backgroundColor: '#FFEBEE',
  },
  offlineCircle: {
    backgroundColor: '#FFF3E0',
  },
  iconEmoji: {
    fontSize: 56,
  },
  stateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  stateDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: PRIMARY_COLOR,
    marginHorizontal: 6,
  },
  retryButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
    marginTop: 8,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // Empty Article State styles (for FlatList empty state)
  emptyArticleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
    minHeight: 400,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3E5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#9C27B0',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  emptyIconEmoji: {
    fontSize: 48,
  },
  emptyArticleTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyArticleDescription: {
    fontSize: 15,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  emptyTagsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  emptyTag: {
    backgroundColor: '#E8EAF6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C5CAE9',
  },
  emptyTagText: {
    color: '#3F51B5',
    fontSize: 14,
    fontWeight: '600',
  },
});
