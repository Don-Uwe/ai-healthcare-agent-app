import {
  StyleSheet,
  View,
  Alert,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import {useCallback, useEffect, useRef, useState} from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {PRIMARY_COLOR} from '../helper/Theme';
import AddIcon from '../components/AddIcon';
import ArticleCard from '../components/ArticleCard';
import HomeScreenHeader from '../components/HomeScreenHeader';
import {
  ArticleData,
  Category,
  CategoryType,
  HomeScreenProps,
  User,
} from '../type';
import axios from 'axios';
import {
  ARTICLE_TAGS_API,
  GET_PROFILE_API,
  PROD_URL,
  REPOST_ARTICLE,
  REQUEST_EDIT,
} from '../helper/APIUtils';
import FilterModal from '../components/FilterModal';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {useMutation, useQuery} from '@tanstack/react-query';
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
import { StatusBar } from 'expo-status-bar';
import { wp } from '../helper/Metric';

// Here The purpose of using Redux is to maintain filter state throughout the app session. globally
const HomeScreen = ({navigation}: HomeScreenProps) => {
  const dispatch = useDispatch();
  const [articleCategories, setArticleCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>();
  const [sortingType, setSortingType] = useState<string>('');
  //const [loading, setLoading] = useState(true);
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [repostItem, setRepostItem] = useState<ArticleData | null>(null);
  const [selectCategoryList, setSelectCategoryList] = useState<Category[]>([]);
  const[filterLoading, setFilterLoading] = useState<boolean>(false);
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

  //console.log('User Token', user_token);
  //console.log('User Id', user_id);
  //console.log('BASE URL', PROD_URL);

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

  const getAllCategories = useCallback(async () => {
    if (user_token === '') {
      Alert.alert('No token found');
      return;
    }
    const {data: categoryData} = await axios.get(
      `${PROD_URL + ARTICLE_TAGS_API}`,
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
          selectedTags: categoryData,
        }),
      );
      setSelectedCategory(categoryData[0]);
    } else {
      setSelectedCategory(selectedTags[0]);
    }
    setArticleCategories(categoryData);
    dispatch(setTags({tags: categoryData}));
  }, [dispatch, selectedTags, user_token]);

  useEffect(() => {
    getAllCategories();

    return () => {};
  }, [getAllCategories]);

  const {data: unreadCount, refetch: refetchUnreadCount} = useQuery({
    queryKey: ['get-unread-notifications-count'],
    queryFn: async () => {
      try {
        if (user_token === '') {
          throw new Error('No token found');
        }
        const response = await axios.get(
          `${PROD_URL}/notification/unread-count?role=2`,
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

  const {
    data: user,
    refetch: refetchUser,
    isLoading: isUserLoading,
  } = useQuery({
    queryKey: ['get-my-profile'],
    queryFn: async () => {
      const response = await axios.get(`${GET_PROFILE_API}`, {
        headers: {
          Authorization: `Bearer ${user_token}`,
        },
      });
      return response.data.profile as User;
    },
  });

  useFocusEffect(
    useCallback(() => {
      refetchUser();
      refetchUnreadCount();
    }, [refetchUnreadCount, refetchUser]),
  );
  const handleNoteIconClick = () => {
    //navigation.navigate('EditorScreen');
    navigation.navigate('ArticleDescriptionScreen', {
      article: null,
      htmlContent: undefined,
    });
  };

  const handleCategoryClick = (category: Category) => {
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
          articleRecordId: repostItem.pb_recordId,
          message: {
            title: `${user_handle} reposted`,
            message: `${repostItem.title}`,
          },
          authorMessage: {
            title: `${user_handle} reposted your article`,
            message: `${repostItem.title}`,
          },
        };

        // console.log('notification body', body);
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
      articleRecordId,
    }: {
      articleId: string;
      reason: string;
      articleRecordId: string;
    }) => {
   

      const res = await axios.post(
        REQUEST_EDIT,
        {
          article_id: articleId,
          edit_reason: reason,
          article_recordId: articleRecordId,
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
          submitEditRequestMutation.mutate({
            articleId: item._id,
            reason: reason,
            articleRecordId: item.pb_recordId,
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
        selectedTags: articleCategories,
      }),
    );
    dispatch(setSortType({sortType: ''}));
    dispatch(setFilteredArticles({filteredArticles: articleData}));
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

   if(sortingType && sortingType !== ''){
      console.log("Sort type", sortType);
     dispatch(setSortType({sortType: sortingType}));
    }

    updateArticles(articleData);
  };

  const updateArticles = (articleData?: ArticleData[]) => {
    setFilterLoading(true);
    if (!articleData) {
      setFilterLoading(false);
      return;
    }

    let filtered = articleData;
   // console.log('sort type', sortType);
    //console.log('Filtered before', filtered);
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
   // console.log('Filtered', filtered);
    //console.log('Article Data', articleData);
    dispatch(setFilteredArticles({filteredArticles: filtered}));
    setFilterLoading(false);
  };

  const {
    data: articleData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['get-all-articles', page],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `${PROD_URL}/articles?page=${page}`,
          {
            headers: {Authorization: `Bearer ${user_token}`},
          },
        );

        const d: ArticleData[] = response.data.articles;

        if (Number(page) === 1 && response.data.totalPages) {
          setTotalPages(response.data.totalPages);
        }

        if (Number(page) === 1) {
          updateArticles(d);
        } else {
          updateArticles([...filteredArticles, ...d]);
        }

        return response.data.articles as ArticleData[];
      } catch (err) {
        console.error('Error fetching articles:', err);
        return [];
      }
    },
    enabled: !!user_token && !!page,
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

  if (isLoading || submitEditRequestMutation.isPending || isUserLoading) {
    return <Loader />;
  }

  if (user && (user.isBlockUser || user.isBannedUser)) {
    return (
      <SafeAreaView style={styles.blockContainer}>
        <StatusBar style="dark" backgroundColor={PRIMARY_COLOR} />
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
              selectedTags.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    ...styles.button,
                    backgroundColor:
                      selectedCategory && selectedCategory._id !== item._id ? 'white' : PRIMARY_COLOR,
                    borderColor:
                      selectedCategory && selectedCategory._id !== item._id ? PRIMARY_COLOR : 'white',
                  }}
                  onPress={() => {
                    handleCategoryClick(item);
                  }}>
                  <Text
                    style={{
                      ...styles.labelStyle,
                      color: selectedCategory && selectedCategory._id !== item._id ? 'black' : 'white',
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
                    selectedCategory && selectedCategory._id !== item._id ? 'white' : '#000A60',
                  borderColor:
                    selectedCategory && selectedCategory._id !== item._id ? PRIMARY_COLOR : 'white',
                }}
                onPress={() => {
                  handleCategoryClick(item);
                }}>
                <Text
                  style={{
                    ...styles.labelStyle,
                    color: selectedCategory && selectedCategory._id !== item._id ? 'black' : 'white',
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
            data={
              searchMode 
                ? searchedArticles
                : filteredArticles.filter(
                    article =>
                      article.tags &&
                      article.tags.some(tag => tag.name === selectedCategory?.name),
                  )
            }
            renderItem={renderItem}
            keyExtractor={item => item._id.toString()}
            contentContainerStyle={styles.flatListContentContainer}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Image
                  source={require('../assets/images/no_results.jpg')}
                  style={styles.emptyImgStyle}
                />
                 
                <Text style={styles.message}>No Article Found</Text>
              </View>
            }
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
    padding: wp(3.5),
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
