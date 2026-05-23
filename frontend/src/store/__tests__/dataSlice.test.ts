import reducer, {
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
  appendPodcasts,
  setaddedPodcastId,
  setRemovePlaylistId,
} from '../dataSlice';

describe('dataSlice reducers', () => {
  const defaultArticle = {
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
    language: "en-IN"
  };

  const initialState = {
    filteredArticles: [],
    searchedArticles: [],
    selectedTags: [],
    sortType: '',
    searchMode: false,
    article: defaultArticle,
    categories: [],
    articleContent: '',
    suggestion: '',
    suggestionAccepted: false,
    selectedPodcastCategories: [],
    podcasts: [],
    addedPodcastId: '',
    removePlaylistId: '',
  };

  it('should return the initial state', () => {
    // @ts-ignore
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setFilteredArticles', () => {
    const mockArticles = [{ _id: '1', title: 'Test' }];
    const actual = reducer(initialState, setFilteredArticles({ filteredArticles: mockArticles }));
    expect(actual.filteredArticles).toEqual(mockArticles);
  });

  it('should handle setSearchedArticles', () => {
    const mockArticles = [{ _id: '2', title: 'Test Search' }];
    const actual = reducer(initialState, setSearchedArticles({ searchedArticles: mockArticles }));
    expect(actual.searchedArticles).toEqual(mockArticles);
  });

  it('should handle setSelectedTags', () => {
    const mockTags = [{ name: 'Health' }];
    const actual = reducer(initialState, setSelectedTags({ selectedTags: mockTags }));
    expect(actual.selectedTags).toEqual(mockTags);
  });

  it('should handle setSortType', () => {
    const actual = reducer(initialState, setSortType({ sortType: 'recent' }));
    expect(actual.sortType).toEqual('recent');
  });

  it('should handle setSearchMode', () => {
    const actual = reducer(initialState, setSearchMode({ searchMode: true }));
    expect(actual.searchMode).toEqual(true);
  });

  it('should handle setArticle', () => {
    const newArticle = { ...defaultArticle, title: 'New Article' };
    const actual = reducer(initialState, setArticle({ article: newArticle }));
    expect(actual.article).toEqual(newArticle);
  });

  it('should handle setTags', () => {
    const tags = [{ name: 'Tech' }];
    const actual = reducer(initialState, setTags({ tags }));
    expect(actual.categories).toEqual(tags);
  });

  it('should handle setSuggestion', () => {
    const actual = reducer(initialState, setSuggestion({ suggestion: 'Great post!' }));
    expect(actual.suggestion).toEqual('Great post!');
  });

  it('should handle setSuggestionAccepted', () => {
    const actual = reducer(initialState, setSuggestionAccepted({ selection: true }));
    expect(actual.suggestionAccepted).toEqual(true);
  });

  it('should handle setSelectePodcastCategories', () => {
    const categories = ['Tech', 'Health'];
    const actual = reducer(initialState, setSelectePodcastCategories(categories));
    expect(actual.selectedPodcastCategories).toEqual(categories);
  });

  it('should handle setPodcasts', () => {
    const mockPodcasts = [{ _id: 'pod1' }];
    const actual = reducer(initialState, setPodcasts(mockPodcasts));
    expect(actual.podcasts).toEqual(mockPodcasts);
  });

  it('should handle appendPodcasts', () => {
    const mockState = { ...initialState, podcasts: [{ _id: 'pod1' } as any] };
    const actual = reducer(mockState, appendPodcasts([{ _id: 'pod2' }]));
    expect(actual.podcasts.length).toEqual(2);
    expect(actual.podcasts[1]._id).toEqual('pod2');
  });

  it('should handle setaddedPodcastId', () => {
    const actual = reducer(initialState, setaddedPodcastId('pod123'));
    expect(actual.addedPodcastId).toEqual('pod123');
  });

  it('should handle setRemovePlaylistId', () => {
    const actual = reducer(initialState, setRemovePlaylistId('playlist456'));
    expect(actual.removePlaylistId).toEqual('playlist456');
  });
});
