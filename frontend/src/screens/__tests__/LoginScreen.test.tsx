import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {Alert} from 'react-native';
import LoginScreen from '../auth/LoginScreen';

const mockNavigate = jest.fn();
const mockReset = jest.fn();
const mockDispatch = jest.fn();

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
}));

jest.mock('react-native-snackbar', () => ({
  show: jest.fn(),
  LENGTH_SHORT: 0,
  LENGTH_LONG: 1,
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}),
}));

jest.mock('tamagui', () => {
  const React = require('react');
  const { Text: RNText, View: RNView, ScrollView: RNScrollView, TextInput: RNTextInput } = require('react-native');
  
  const createMockComponent = (name: string, BaseComp: any) => {
    const Comp = ({ children, ...props }: any) => React.createElement(BaseComp, props, children);
    Comp.displayName = name;
    return Comp;
  };

  return {
    Theme: createMockComponent('Theme', React.Fragment),
    XStack: createMockComponent('XStack', RNView),
    YStack: createMockComponent('YStack', RNView),
    Text: createMockComponent('Text', RNText),
    ScrollView: createMockComponent('ScrollView', RNScrollView),
    Button: createMockComponent('Button', RNView),
    Card: createMockComponent('Card', RNView),
    Paragraph: createMockComponent('Paragraph', RNText),
    Input: createMockComponent('Input', RNTextInput),
    Separator: createMockComponent('Separator', RNView),
    useTheme: () => ({
      blue10: { val: '#0000ff' },
      background: { val: '#ffffff' },
      backgroundStrong: { val: '#ffffff' },
      backgroundHover: { val: '#ffffff' },
      borderColor: { val: '#cccccc' },
      color: { val: '#000000' },
      colorMuted: { val: '#888888' },
    }),
  };
});

jest.mock('@react-native-firebase/messaging', () => {
  const mockMessaging = () => ({
    requestPermission: jest.fn(() => Promise.resolve(1)),
    getToken: jest.fn(() => Promise.resolve('mock-fcm-token')),
  });
  mockMessaging.AuthorizationStatus = {
    AUTHORIZED: 1,
    PROVISIONAL: 2,
  };
  return mockMessaging;
});

const mockLoginMutate = jest.fn();
jest.mock('@/src/hooks/useUserLogin', () => ({
  useLoginMutation: () => ({
    mutate: mockLoginMutate,
    isPending: false,
  }),
}));

jest.mock('@/src/hooks/useResendVerification', () => ({
  useRequestVerification: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
}));

jest.mock('@/src/hooks/useSendOtp', () => ({
  useSendOtpMutation: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
}));

jest.mock('../../helper/SecureStorageUtils', () => ({
  secureStoreItem: jest.fn(() => Promise.resolve()),
  secureRetrieveItem: jest.fn(() => Promise.resolve(null)),
  SECURE_KEYS: {
    USER_TOKEN: 'user_token',
  },
}));

jest.mock('../../helper/Utils', () => ({
  storeItem: jest.fn(() => Promise.resolve()),
  retrieveItem: jest.fn(() => Promise.resolve(null)),
  clearStorage: jest.fn(() => Promise.resolve()),
  KEYS: {
    USER_ID: 'user_id',
    USER_HANDLE: 'user_handle',
    USER_TOKEN_EXPIRY_DATE: 'user_token_expiry_date',
  },
}));

jest.mock('../../components/EmailInputModal', () => {
  const React = require('react');
  const {View} = require('react-native');
  return () => React.createElement(View);
});
jest.mock('../../components/Loader', () => {
  const React = require('react');
  const {View} = require('react-native');
  return () => React.createElement(View);
});

describe('LoginScreen - Security Bypass and Validation Tests', () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  const renderScreen = () =>
    render(
      <LoginScreen
        navigation={{navigate: mockNavigate, reset: mockReset} as any}
        route={{} as any}
      />,
    );

  it('renders email and password inputs and a login button', () => {
    const {getByPlaceholderText, getByText} = renderScreen();
    expect(getByPlaceholderText('Enter your email address')).toBeTruthy();
    expect(getByPlaceholderText('Enter your password')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
  });

  it('does NOT redirect to main feed and displays error on 401 Unauthorized response (Critical Security Bypass Fix)', async () => {
    const {getByPlaceholderText, getByText} = renderScreen();

    // Type email & password
    fireEvent.changeText(getByPlaceholderText('Enter your email address'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'wrongpassword');

    // Mock login mutation failure with 401 response
    mockLoginMutate.mockImplementationOnce((variables, options) => {
      const error: any = {
        response: {
          status: 401,
        },
      };
      options.onError(error);
    });

    // Press Login
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(mockLoginMutate).toHaveBeenCalled();
    });

    // Ensure error alert is shown with correct message
    expect(alertSpy).toHaveBeenCalledWith('Error', 'Invalid password');

    // Crucially: Make sure reset navigation was NEVER called (the security bypass vulnerability)
    expect(mockReset).not.toHaveBeenCalled();
  });

  it('redirects to main feed on successful authentication', async () => {
    jest.useFakeTimers();
    const {getByPlaceholderText, getByText} = renderScreen();

    fireEvent.changeText(getByPlaceholderText('Enter your email address'), 'correct@example.com');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'validpassword');

    // Mock successful response
    mockLoginMutate.mockImplementationOnce((variables, options) => {
      const successData = {
        _id: 'user-id-123',
        refreshToken: 'valid-refresh-token',
        user_handle: 'correct_user',
      };
      options.onSuccess(successData);
    });

    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(mockLoginMutate).toHaveBeenCalled();
    });

    // Fast-forward timeout
    jest.runAllTimers();

    // Verification that navigation.reset WAS called to redirect to TabNavigation
    expect(mockReset).toHaveBeenCalledWith({
      index: 0,
      routes: [{name: 'TabNavigation'}],
    });
    
    jest.useRealTimers();
  });
});
