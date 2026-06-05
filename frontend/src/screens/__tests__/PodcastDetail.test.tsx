import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import PodcastDetail from '../PodcastDetail';

const mockNavigate = jest.fn();
const mockRefetch = jest.fn();
const mockLikePodcast = jest.fn();
const mockPlayer = {
  playing: false,
  currentTime: 12,
  duration: 245,
  currentStatus: {
    playing: false,
    isLoaded: true,
    currentTime: 12,
    duration: 245,
  },
  play: jest.fn(),
  pause: jest.fn(),
  seekTo: jest.fn(),
  replace: jest.fn(),
};

jest.mock('@expo/vector-icons/Ionicons', () => {
  const React = require('react');
  const {Text} = require('react-native');
  const MockIcon = ({name}: {name: string}) => React.createElement(Text, null, name);
  MockIcon.displayName = 'Ionicons';
  return MockIcon;
});
jest.mock('@expo/vector-icons/AntDesign', () => {
  const React = require('react');
  const {Text} = require('react-native');
  const MockIcon = ({name}: {name: string}) => React.createElement(Text, null, name);
  MockIcon.displayName = 'AntDesign';
  return MockIcon;
});
jest.mock('@expo/vector-icons/Feather', () => {
  const React = require('react');
  const {Text} = require('react-native');
  const MockIcon = ({name}: {name: string}) => React.createElement(Text, null, name);
  MockIcon.displayName = 'Feather';
  return MockIcon;
});
jest.mock('lottie-react-native', () => 'LottieView');
jest.mock('@react-native-community/slider', () => {
  const React = require('react');
  const {View} = require('react-native');
  const MockSlider = ({testID}: {testID?: string}) =>
    React.createElement(View, {testID: testID ?? 'slider'});
  MockSlider.displayName = 'Slider';
  return MockSlider;
});

jest.mock('react-native-snackbar', () => ({
  show: jest.fn(),
  LENGTH_SHORT: 0,
}));

jest.mock('react-native-share', () => ({
  open: jest.fn(),
}));

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(() => jest.fn()),
}));

jest.mock('../../contexts/SocketContext', () => ({
  useSocket: jest.fn(() => ({
    emit: jest.fn(),
  })),
}));

jest.mock('../../helper/Utils', () => ({
  downloadAudio: jest.fn(),
  formatCount: (value: number) => String(value),
  StatusEnum: {
    PUBLISHED: 'PUBLISHED',
  },
}));

jest.mock('../../helper/Theme', () => ({
  PRIMARY_COLOR: '#4ACDFF',
}));

jest.mock('../../helper/APIUtils', () => ({
  GET_IMAGE: 'https://example.com',
}));

jest.mock('../../helper/Metric', () => ({
  fp: (value: number) => value,
}));

jest.mock('../../styles/GlassStyles', () => ({
  GlassStyles: {
    glassContainerDark: {},
  },
}));

jest.mock('../../hooks/useGetSinglePodcastDetails', () => ({
  useGetSinglePodcastDetails: jest.fn(),
}));

jest.mock('../../hooks/useLikePodcast', () => ({
  useLikePodcast: jest.fn(),
}));

jest.mock('expo-audio', () => ({
  useAudioPlayer: jest.fn(() => mockPlayer),
}));

jest.mock('../../../assets/sounds/funny-cartoon-sound-397415.mp3', () => 1, {
  virtual: true,
});

jest.mock('tamagui', () => {
  const React = require('react');
  const {Text: RNText, View: RNView, ScrollView: RNScrollView} = require('react-native');
  return {
    Theme: ({children}: any) => React.createElement(React.Fragment, null, children),
    XStack: ({children, ...props}: any) => React.createElement(RNView, props, children),
    YStack: ({children, ...props}: any) => React.createElement(RNView, props, children),
    Text: ({children, ...props}: any) => React.createElement(RNText, props, children),
    ScrollView: ({children, ...props}: any) => React.createElement(RNScrollView, props, children),
  };
});

jest.mock('../../components/Loader', () => {
  const React = require('react');
  const {Text} = require('react-native');
  const MockLoader = () => React.createElement(Text, {testID: 'loader'}, 'Loading');
  MockLoader.displayName = 'Loader';
  return MockLoader;
});

jest.mock('../../components/LoadingSpinner', () => {
  const React = require('react');
  const {Text} = require('react-native');
  const MockSpinner = () => React.createElement(Text, {testID: 'loading-spinner'}, 'LoadingSpinner');
  MockSpinner.displayName = 'LoadingSpinner';
  return MockSpinner;
});

