import {createSlice} from '@reduxjs/toolkit';
import {ArticleData, Category, Podcast} from '../type';

export type DataState = {
  filteredArticles: ArticleData[];
  searchedArticles: ArticleData[];
  selectedTags: Category[];
  sortType: 'recent' | 'popular' | 'oldest' | '';
  searchMode: boolean;
  article: ArticleData;
  podcasts: Podcast[];
  articleContent: string;
  categories: Category[];  // All categories data
  suggestion: string | ''; // Suggestions for the user article before submit
  suggestionAccepted: boolean; // Suggestions acceptance state in article preview screen before post
  selectedPodcastCategories: string[]; // Selected podcast category for filter
  // Add or remove playlist case
  addedPodcastId: string;
  removePlaylistId: string;
}

const initialState: DataState = {
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
    pb_recordId: '',
  },
  categories: [],
  articleContent:'',
  suggestion:'',
  suggestionAccepted: false,
  selectedPodcastCategories:[],
  podcasts:[],
  addedPodcastId:'',
  removePlaylistId:'',
};
const dataSlice = createSlice({
  name: 'data',
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
    },
    setSelectePodcastCategories(state, action){
      state.selectedPodcastCategories = action.payload;
    },

    setPodcasts(state,action){
      state.podcasts = action.payload;
    },
    setaddedPodcastId(state, action){
      state.addedPodcastId = action.payload;
    },
    setRemovePlaylistId(state, action){
      state.removePlaylistId = action.payload;
    },
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
  setSuggestionAccepted,
  setSelectePodcastCategories,
  setPodcasts,
  setaddedPodcastId,
  setRemovePlaylistId,
} = dataSlice.actions;

export default dataSlice.reducer;
