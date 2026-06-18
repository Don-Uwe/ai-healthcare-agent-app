import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {Alert} from 'react-native';
import SignupPageFirst from '../auth/SignUpScreenFirst';

const mockNavigate = jest.fn();

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}),
  SafeAreaView: ({children}: any) => children,
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
      white: { val: '#ffffff' },
      black: { val: '#000000' },
    }),
  };
});

jest.mock('react-native-element-dropdown', () => {
  const React = require('react');
  const {View, Text, TouchableOpacity} = require('react-native');
  return {
    Dropdown: ({data, onChange, placeholder}: any) => {
      return React.createElement(
        View,
        null,
        React.createElement(Text, null, placeholder),
        data.map((item: any) =>
          React.createElement(
            TouchableOpacity,
            {
              key: item.value,
              onPress: () => onChange(item),
              testID: `dropdown-item-${item.value}`,
            },
            React.createElement(Text, null, item.label),
          ),
        ),
      );
    },
  };
});

jest.mock('@bam.tech/react-native-image-resizer', () => ({
  createResizedImage: jest.fn(),
}));

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
}));

jest.mock('react-native-snackbar', () => ({
  show: jest.fn(),
  LENGTH_LONG: 1,
  LENGTH_SHORT: 0,
}));

jest.mock('@expo/vector-icons/MaterialIcons', () => {
  const React = require('react');
  const {Text} = require('react-native');
  return () => React.createElement(Text, null, 'Icon');
});

jest.mock('@expo/vector-icons/AntDesign', () => {
  const React = require('react');
  const {Text} = require('react-native');
  return () => React.createElement(Text, null, 'AntDesign');
});

const mockRegisterMutate = jest.fn();
const mockVerifyMailMutate = jest.fn();
const mockCheckAvailability = jest.fn(() => ({ data: { isAvailable: true, message: 'Available' }, isLoading: false }));

jest.mock('@/src/hooks/useCheckUserHandleAvailability', () => ({
  useCheckUserHandleAvailability: () => mockCheckAvailability(),
}));
jest.mock('@/src/hooks/useMailVerification', () => ({
  useVerificationMailMutation: () => ({
    mutate: mockVerifyMailMutate,
    isPending: false,
  }),
}));
jest.mock('@/src/hooks/useUserRegistration', () => ({
  useRegdMutation: () => ({
    mutate: mockRegisterMutate,
    isPending: false,
  }),
}));
jest.mock('../../hooks/useUploadImage', () => () => ({
  uploadImage: jest.fn(() => Promise.resolve('uploaded-img-url')),
  loading: false,
}));

// Mock modal components to trigger their callback when mocked buttons are pressed
jest.mock('../../components/VerifiedModal', () => {
  const React = require('react');
  const {Button, Text} = require('react-native');
  return ({visible, onClick, message}: any) => {
    if (!visible) return null;
    return React.createElement(
      Button,
      {
        title: message || 'Verify',
        onPress: onClick,
        testID: 'verified-modal-btn',
      }
    );
  };
});

jest.mock('../../components/SecurityWarningModal', () => {
  const React = require('react');
  const {Button} = require('react-native');
  return ({visible, onContinue}: any) => {
    if (!visible) return null;
    return React.createElement(
      Button,
      {
        title: 'Continue Registration',
        onPress: onContinue,
        testID: 'security-warning-continue-btn',
      }
    );
  };
});

jest.mock('../../components/Loader', () => {
  const React = require('react');
  const {View} = require('react-native');
  return () => React.createElement(View);
});

describe('SignUpScreenFirst - Crash Prevention and Field Verification Tests', () => {
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
      <SignupPageFirst
        navigation={{navigate: mockNavigate} as any}
      />,
    );

  it('renders sign up form inputs correctly', () => {
    const {getByPlaceholderText, getByText} = renderScreen();
    expect(getByPlaceholderText('Name')).toBeTruthy();
    expect(getByPlaceholderText('User Handle')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Select your role')).toBeTruthy();
  });

  it('watches the email field correctly and does NOT crash during handleVerifyModalCallback (Undeclared email Variable Crash Fix)', async () => {
    const {getByPlaceholderText, getByText, getByTestId, queryByTestId} = renderScreen();

    // Fill form
    fireEvent.changeText(getByPlaceholderText('Name'), 'John Doe');
    fireEvent.changeText(getByPlaceholderText('User Handle'), 'johndoe');
    fireEvent.changeText(getByPlaceholderText('Email'), 'johndoe@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');

    // Select General User role from mocked dropdown
    fireEvent.press(getByText('General User'));

    // Mock registration mutation to succeed and set registration token
    mockRegisterMutate.mockImplementationOnce((variables, options) => {
      options.onSuccess('mock-reg-token');
    });

    // Press Submit (Register button)
    fireEvent.press(getByText('Register'));

    // Security warning modal should open. Trigger continue on security warning
    await waitFor(() => {
      expect(getByTestId('security-warning-continue-btn')).toBeTruthy();
    });
    fireEvent.press(getByTestId('security-warning-continue-btn'));

    // Check that registration api gets called and Verified modal becomes visible
    await waitFor(() => {
      expect(mockRegisterMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'johndoe@example.com',
          user_name: 'John Doe',
          user_handle: 'johndoe',
        }),
        expect.any(Object)
      );
    });

    // Verify email modal should now be visible
    await waitFor(() => {
      expect(getByTestId('verified-modal-btn')).toBeTruthy();
    });

    // Press Verification Modal Button (triggering handleVerifyModalCallback)
    mockVerifyMailMutate.mockImplementationOnce((variables, options) => {
      options.onSuccess('Verification Link Sent');
    });

    fireEvent.press(getByTestId('verified-modal-btn'));

    // Wait and verify verifyEmailMutation got called with correct email parameters
    await waitFor(() => {
      expect(mockVerifyMailMutate).toHaveBeenCalledWith(
        {
          email: 'johndoe@example.com',
          token: 'mock-reg-token',
        },
        expect.any(Object)
      );
    });

    // Verify redirection to LoginScreen
    expect(mockNavigate).toHaveBeenCalledWith('LoginScreen', {});
  });
});
