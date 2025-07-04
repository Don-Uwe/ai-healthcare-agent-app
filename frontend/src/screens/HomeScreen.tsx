import {
  SafeAreaView,
  StyleSheet,
  View,
  Alert,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Dimensions,
} from 'react-native';
import {useCallback, useEffect, useRef, useState} from 'react';
import {PRIMARY_COLOR} from '../helper/Theme';
import AddIcon from '../components/AddIcon';
import ArticleCard from '../components/ArticleCard';
import HomeScreenHeader from '../components/HomeScreenHeader';
import {ArticleData, Category, CategoryType, HomeScreenProps} from '../type';
import axios from 'axios';
import {
  ARTICLE_TAGS_API,
  REPOST_ARTICLE,
  REQUEST_EDIT,
} from '../helper/APIUtils';
import FilterModal from '../components/FilterModal';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {useMutation, useQuery} from '@tanstack/react-query';
import {useSelector, useDispatch} from 'react-redux';
import Loader from '../components/Loader';
import Config from 'react-native-config';
import {
  setFilteredArticles,
  setSearchedArticles,
  setSearchMode,
  setSelectedTags,
  setSortType,
  setTags,
} from '../store/articleSlice';
import Snackbar from 'react-native-snackbar';
import {useSocket} from '../../SocketContext';
import {useFocusEffect} from '@react-navigation/native';

