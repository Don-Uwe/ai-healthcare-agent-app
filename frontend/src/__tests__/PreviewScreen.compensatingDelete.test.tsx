/**
 * Tests for the compensating-delete pattern in PreviewScreen.handlePostSubmit.
 *
 * Strategy: mock the three mutation hooks (uploadPocketbase, postMutation,
 * deletePocketbaseRecord) so we can assert that deletePocketbaseRecord is
 * called with the correct recordId whenever the downstream write fails, and
 * is NOT called when the downstream write succeeds.
 */

import React from 'react';
import {Alert} from 'react-native';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';

// ── mocks ──────────────────────────────────────────────────────────────────

const mockUploadPocketbase = jest.fn();
const mockPostMutation = jest.fn();
const mockDeletePocketbaseRecord = jest.fn();
const mockUploadImprovementToPocketbase = jest.fn();
const mockImprovementMutation = jest.fn();
const mockSubmitChangesMutation = jest.fn();

jest.mock('@/src/hooks/useUploadArticlePocketbase', () => ({
  useUploadArticleToPocketbase: () => ({
    mutate: mockUploadPocketbase,
    isPending: false,
  }),
}));

jest.mock('@/src/hooks/usePostArticle', () => ({
  usePostArticleData: () => ({
    mutate: mockPostMutation,
    isPending: false,
  }),
}));

jest.mock('@/src/hooks/useDeletePocketbaseRecord', () => ({
  useDeletePocketbaseRecord: () => ({
    mutate: mockDeletePocketbaseRecord,
  }),
}));

jest.mock('@/src/hooks/useUploadImprovementToPocketbase', () => ({
  useUploadImprovementToPocketbase: () => ({
    mutate: mockUploadImprovementToPocketbase,
    isPending: false,
  }),
}));

jest.mock('@/src/hooks/useSubmitImprovement', () => ({
  useSubmitImprovement: () => ({
    mutate: mockImprovementMutation,
    isPending: false,
  }),
}));

jest.mock('@/src/hooks/useSubmitSuggestedChanges', () => ({
  useSubmitSuggestedChanges: () => ({
    mutate: mockSubmitChangesMutation,
    isPending: false,
  }),
}));

jest.mock('@/src/hooks/useRenderSuggestion', () => ({
  useRenderSuggestion: () => ({mutate: jest.fn(), isPending: false}),
}));

jest.mock('@/src/hooks/useGetProfile', () => ({
  useGetProfile: () => ({data: {_id: 'user-1', user_name: 'tester'}}),
}));

jest.mock('@/src/hooks/useUploadImage', () => ({
  __esModule: true,
  default: () => ({uploadImage: jest.fn(), loading: false}),
}));

jest.mock('react-native-snackbar', () => ({show: jest.fn()}));
jest.mock('@brown-bear/react-native-autoheight-webview', () => 'WebView');
jest.mock('@bam.tech/react-native-image-resizer', () => ({
  createResizedImage: jest.fn().mockResolvedValue({uri: 'resized://img'}),
}));

// Spy on Alert so we can simulate confirmation dialog
jest.spyOn(Alert, 'alert').mockImplementation(
  (_title, _msg, buttons) => {
    // Auto-confirm the "Create Post" dialog (press OK)
    const ok = buttons?.find(b => b.text === 'OK');
    ok?.onPress?.();
  },
);

// ── helpers ────────────────────────────────────────────────────────────────

const FAKE_PB_RESPONSE = {
  message: 'ok',
  recordId: 'pb-record-42',
  html_file: 'https://pb.example.com/article.html',
};

function makeStore() {
  return configureStore({
    reducer: {
      user: () => ({user_token: 'tok', user_id: 'user-1'}),
      data: () => ({suggestion: '', suggestionAccepted: false}),
      network: () => ({isConnected: true}),
    },
  });
}

function makeNav() {
  return {navigate: jest.fn(), setOptions: jest.fn()};
}

function makeRoute(overrides = {}) {
  return {
    params: {
      article: '<p>hello</p>',
      title: 'Test Article',
      description: 'desc',
      authorName: 'Tester',
      selectedGenres: [],
      localImages: [],
      articleData: null,
      requestId: null,
      language: 'en',
      pb_record_id: null,
      translationSource: null,
      ...overrides,
    },
  };
}

// Lazy import after mocks are set up
let PreviewScreen: React.ComponentType<any>;
beforeAll(async () => {
  PreviewScreen = (await import('../screens/article/PreviewScreen')).default;
});

beforeEach(() => {
  jest.clearAllMocks();
});

// ── tests ──────────────────────────────────────────────────────────────────

