import {createSlice} from '@reduxjs/toolkit';
import {ArticleData, Category} from '../type';

export type ArticleState = {
  filteredArticles: ArticleData[];
  searchedArticles: ArticleData[];
  selectedTags: string[];
  sortType: 'recent' | 'popular' | 'oldest' | '';
  searchMode: boolean;
  article: ArticleData;
  articleContent: string;
  categories: Category[];
}

const initialState: ArticleState = {
  filteredArticles: [],
  searchedArticles: [],
  selectedTags: [],
  sortType: '',
  searchMode: false,
  article: {
    _id: '',
    title: '',
    authorName: '',
    authorId: '',
    content: '',
    summary: '',
    tags: [],
    last_updated: '',
    imageUtils: [],
    viewCount: 0
  },
  categories: [],
  articleContent:"";
};
const articleSlice = createSlice({
  name: 'article',
  initialState,
  reducers: {
    setFilteredArticles(state, action) {
      state.filteredArticles = action.payload.filteredArticles;
    },

    setSearchedArticles(state, action) {
      state.searchedArticles = action.payload.searchedArticles;
    },

    setSelectedTags(state, action) {
      state.selectedTags = action.payload.selectedTags;
    },

    setSortType(state, action) {
      state.sortType = action.payload.sortType;
    },

    setSearchMode(state, action){
      state.searchMode = action.payload.searchMode;
    },

    setArticle(state, action){
      state.article = action.payload.article;
    },
    setTags(state, action){
      state.categories = action.payload.tags;
    }
  },
});

export const {
  setFilteredArticles,
  setSearchedArticles,
  setSelectedTags,
  setSortType,
  setSearchMode,
  setArticle,
  setTags
} = articleSlice.actions;

export default articleSlice.reducer;
