import {
  SafeAreaView,
  StyleSheet,
  View,
  BackHandler,
  Alert,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {PRIMARY_COLOR} from '../helper/Theme';
import AddIcon from '../components/AddIcon';
import ArticleCard from '../components/ArticleCard';
import HomeScreenHeader from '../components/HomeScreenHeader';
import {ArticleData, Category, CategoryType, HomeScreenProps} from '../type';
import axios from 'axios';
import {ARTICLE_TAGS_API, EC2_BASE_URL} from '../helper/APIUtils';
import FilterModal from '../components/FilterModal';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {useQuery} from '@tanstack/react-query';
import {useSelector, useDispatch} from 'react-redux';
import Loader from '../components/Loader';
import {
  setFilteredArticles,
  setSearchedArticles,
  setSearchMode,
  setSelectedTags,
  setSortType,
  setTags,
} from '../store/articleSlice';

// Here The purpose of using Redux is to maintain filter state throughout the app session. globally
const HomeScreen = ({navigation}: HomeScreenProps) => {
  const dispatch = useDispatch();
  const [articleCategories, setArticleCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortingType, setSortingType] = useState<string>('');
  const [loading, setLoading] = useState(true);
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
  const {user_token} = useSelector((state: any) => state.user);
  const [refreshing, setRefreshing] = useState(false);

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
      `${EC2_BASE_URL + ARTICLE_TAGS_API}`,
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
    /*
    const unsubscribe = navigation.addListener('beforeRemove', e => {

      if (!navigation.canGoBack()) {
        // If there's no back stack, prevent the alert
        return;
      }
      e.preventDefault();
      Alert.alert(
        'Warning',
        'Do you want to exit',
        [
          {text: 'No', onPress: () => null},
          {
            text: 'Yes',
            onPress: () => {
              BackHandler.exitApp()
            },
          },
        ],
        {cancelable: true},
      );
    });
    return unsubscribe;
    */
    return () => {};
  }, []);

  const handleNoteIconClick = () => {
    //navigation.navigate('EditorScreen');
    navigation.navigate('ArticleDescriptionScreen');
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  const renderItem = useCallback(({item}: {item: ArticleData}) => {
    return (
      <ArticleCard item={item} navigation={navigation} success={onRefresh} />
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        const response = await axios.get(`${EC2_BASE_URL}/articles`, {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
        });

        //console.log('Article Response', response);
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

  if (isLoading) {
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
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          {selectedTags &&
            selectedTags.length > 0 &&
            !searchMode &&
            selectedTags.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  ...styles.button,
                  backgroundColor:
                    selectedCategory === item ? 'white' : PRIMARY_COLOR,
                  borderColor:
                    selectedCategory === item ? PRIMARY_COLOR : 'white',
                }}
                onPress={() => {
                  handleCategoryClick(item);
                }}>
                <Text
                  style={{
                    ...styles.labelStyle,
                    color: selectedCategory === item ? 'black' : 'white',
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
    backgroundColor: PRIMARY_COLOR,
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
