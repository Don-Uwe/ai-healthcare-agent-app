import {
  StyleSheet,
  View,
  Alert,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  ON_PRIMARY_COLOR,
  PRIMARY_COLOR,
  SAVED_CHIP_ACTIVE_BG,
  SAVED_CHIP_INACTIVE_BG,
  SAVED_CHIP_INACTIVE_BORDER,
  EMPTY_STATE_BACKGROUND,
  EMPTY_STATE_TEXT_PRIMARY,
  EMPTY_STATE_TEXT_SECONDARY,
} from '../helper/Theme';
import AddIcon from '../components/AddIcon';
import ArticleCard from '../components/ArticleCard';

import HomeScreenHeader from '../components/HomeScreenHeader';
import {ArticleData, Category, HomeScreenProps} from '../type';
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
import {useFocusEffect} from '@react-navigation/native';
import InactiveUserModal from '../components/InactiveUserModal';
import {StatusBar} from 'expo-status-bar';
import {wp} from '../helper/Metric';
import {useGetCategories} from '../hooks/useGetArticleTags';
import {useGetProfile} from '../hooks/useGetProfile';
import {useRequestArticleEdit} from '../hooks/useRequestArticleEdit';
import {useGetUnreadNotificationCount} from '../hooks/useGetUnreadNotificationCount';
import {useGetPaginatedArticle} from '../hooks/useGetPaginatedArticles';
import {
  OfflineArticleState,
  NoArticleState,
  BaseEmptyState,
} from '../components/EmptyStates';

// Loading State Component with Animation
const LoadingState = () => {
  return (
    <BaseEmptyState
      iconEmoji="📚"
      title="Loading Articles"
      description="Gathering the latest health insights for you..."
      loading={true}
    />
  );
};

// Error State Component
const ErrorState = ({onRetry}: {onRetry: () => void}) => {
  return (
    <NoArticleState onRefresh={onRetry} />
  );
};

// Offline State Component
const OfflineState = () => {
  return (
    <OfflineArticleState />
  );
};

// Empty Article State Component (for FlatList empty state)
const EmptyArticleState = () => {
  return (
    <NoArticleState />
  );
};