describe('PreviewScreen compensating delete — new article path', () => {
  function setupAndSubmit() {
    const store = makeStore();
    const nav = makeNav();
    const {getByText} = render(
      <Provider store={store}>
        <PreviewScreen navigation={nav} route={makeRoute()} />
      </Provider>,
    );
    fireEvent.press(getByText('Submit'));
    return {nav};
  }

  it('calls deletePocketbaseRecord with the correct recordId when postMutation fails', async () => {
    setupAndSubmit();

    // Step 1 succeeds
    const pbOnSuccess = mockUploadPocketbase.mock.calls[0][1].onSuccess;
    pbOnSuccess(FAKE_PB_RESPONSE);

    // Step 2 fails
    const postOnError = mockPostMutation.mock.calls[0][1].onError;
    postOnError(new Error('500 Internal Server Error'));

    await waitFor(() => {
      expect(mockDeletePocketbaseRecord).toHaveBeenCalledTimes(1);
      expect(mockDeletePocketbaseRecord).toHaveBeenCalledWith(
        'pb-record-42',
        expect.objectContaining({onError: expect.any(Function)}),
      );
    });
  });

  it('does NOT call deletePocketbaseRecord when postMutation succeeds', async () => {
    setupAndSubmit();

    const pbOnSuccess = mockUploadPocketbase.mock.calls[0][1].onSuccess;
    pbOnSuccess(FAKE_PB_RESPONSE);

    const postOnSuccess = mockPostMutation.mock.calls[0][1].onSuccess;
    postOnSuccess({});

    await waitFor(() => {
      expect(mockDeletePocketbaseRecord).not.toHaveBeenCalled();
    });
  });

  it('does NOT call deletePocketbaseRecord when the PocketBase upload itself fails', async () => {
    setupAndSubmit();

    const pbOnError = mockUploadPocketbase.mock.calls[0][1].onError;
    pbOnError(new Error('PB network error'));

    await waitFor(() => {
      expect(mockDeletePocketbaseRecord).not.toHaveBeenCalled();
    });
  });
});

describe('PreviewScreen compensating delete — improvement path', () => {
  function setupAndSubmit() {
    const store = makeStore();
    const nav = makeNav();
    const {getByText} = render(
      <Provider store={store}>
        <PreviewScreen
          navigation={nav}
          route={makeRoute({requestId: 'req-99'})}
        />
      </Provider>,
    );
    fireEvent.press(getByText('Submit'));
    return {nav};
  }

  it('calls deletePocketbaseRecord with correct recordId when improvementMutation fails', async () => {
    setupAndSubmit();

    const pbOnSuccess =
      mockUploadImprovementToPocketbase.mock.calls[0][1].onSuccess;
    pbOnSuccess(FAKE_PB_RESPONSE);

    const impOnError = mockImprovementMutation.mock.calls[0][1].onError;
    impOnError(new Error('503'));

    await waitFor(() => {
      expect(mockDeletePocketbaseRecord).toHaveBeenCalledTimes(1);
      expect(mockDeletePocketbaseRecord).toHaveBeenCalledWith(
        'pb-record-42',
        expect.objectContaining({onError: expect.any(Function)}),
      );
    });
  });

  it('does NOT call deletePocketbaseRecord when improvementMutation succeeds', async () => {
    setupAndSubmit();

    const pbOnSuccess =
      mockUploadImprovementToPocketbase.mock.calls[0][1].onSuccess;
    pbOnSuccess(FAKE_PB_RESPONSE);

    const impOnSuccess = mockImprovementMutation.mock.calls[0][1].onSuccess;
    impOnSuccess({});

    await waitFor(() => {
      expect(mockDeletePocketbaseRecord).not.toHaveBeenCalled();
    });
  });
});

describe('PreviewScreen compensating delete — edit/suggested-changes path', () => {
  const ARTICLE_DATA = {
    _id: 'art-1',
    pb_recordId: 'old-pb-id',
    authorId: 'user-1',
  };

  function setupAndSubmit() {
    const store = makeStore();
    const nav = makeNav();
    const {getByText} = render(
      <Provider store={store}>
        <PreviewScreen
          navigation={nav}
          route={makeRoute({articleData: ARTICLE_DATA})}
        />
      </Provider>,
    );
    fireEvent.press(getByText('Submit'));
    return {nav};
  }

  it('calls deletePocketbaseRecord with correct recordId when submitChangesMutation fails', async () => {
    setupAndSubmit();

    const pbOnSuccess = mockUploadPocketbase.mock.calls[0][1].onSuccess;
    pbOnSuccess(FAKE_PB_RESPONSE);

    const changesOnError = mockSubmitChangesMutation.mock.calls[0][1].onError;
    changesOnError(new Error('422'));

    await waitFor(() => {
      expect(mockDeletePocketbaseRecord).toHaveBeenCalledTimes(1);
      expect(mockDeletePocketbaseRecord).toHaveBeenCalledWith(
        'pb-record-42',
        expect.objectContaining({onError: expect.any(Function)}),
      );
    });
  });
});