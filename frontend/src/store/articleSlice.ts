import {createSlice} from '@reduxjs/toolkit';
import {ArticleData} from '../type';

export type ArticleState = {
  filteredArticles: ArticleData[];
  searchedArticles: ArticleData[];
  selectedTags: string[];
  sortType: 'recent' | 'popular' | 'oldest' | '';
  searchMode: boolean;
}

const initialState: ArticleState = {
  filteredArticles: [],
  searchedArticles: [],
  selectedTags: [],
  sortType: '',
  searchMode: false,
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
    }
  },
});

export const {
  setFilteredArticles,
  setSearchedArticles,
  setSelectedTags,
  setSortType,
  setSearchMode,
} = articleSlice.actions;

export default articleSlice.reducer;
