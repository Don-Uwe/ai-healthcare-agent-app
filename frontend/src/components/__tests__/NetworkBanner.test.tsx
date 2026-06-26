import React from 'react';
import { render } from '@testing-library/react-native';
import { NetworkBanner } from '../NetworkBanner';
import { useNetInfo } from '@react-native-community/netinfo';

jest.mock('@react-native-community/netinfo', () => ({
  useNetInfo: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 20, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  return {
    ...Reanimated,
    useSharedValue: jest.fn((init) => ({ value: init })),
    useAnimatedStyle: jest.fn((cb) => cb()),
    withTiming: jest.fn((val, config, cb) => val),
    withSequence: jest.fn((...args) => args[args.length - 1]),
    withDelay: jest.fn((delay, val) => val),
    runOnJS: jest.fn((fn) => fn),
  };
});

describe('NetworkBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render anything when online initially', () => {
    (useNetInfo as jest.Mock).mockReturnValue({
      isConnected: true,
      isInternetReachable: true,
    });
    const { queryByText } = render(<NetworkBanner />);
    expect(queryByText('No Internet Connection')).toBeNull();
    expect(queryByText('Back online')).toBeNull();
  });

  it('renders correctly when the app goes offline', () => {
    (useNetInfo as jest.Mock).mockReturnValue({
      isConnected: false,
      isInternetReachable: false,
    });
    const { getByText } = render(<NetworkBanner />);
    expect(getByText('No Internet Connection')).toBeTruthy();
  });

  it('shows "Back online" message when connectivity is restored', () => {
    // Start offline
    (useNetInfo as jest.Mock).mockReturnValue({
      isConnected: false,
      isInternetReachable: false,
    });
    const { getByText, rerender } = render(<NetworkBanner />);
    expect(getByText('No Internet Connection')).toBeTruthy();

    // Mock restore connectivity
    (useNetInfo as jest.Mock).mockReturnValue({
      isConnected: true,
      isInternetReachable: true,
    });
    rerender(<NetworkBanner />);
    
    expect(getByText('Back online')).toBeTruthy();
  });

  it('handles rapid changes in network status gracefully', () => {
    (useNetInfo as jest.Mock).mockReturnValue({
      isConnected: true,
      isInternetReachable: true,
    });
    const { getByText, rerender } = render(<NetworkBanner />);
    
    // Offline
    (useNetInfo as jest.Mock).mockReturnValue({ isConnected: false, isInternetReachable: false });
    rerender(<NetworkBanner />);
    expect(getByText('No Internet Connection')).toBeTruthy();
    
    // Online
    (useNetInfo as jest.Mock).mockReturnValue({ isConnected: true, isInternetReachable: true });
    rerender(<NetworkBanner />);
    expect(getByText('Back online')).toBeTruthy();
    
    // Offline again rapidly
    (useNetInfo as jest.Mock).mockReturnValue({ isConnected: false, isInternetReachable: false });
    rerender(<NetworkBanner />);
    expect(getByText('No Internet Connection')).toBeTruthy();
  });
});
