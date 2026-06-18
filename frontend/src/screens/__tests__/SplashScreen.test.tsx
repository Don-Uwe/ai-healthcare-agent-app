import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import SplashScreen from '../SplashScreen';
import {clearStorage} from '../../helper/Utils';

const mockNavigate = jest.fn();
const mockReset = jest.fn();
const mockDispatch = jest.fn();

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
}));

const mockCheckTokenStatus = jest.fn();
jest.mock('@/src/hooks/useGetTokenStatus', () => ({
  useCheckTokenStatus: () => mockCheckTokenStatus(),
}));

jest.mock('../../helper/Utils', () => {
  const original = jest.requireActual('../../helper/Utils');
  return {
    ...original,
    clearStorage: jest.fn(() => Promise.resolve()),
    retrieveItem: jest.fn((key) => {
      if (key === 'USER_ID') return Promise.resolve('user-id-123');
      if (key === 'USER_HANDLE') return Promise.resolve('john_doe');
      return Promise.resolve(null);
    }),
  };
});

jest.mock('../../helper/SecureStorageUtils', () => ({
  secureRetrieveItem: jest.fn((key) => {
    if (key === 'SECURE_USER_TOKEN') return Promise.resolve('valid-token');
    return Promise.resolve(null);
  }),
  SECURE_KEYS: {
    USER_TOKEN: 'SECURE_USER_TOKEN',
  },
}));

describe('SplashScreen - Offline Session and Auto-Login Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderScreen = () =>
    render(
      <SplashScreen
        navigation={{navigate: mockNavigate, reset: mockReset} as any}
      />,
    );

  it('performs auto-login and redirects to TabNavigation when token is valid', async () => {
    // Mock valid token response
    mockCheckTokenStatus.mockReturnValue({
      data: {isValid: true, message: 'Valid token'},
      isLoading: false,
    });

    const {getByText} = renderScreen();
    // Verify token check runs, dispatches actions, and redirects to main feed
    await waitFor(() => {
      console.log('mockDispatch calls:', mockDispatch.mock.calls);
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({type: 'user/setUserId', payload: 'user-id-123'}));
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({type: 'user/setUserToken', payload: 'valid-token'}));
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({type: 'user/setUserHandle', payload: 'john_doe'}));
      expect(mockReset).toHaveBeenCalledWith({
        index: 0,
        routes: [{name: 'TabNavigation'}],
      });
      expect(clearStorage).not.toHaveBeenCalled();
    });
  });

  it('allows offline access and redirects to TabNavigation on network connectivity errors when local token is present (Offline Support Fix)', async () => {
    // Mock network error response
    mockCheckTokenStatus.mockReturnValue({
      data: {isValid: false, isNetworkError: true, message: 'Offline state'},
      isLoading: false,
    });

    renderScreen();

    // Verify it allows offline mode instead of calling clearStorage
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({type: 'user/setUserId', payload: 'user-id-123'}));
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({type: 'user/setUserToken', payload: 'valid-token'}));
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({type: 'user/setUserHandle', payload: 'john_doe'}));
      expect(mockReset).toHaveBeenCalledWith({
        index: 0,
        routes: [{name: 'TabNavigation'}],
      });
      expect(clearStorage).not.toHaveBeenCalled();
    });
  });

  it('clears session and redirects to LoginScreen when token is invalid and not a network error', async () => {
    // Mock invalid token response
    mockCheckTokenStatus.mockReturnValue({
      data: {isValid: false, isNetworkError: false, message: 'Invalid token'},
      isLoading: false,
    });

    renderScreen();

    // Verify it forces logout by clearing storage and resetting navigation to LoginScreen
    await waitFor(() => {
      expect(clearStorage).toHaveBeenCalled();
      expect(mockReset).toHaveBeenCalledWith({
        index: 0,
        routes: [{name: 'LoginScreen'}],
      });
    });
  });
});
