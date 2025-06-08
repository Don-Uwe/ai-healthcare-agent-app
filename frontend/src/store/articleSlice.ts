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
  suggestion: string | '';
  suggestionAccepted: boolean
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
    lastUpdated: '',
    imageUtils: [],
    viewCount: 0,
    description: '',
    viewUsers: [],
    repostUsers: [],
    likeCount: 0,
    likedUsers: [],
    savedUsers: [],
    mentionedUsers: [],
    assigned_date: null,
    discardReason: '',
    status: '',
    reviewer_id: undefined,
    contributors: [],
    pb_recordId: ''
  },
  categories: [],
  articleContent:"",
  suggestion:"",
  suggestionAccepted: false
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
    },

    setSuggestion(state, action){
      state.suggestion = action.payload.suggestion;
    },

    setSuggestionAccepted(state, action){
      state.suggestionAccepted = action.payload.selection;
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
  setTags,
  setSuggestion,
  setSuggestionAccepted
} = articleSlice.actions;

export default articleSlice.reducer;