const SavedArticleEmptyState = () => (
  <View style={styles.savedEmptyContainer}>
    <Text style={styles.savedEmptyTitle}>No saved articles yet</Text>
    <Text style={styles.savedEmptyDescription}>
      Tap the bookmark icon on any article to save it for later.
    </Text>
  </View>
);

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
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [filterLoading, setFilterLoading] = useState<boolean>(false);
  const {mutate: requestEdit, isPending: requestEditPending} =
    useRequestArticleEdit();

  const {
    filteredArticles,
    searchedArticles,
    searchMode,
    selectedTags,
    sortType,
  } = useSelector((state: any) => state.data);

  const {user_token, isGuest} = useSelector(
    (state: any) => state.user,
  );

  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  // Accumulates all raw articles fetched across pages so we can
  // re-apply the active category/sort filter whenever either changes.
  const allArticlesRef = useRef<ArticleData[]>([]);
  // Tracks the last known filtered count for the active category so we don't
  // keep fetching pages when a niche category yields no new articles per page.
  const lastCategoryFilteredCountRef = useRef<number>(-1);
  const prevSelectedCategoryNameRef = useRef<string | undefined>(undefined);
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
  }, [categoryData, dispatch, isSuccess, selectedTags]);

  const handleCategorySelection = (category: Category) => {
    // Update Redux State
    setSelectCategoryList(prevList => {
       const isAlreadySelected = prevList.some(p => p._id === category._id);
      const updatedList = isAlreadySelected
        ? prevList.filter(item => item._id !== category._id)
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
      if (isConnected) {
        if (user_token && !isGuest) {
          refetchUser();
          refetchUnreadCount();
        }
      } else {
        Alert.alert(
          'No Internet 😶‍🌫️',
          'Offline mode will be available in the next update.',
        );
      }
    }, [isConnected, user_token, isGuest, refetchUser, refetchUnreadCount]),
  );

  const handleNoteIconClick = () => {
    if (isGuest) {
      navigation.navigate('GuestPlaceholderScreen', {
        title: 'Sign In Required',
        description: 'Please sign in or sign up to write an article.',
        iconName: 'pen-nib',
      });
      return;
    }
    navigation.navigate('ArticleDescriptionScreen', {
      article: null,
      htmlContent: undefined,
    });
  };

  /**
   * Toggles the "Saved" filter chip.
   * When deactivating, resets page to 1 so the main feed
   * pagination starts fresh and onEndReached fires correctly.
   */
  /**
   * Toggles the "Saved" filter chip.
   */
  const handleToggleSavedOnly = () => {
    setShowSavedOnly(prev => !prev);
  };

  const handleCategoryClick = (category: Category) => {
    // Deactivate Saved chip and update the active category.
    // We do NOT clear already-fetched raw articles, allowing instant switching
    // and seamless client-side filtering.
    setShowSavedOnly(false);
    // Reset the sparse-category guard so the newly selected category gets a
    // fresh auto-pagination opportunity from the current page.
    lastCategoryFilteredCountRef.current = -1;
    setSelectedCategory(category);
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
        handleRepostAction={()=>{}}
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
                if (__DEV__) console.log(err);
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
    dispatch(setFilteredArticles({filteredArticles: allArticlesRef.current}));
  };

  const handleFilterApply = () => {
    // Update Redux State Variables
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
      if (__DEV__) console.log('Sort type', sortType);
      dispatch(setSortType({sortType: sortingType}));
    }

    updateArticles(allArticlesRef.current);
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
        selectedTags.some((tag: Category) =>
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
    isFetching,
    isError,
    refetch,
  } = useGetPaginatedArticle(isConnected, page);

  useEffect(() => {
    if (articleData) {
      if (Number(page) === 1) {
        // Fresh load: replace accumulated articles entirely.
        allArticlesRef.current = articleData.articles ?? [];
        if (articleData.totalPages) {
          setTotalPages(articleData.totalPages);
        }
      } else {
        // Append new page's articles to the accumulated set.
        allArticlesRef.current = [
          ...allArticlesRef.current,
          ...(articleData.articles ?? []),
        ];
      }
      // Always re-apply the current filter/sort to the full accumulated list.
      updateArticles(allArticlesRef.current);
    }
  }, [articleData, page]);

  // Keep filteredArticles and articles list updated when selectedTags or sortType changes
  useEffect(() => {
    updateArticles(allArticlesRef.current);
  }, [selectedTags, sortType]);

  // Proactively auto-paginate in the background if the client-filtered list is too short
  // to ensure that at least a few articles of the selected category are shown
  // or we have exhaustively searched all pages from the backend.
  useEffect(() => {
    if (
      showSavedOnly ||
      searchMode ||
      isLoading ||
      isFetching ||
      page >= totalPages ||
      !selectedCategory
    ) {
      // Reset stale counter whenever the category changes or we stop paginating.
      if (!selectedCategory || selectedCategory.name !== prevSelectedCategoryNameRef.current) lastCategoryFilteredCountRef.current = -1;
      return;
    }

    const currentFiltered = allArticlesRef.current.filter(
      (article: ArticleData) =>
        article.tags &&
        article.tags.some(tag => tag.name === selectedCategory.name),
    );

    // If we have fewer than 5 articles for the active category,
    // fetch the next page in the background to try and find more matches —
    // but only if the last fetch actually added new articles for this category.
    // This prevents infinite fetching when a category is genuinely sparse.
    if (
      currentFiltered.length < 5 &&
      currentFiltered.length > lastCategoryFilteredCountRef.current
    ) {
       prevSelectedCategoryNameRef.current = selectedCategory.name; 
      lastCategoryFilteredCountRef.current = currentFiltered.length;
      setPage(prev => prev + 1);
    }
  }, [
    showSavedOnly,
    searchMode,
    isLoading,
    isFetching,
    page,
    totalPages,
    selectedCategory,
  ]);


  const onRefresh = () => {
    if (__DEV__) console.log('is connected', isConnected);
    if (isConnected) {
      setRefreshing(true);
      // Reset pagination state on full pull-to-refresh
      setPage(1);
      if (page === 1) {
        refetch();
      }
      if (!isGuest) {
        refetchUser();
        refetchUnreadCount();
      }
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
        const matchesTitle = article.title && typeof article.title === 'string'
          ? article.title.toLowerCase().includes((textInput || '').toLowerCase())
          : false;
        const matchesTags = article.tags && Array.isArray(article.tags)
          ? article.tags.some(tag =>
              tag && tag.name && typeof tag.name === 'string' &&
              tag.name.toLowerCase().includes((textInput || '').toLowerCase())
            )
          : false;

        return matchesTitle || matchesTags;
      });
      dispatch(setSearchedArticles({searchedArticles: matchesSearch}));
    }
  };

  const listData = useMemo(() => {
    if (showSavedOnly) {
      const savedArticles = user?.savedArticles || [];
      return savedArticles
        .slice()
        .sort(
          (a, b) =>
            new Date(b.lastUpdated).getTime() -
            new Date(a.lastUpdated).getTime(),
        );
    }
    if (searchMode) return searchedArticles;

    const filtered = filteredArticles.filter(
      (article: ArticleData) =>
        article.tags &&
        article.tags.some(tag => tag.name === selectedCategory?.name),
    );

    return filtered;
  }, [showSavedOnly, searchMode, searchedArticles, filteredArticles, selectedCategory, user]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    const hasCustomCategories = selectedTags.length > 0 && selectedTags.length < articleCategories.length;
    const hasSorting = sortType !== '';
    return hasCustomCategories || hasSorting;
  }, [selectedTags, sortType, articleCategories]);

  // Quick reset handler for header
  const handleQuickReset = () => {
    handleFilterReset();
  };

  if (!articleData || articleData.articles?.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <HomeScreenHeader
          handlePresentModalPress={handlePresentModalPress}
          onTextInputChange={handleSearch}
          onNotificationClick={() => {
            if (isGuest) {
              navigation.navigate('GuestPlaceholderScreen', {
                title: 'Notifications',
                description: 'Sign in to see your notifications.',
                iconName: 'bell',
              });
            } else {
              navigation.navigate('NotificationScreen');
            }
          }}
          unreadCount={unreadCount || 0}
          hasActiveFilters={hasActiveFilters}
          onFilterReset={handleQuickReset}
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
          onNotificationClick={() => {
            if (isGuest) {
              navigation.navigate('GuestPlaceholderScreen', {
                title: 'Notifications',
                description: 'Sign in to see your notifications.',
                iconName: 'bell',
              });
            } else {
              navigation.navigate('NotificationScreen');
            }
          }}
          unreadCount={unreadCount || 0}
          hasActiveFilters={hasActiveFilters}
          onFilterReset={handleQuickReset}
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
          onNotificationClick={() => {
            if (isGuest) {
              navigation.navigate('GuestPlaceholderScreen', {
                title: 'Notifications',
                description: 'Sign in to see your notifications.',
                iconName: 'bell',
              });
            } else {
              navigation.navigate('NotificationScreen');
            }
          }}
          unreadCount={unreadCount || 0}
          hasActiveFilters={hasActiveFilters}
          onFilterReset={handleQuickReset}
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
          hasActiveFilters={hasActiveFilters}
          onFilterReset={handleQuickReset}
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
              selectedTags.map((item: Category, index: number) => {
                const isActive = selectedCategory && (selectedCategory._id === item._id || selectedCategory.id === item.id || selectedCategory.name === item.name);
                return (
                  <TouchableOpacity
                    key={index}
                    style={{
                      ...styles.button,
                      backgroundColor: isActive ? '#000A60' : 'white',
                      borderColor: isActive ? '#000A60' : '#D1D5DB',
                    }}
                    onPress={() => handleCategoryClick(item)}>
                    <Text
                      style={{
                        ...styles.labelStyle,
                        color: isActive ? 'white' : '#4B5563',
                      }}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
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
          if (isGuest) {
            navigation.navigate('GuestPlaceholderScreen', {
              title: 'Notifications',
              description: 'Sign in to see your notifications.',
              iconName: 'bell',
            });
          } else {
            navigation.navigate('NotificationScreen');
          }
        }}
        unreadCount={unreadCount ? unreadCount : 0}
        hasActiveFilters={hasActiveFilters}
        onFilterReset={handleQuickReset}
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
          {!isGuest && (
            <TouchableOpacity
              style={{
                ...styles.button,
                backgroundColor: showSavedOnly
                  ? SAVED_CHIP_ACTIVE_BG
                  : SAVED_CHIP_INACTIVE_BG,
                borderColor: showSavedOnly
                  ? SAVED_CHIP_ACTIVE_BG
                  : SAVED_CHIP_INACTIVE_BORDER,
              }}
              onPress={handleToggleSavedOnly}
              accessibilityRole="button"
              accessibilityLabel={
                showSavedOnly
                  ? 'Saved articles filter active. Tap to show all articles.'
                  : 'Tap to filter by saved articles'
              }>
              <Text
                style={{
                  ...styles.labelStyle,
                  color: showSavedOnly ? 'white' : '#4B5563',
                }}>
                🔖 Saved
              </Text>
            </TouchableOpacity>
          )}
          {selectedTags &&
            selectedTags.length > 0 &&
            !searchMode &&
            selectedTags.map((item: Category, index: number) => {
              // Category chips visually appear inactive when Saved filter is on —
              // they are still clickable to switch away from Saved mode.
              const isActive = !showSavedOnly &&
                selectedCategory &&
                (selectedCategory._id === item._id || selectedCategory.id === item.id || selectedCategory.name === item.name);
              return (
                <TouchableOpacity
                  key={index}
                  style={{
                    ...styles.button,
                    backgroundColor: isActive ? '#000A60' : 'white',
                    borderColor: isActive ? '#000A60' : '#D1D5DB',
                  }}
                  onPress={() => handleCategoryClick(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter by ${item.name}${
                    isActive ? ', currently active' : ''
                  }`}>
                  <Text
                    style={{
                      ...styles.labelStyle,
                      color: isActive ? 'white' : '#4B5563',
                    }}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
        </ScrollView>
      </View>
      <View style={styles.articleContainer}>
        <FlatList
          data={listData}
          renderItem={renderItem}
          keyExtractor={item => item._id.toString()}
          contentContainerStyle={styles.flatListContentContainer}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            showSavedOnly ? <SavedArticleEmptyState /> : <EmptyArticleState />
          }
          onEndReached={() => {
            // Only paginate the main feed — saved articles are a
            // finite local list and do not use server-side pagination.
            if (!showSavedOnly && page < totalPages) {
              setPage(prev => prev + 1);
            }
          }}
          onEndReachedThreshold={0.5}
        />
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
    flexGrow: 1, // Allows empty-state components to fill available height
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
    // minHeight removed: flex:1 + flexGrow:1 on contentContainerStyle fills space
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
    color: EMPTY_STATE_TEXT_PRIMARY,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyArticleDescription: {
    fontSize: 15,
    color: EMPTY_STATE_TEXT_SECONDARY,
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
  savedEmptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
    // minHeight removed: flex:1 + flexGrow:1 on contentContainerStyle fills space
    backgroundColor: EMPTY_STATE_BACKGROUND,
  },
  savedEmptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: EMPTY_STATE_TEXT_PRIMARY,
    marginBottom: 10,
    textAlign: 'center',
  },
  savedEmptyDescription: {
    fontSize: 15,
    color: EMPTY_STATE_TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
  },
});
