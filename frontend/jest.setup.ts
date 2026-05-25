import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

// Mock react-native-fs
jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/documents',
  DownloadDirectoryPath: '/mock/downloads',
  ExternalDirectoryPath: '/mock/external',
  ExternalStorageDirectoryPath: '/mock/external-storage',
  TemporaryDirectoryPath: '/mock/temp',
  CachesDirectoryPath: '/mock/caches',
  readDir: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn(),
  unlink: jest.fn(),
  exists: jest.fn(),
  mkdir: jest.fn(),
  moveFile: jest.fn(),
  copyFile: jest.fn(),
  downloadFile: jest.fn(() => ({
    promise: Promise.resolve(),
    jobId: 1,
  })),
}));

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

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));