// Here The purpose of using Redux is to maintain filter state throughout the app session. globally
const HomeScreen = ({navigation}: HomeScreenProps) => {
  const dispatch = useDispatch();
  const [articleCategories, setArticleCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortingType, setSortingType] = useState<string>('');
  //const [loading, setLoading] = useState(true);
  const screenWidth = Dimensions.get('window').width;
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [repostItem, setRepostItem] = useState<ArticleData | null>(null);
  const [selectCategoryList, setSelectCategoryList] = useState<
    CategoryType['name'][]
  >([]);
  const {
    filteredArticles,
    searchedArticles,
    searchMode,
    selectedTags,
    sortType,
  } = useSelector((state: any) => state.article);
  const {user_id, user_token, user_handle} = useSelector(
    (state: any) => state.user,
  );
  const [refreshing, setRefreshing] = useState(false);
  const socket = useSocket();

  console.log('User Token', user_token);
  console.log('User Id', user_id);
  console.log('BASE URL', Config.BASE_URL);

  const handleCategorySelection = (category: CategoryType['name']) => {
    // Update Redux State
    setSelectCategoryList(prevList => {
      const updatedList = prevList.includes(category)
        ? prevList.filter(item => item !== category)
        : [...prevList, category];
      return updatedList;
    });
  };

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const getAllCategories = async () => {
    if (user_token === '') {
      Alert.alert('No token found');
      return;
    }
    const {data: categoryData} = await axios.get(
      `${Config.BASE_URL + ARTICLE_TAGS_API}`,
      {
        headers: {
          Authorization: `Bearer ${user_token}`,
        },
      },
    );
    if (
      selectedTags === undefined ||
      (selectedTags && selectedTags.length === 0)
    ) {
      //console.log('Category Data', categoryData);
      dispatch(
        setSelectedTags({
          selectedTags: categoryData.map(category => category.name),
        }),
      );
      setSelectedCategory(categoryData[0]?.name);
    } else {
      setSelectedCategory(selectedTags[0]);
    }
    setArticleCategories(categoryData);
    dispatch(setTags({tags: categoryData}));
  };

  useEffect(() => {
    getAllCategories();

    return () => {};
  }, []);

  const {data: unreadCount, refetch: refetchUnreadCount} = useQuery({
    queryKey: ['get-unread-notifications-count'],
    queryFn: async () => {
      try {
        if (user_token === '') {
          throw new Error('No token found');
        }
        const response = await axios.get(
          `${Config.BASE_URL}/notification/unread-count`,
          {
            headers: {
              Authorization: `Bearer ${user_token}`,
            },
          },
        );

        // console.log('Notification Response', response);
        return response.data.unreadCount as number;
      } catch (err) {
        console.error('Error fetching articles:', err);
      }
    },
  });

  useFocusEffect(
    useCallback(() => {
      refetchUnreadCount();
    }, [refetchUnreadCount]),
  );
  const handleNoteIconClick = () => {
    //navigation.navigate('EditorScreen');
    navigation.navigate('ArticleDescriptionScreen', {
      article: null,
    });
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

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

      // Emit notification

      if (repostItem) {
        //emitNotification(repostItem);

        const body = {
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
        };

        console.log('notification body', body);
        socket.emit('notification', body);
      }
    },

    onError: error => {
      console.log('Repost Error', error);
      Alert.alert('Internal server error, try again!');
    },
  });

  const submitEditRequestMutation = useMutation({
    mutationKey: ['submit-edit-request'],
    mutationFn: async ({
      articleId,
      reason,
    }: {
      articleId: string;
      reason: string;
    }) => {
      //console.log('Article Id', articleId);
      // console.log('Reason', reason);
      // console.log('URL', REQUEST_EDIT);

      const res = await axios.post(
        REQUEST_EDIT,
        {
          article_id: articleId,
          edit_reason: reason,
        },
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        },
      );

      return res.data.message as string;
    },
    onSuccess: data => {
      Alert.alert(data);
    },
    onError: err => {
      console.log(err);
      Alert.alert('Try again');
    },
  });

  const handleReportAction = (item: ArticleData) => {
    navigation.navigate('ReportScreen', {
      articleId: item._id,
      authorId: item.authorId,
      commentId: null,
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
          submitEditRequestMutation.mutate({
            articleId: item._id,
            reason: reason,
          });
        }}
      />
    );
  };

  const handleFilterReset = () => {
    // Update Redux State Variables
    setSelectCategoryList([]);
    setSortingType('');
    dispatch(
      setSelectedTags({
        selectedTags: articleCategories.map(category => category.name),
      }),
    );
    dispatch(setSortType({sortType: ''}));
    dispatch(setFilteredArticles({filteredArticles: articleData}));
  };

  const handleFilterApply = () => {
    // Update Redux State Variables
    if (selectCategoryList.length > 0) {
      dispatch(setSelectedTags({selectedTags: selectCategoryList}));
    } else {
      dispatch(
        setSelectedTags({
          selectedTags: articleCategories.map(category => category.name),
        }),
      );
    }

    dispatch(setSortType({sortType: sortingType}));
    updateArticles(articleData);
  };

  const updateArticles = (articleData?: ArticleData[]) => {
    if (!articleData) {
      return;
    }

    let filtered = articleData;
    //console.log('sort type', sortType);
    //console.log('Filtered before', filtered);
    if (selectedTags.length > 0) {
      filtered = filtered.filter(article =>
        selectedTags.some(tag =>
          article.tags.some(category => category.name === tag),
        ),
      );
    }
    // console.log('Filtered before sort', filtered);
    if (sortType === 'recent' && filtered.length > 1) {
      filtered = filtered.sort(
        (a, b) =>
          new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime(),
      );
    } else if (sortType === 'oldest' && filtered.length > 1) {
      filtered.sort(
        (a, b) =>
          new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime(),
      );
    } else if (sortType === 'popular' && filtered.length > 1) {
      filtered.sort((a, b) => b.viewCount - a.viewCount);
    }
    //console.log('Filtered', filtered);
    //console.log('Article Data', articleData);
    dispatch(setFilteredArticles({filteredArticles: filtered}));
  };

  const {
    data: articleData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['get-all-articles'],
    queryFn: async () => {
      try {
        if (user_token === '') {
          throw new Error('No token found');
        }

        //console.log('ARTICLE URL', `${Config.BASE_URL}/articles`);
        const response = await axios.get(`${Config.BASE_URL}/articles`, {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        });

        console.log('Article Response', response);
        let d = response.data.articles as ArticleData[];
        updateArticles(d);
        return response.data.articles as ArticleData[];
      } catch (err) {
        console.error('Error fetching articles:', err);
      }
    },
  });

  const onRefresh = () => {
    setRefreshing(true);
    refetch();
    refetchUnreadCount();
    setRefreshing(false);
  };
  const handleSearch = (textInput: string) => {
    //console.log('Search Input', textInput);
    if (textInput === '' || articleData === undefined) {
      dispatch(setSearchedArticles({searchedArticles: []}));
      dispatch(setSearchMode({searchMode: false}));
    } else {
      dispatch(setSearchMode({searchMode: true}));
      const matchesSearch = articleData.filter(article => {
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

  if (isError || !articleData || articleData.length === 0) {
    return <Text style={styles.message}>No Article Found</Text>;
  }

  if (isLoading || submitEditRequestMutation.isPending) {
    return <Loader />;
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
                    selectedCategory !== item ? 'white' : PRIMARY_COLOR,
                  borderColor:
                    selectedCategory !== item ? PRIMARY_COLOR : 'white',
                }}
                onPress={() => {
                  handleCategoryClick(item);
                }}>
                <Text
                  style={{
                    ...styles.labelStyle,
                    color: selectedCategory !== item ? 'black' : 'white',
                  }}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
        </ScrollView>
      </View>
      <View style={styles.articleContainer}>
        {((filteredArticles && filteredArticles.length > 0) ||
          searchedArticles.length > 0) && (
          <FlatList
            data={
              searchMode
                ? searchedArticles
                : filteredArticles.filter(
                    article =>
                      article.tags &&
                      article.tags.some(tag => tag.name === selectedCategory),
                  )
            }
            renderItem={renderItem}
            keyExtractor={item => item._id.toString()}
            contentContainerStyle={styles.flatListContentContainer}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                {/**
                 *  <Image
                  source={require('../assets/article_default.jpg')}
                  style={styles.emptyImgStyle}
                />
                 */}
                <Text style={styles.message}>No Article Found</Text>
              </View>
            }
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 6,
  },
  button: {
    flex: 0,
    borderRadius: 14,
    marginHorizontal: 6,
    marginVertical: 4,
    padding: 8,
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
    color: '#fff',
    fontFamily: 'bold',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    top: 70,
  },
  emptyImgStyle: {
    width: 300,
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: 'contain',
  },
});