const mockPodcast = {
  _id: 'podcast-1',
  user_id: {
    _id: 'user-1',
    user_name: 'John Doe',
    user_handle: 'john-doe',
    Profile_image: '',
  },
  article_id: 1,
  title: 'Sample Podcast',
  description: 'Sample description for the podcast detail screen.',
  audio_url: 'https://example.com/audio.mp3',
  cover_image: 'https://example.com/image.jpg',
  duration: 245,
  tags: [],
  likedUsers: [],
  savedUsers: [],
  viewUsers: [],
  viewCount: 0,
  discardReason: '',
  is_removed: false,
  mentionedUsers: [],
  reportId: null,
  status: 'PUBLISHED',
  admin_id: null,
  updated_at: '2026-01-01T00:00:00.000Z',
  filePath: undefined,
  downloadAt: null,
  commentCount: 7,
};

const mockUseSelector = require('react-redux').useSelector as jest.Mock;
const mockUseGetSinglePodcastDetails = require('../../hooks/useGetSinglePodcastDetails').useGetSinglePodcastDetails as jest.Mock;
const mockUseLikePodcast = require('../../hooks/useLikePodcast').useLikePodcast as jest.Mock;

describe('PodcastDetail', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    mockPlayer.playing = false;
    mockPlayer.currentStatus.playing = false;
    mockPlayer.currentStatus.currentTime = 12;
    mockPlayer.currentStatus.duration = 245;
    mockUseSelector.mockImplementation((selector: any) =>
      selector({
        user: {
          user_token: 'token',
          user_id: 'user-1',
          user_handle: 'john-doe',
          isGuest: false,
        },
        network: {
          isConnected: true,
        },
      }),
    );
    mockUseGetSinglePodcastDetails.mockReturnValue({
      data: mockPodcast,
      refetch: mockRefetch,
      isLoading: false,
      isError: false,
      error: null,
    });
    mockLikePodcast.mockReturnValue({
      mutate: mockLikePodcast,
      isPending: false,
    });
    mockUseLikePodcast.mockReturnValue({
      mutate: mockLikePodcast,
      isPending: false,
    });
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  const renderScreen = () =>
    render(
      <PodcastDetail
        navigation={{navigate: mockNavigate} as any}
        route={{params: {trackId: 'podcast-1', audioUrl: 'https://example.com/audio.mp3'}} as any}
      />,
    );

  it('renders podcast metadata and player controls', () => {
    const {getByText, getByTestId} = renderScreen();

    expect(getByText('Sample Podcast')).toBeTruthy();
    expect(getByText('Sample description for the podcast detail screen.')).toBeTruthy();
    expect(getByTestId('podcast-cover-image')).toBeTruthy();
    expect(getByTestId('podcast-progress-slider')).toBeTruthy();
    expect(getByTestId('podcast-back-button')).toBeTruthy();
    expect(getByTestId('podcast-play-pause-button')).toBeTruthy();
    expect(getByTestId('podcast-forward-button')).toBeTruthy();
  });

  it('renders loading state while podcast data is loading', () => {
    mockUseGetSinglePodcastDetails.mockReturnValueOnce({
      data: null,
      refetch: mockRefetch,
      isLoading: true,
      isError: false,
      error: null,
    });

    const {getByTestId, queryByText} = renderScreen();

    expect(getByTestId('loader')).toBeTruthy();
    expect(queryByText('Sample Podcast')).toBeNull();
  });

  it('renders an error fallback when podcast loading fails', () => {
    mockUseGetSinglePodcastDetails.mockReturnValueOnce({
      data: null,
      refetch: mockRefetch,
      isLoading: false,
      isError: true,
      error: new Error('Request failed'),
    });

    const {getByTestId, getByText} = renderScreen();

    expect(getByTestId('podcast-detail-error')).toBeTruthy();
    expect(getByText('Unable to load podcast details.')).toBeTruthy();
    expect(getByText('Request failed')).toBeTruthy();
  });

  it('switches play control state when the play button is pressed', () => {
    const {getByLabelText} = renderScreen();

    fireEvent.press(getByLabelText('podcast-play-pause-button'));

    expect(mockPlayer.play).toHaveBeenCalled();
  });

  it('renders accessible controls and slider labels', () => {
    const {getByLabelText, getByTestId} = renderScreen();

    expect(getByLabelText('podcast-back-button')).toBeTruthy();
    expect(getByLabelText('podcast-play-pause-button')).toBeTruthy();
    expect(getByLabelText('podcast-forward-button')).toBeTruthy();
    expect(getByTestId('podcast-progress-slider')).toBeTruthy();
  });
});
