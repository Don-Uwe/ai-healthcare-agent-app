import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock removed as NativeAnimatedHelper is not present in newer React Native versions

// Mock expo modules that might fail in test environment
jest.mock('expo-font', () => ({
  isLoaded: jest.fn().mockReturnValue(true),
  isLoading: jest.fn().mockReturnValue(false),
  loadAsync: jest.fn().mockResolvedValue(true),
}));

jest.mock('expo-constants', () => ({
  manifest: {
    extra: {},
  },
  expoConfig: {
    extra: {},
  },
}));
