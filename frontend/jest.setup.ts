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

jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  wrap: jest.fn((component) => component),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setUser: jest.fn(),
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
      background: { val: '#ffffff' },
      backgroundStrong: { val: '#ffffff' },
      backgroundHover: { val: '#ffffff' },
      borderColor: { val: '#cccccc' },
      color: { val: '#000000' },
      colorMuted: { val: '#888888' },
    }),
  };
});

