import React from 'react';
import {Alert} from 'react-native';
import {fireEvent, render, waitFor} from '@testing-library/react-native';
import LogoutScreen from '../auth/LogoutScreen';

const mockDispatch = jest.fn();
const mockReset = jest.fn();
const mockClearStorage = jest.fn(() => Promise.resolve());
const mockLogout = jest.fn();

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
}));

jest.mock('../../hooks/useUserLogout', () => ({
  useUserLogout: () => ({
    mutate: mockLogout,
  }),
}));

jest.mock('../../helper/Utils', () => ({
  clearStorage: () => mockClearStorage(),
}));

jest.mock('../../store/UserSlice', () => ({
  resetUserState: () => ({type: 'user/resetUserState'}),
}));

jest.mock('../../helper/APIUtils', () => ({
  GET_STORAGE_DATA: 'https://storage.example.com',
}));

jest.mock('../../helper/Theme', () => ({
  PRIMARY_COLOR: '#000A60',
}));

jest.mock('tamagui', () => ({
  useTheme: () => ({
    background: {val: '#ffffff'},
    black: {val: '#000000'},
    color: {val: '#000000'},
    gray500: {val: '#666666'},
    white: {val: '#ffffff'},
  }),
}));

const renderScreen = () =>
  render(
    <LogoutScreen
      navigation={{reset: mockReset, goBack: jest.fn()} as any}
      route={{
        params: {profile_image: '', username: 'Test User'},
      } as any}
    />,
  );

describe('LogoutScreen local logout behavior', () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  const expectLocalLogout = async () => {
    await waitFor(() => {
      expect(mockClearStorage).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'user/resetUserState',
      });
      expect(mockReset).toHaveBeenCalledWith({
        index: 0,
        routes: [{name: 'LoginScreen'}],
      });
    });
  };

  it('clears local session after confirmed server logout', async () => {
    mockLogout.mockImplementation((_variables, options) => {
      void options.onSuccess();
    });

    const {getByText} = renderScreen();
    fireEvent.press(getByText('Yes, log me out'));

    await expectLocalLogout();
    expect(alertSpy).toHaveBeenCalledWith(
      'Success',
      'Logged out successfully',
    );
  });

  it('clears local session when the server returns an error', async () => {
    mockLogout.mockImplementation((_variables, options) => {
      void options.onError({response: {status: 500}});
    });

    const {getByText} = renderScreen();
    fireEvent.press(getByText('Yes, log me out'));

    await expectLocalLogout();
    expect(alertSpy).toHaveBeenCalledWith(
      'Signed out locally',
      'The server could not confirm logout, but this device has been signed out.',
    );
  });

  it('clears local session when the device is offline', async () => {
    mockLogout.mockImplementation((_variables, options) => {
      void options.onError(new Error('Network Error'));
    });

    const {getByText} = renderScreen();
    fireEvent.press(getByText('Yes, log me out'));

    await expectLocalLogout();
    expect(alertSpy).toHaveBeenCalledWith(
      'Signed out locally',
      'You are offline, but this device has been signed out.',
    );
  });
});
