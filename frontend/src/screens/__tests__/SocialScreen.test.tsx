import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import SocialScreen from '../SocialScreen';

const mockNavigate = jest.fn();
const mockSetOptions = jest.fn();
const mockRefetch = jest.fn();
const mockFollowMutate = jest.fn();
const mockSocketEmit = jest.fn();

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}),
}));

jest.mock('react-redux', () => ({
  useSelector: (selectorFn: any) => selectorFn({
    user: {
      user_id: 'my-user-id',
      user_handle: 'my_handle',
    },
  }),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: jest.fn(),
  }),
}));

jest.mock('../../contexts/SocketContext', () => ({
  useSocket: () => ({
    emit: mockSocketEmit,
  }),
}));

jest.mock('../../components/Loader', () => {
  const React = require('react');
  const {View} = require('react-native');
  return () => React.createElement(View, {testID: 'loader'});
});

jest.mock('../../components/LoadingSpinner', () => {
  const React = require('react');
  const {View} = require('react-native');
  return () => React.createElement(View, {testID: 'loading-spinner'});
});

const mockSocialsList = [
  {
    _id: 'user-1',
    user_name: 'Follower One',
    Profile_image: 'image1.jpg',
    followers: ['my-user-id'],
  },
  {
    _id: 'user-2',
    user_name: 'Follower Two',
    Profile_image: '',
    followers: [],
  },
];

jest.mock('../../hooks/useGetUserSocialCircle', () => ({
  useGetUserSocials: () => ({
    data: mockSocialsList,
    refetch: mockRefetch,
    isLoading: false,
  }),
}));

jest.mock('../../hooks/useUpdateFollowStatus', () => ({
  useUpdateFollowStatus: () => ({
    mutate: mockFollowMutate,
    isPending: false,
  }),
}));

jest.mock('react-native-snackbar', () => ({
  show: jest.fn(),
  LENGTH_SHORT: 0,
}));

describe('SocialScreen - Follow Action and Notification Race Condition Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderScreen = (type: number = 1) =>
    render(
      <SocialScreen
        navigation={{navigate: mockNavigate, setOptions: mockSetOptions} as any}
        route={{params: {type, articleId: 'article-123', social_user_id: 'user-1'}} as any}
      />,
    );

  it('renders follower list correctly', () => {
    const {getByText} = renderScreen();
    expect(getByText('Follower One')).toBeTruthy();
    expect(getByText('Follower Two')).toBeTruthy();
  });

  it('emits follow notification with correct follower ID directly, avoiding state race condition (Follow Notification Race Condition Fix)', async () => {
    const {getAllByText} = renderScreen();

    // Mock mutate call to trigger onSuccess
    mockFollowMutate.mockImplementationOnce((targetId, options) => {
      options.onSuccess(true);
    });

    // Locate the "Follow" button for Follower Two (user-2) and press it
    const followButtons = getAllByText('Follow');
    fireEvent.press(followButtons[0]); // First item in list with 'Follow' is user-2

    // Wait and verify that mutate got called with the correct ID
    await waitFor(() => {
      expect(mockFollowMutate).toHaveBeenCalledWith('user-2', expect.any(Object));
    });

    // Crucially: verify socket.emit is called with correct target ID
    // directly from the follower object, preventing the state race condition.
    expect(mockSocketEmit).toHaveBeenCalledWith('notification', expect.objectContaining({
      type: 'userFollow',
      userId: 'user-2',
      message: expect.objectContaining({
        title: 'my_handle has followed you',
      }),
    }));

    // Verify refetching socials list on success
    expect(mockRefetch).toHaveBeenCalled();
  });
});
