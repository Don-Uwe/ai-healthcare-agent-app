# UltimateHealth - Testing Guidelines

## Table of Contents
1. [Overview](#overview)
2. [Testing Philosophy](#testing-philosophy)
3. [Testing Stack](#testing-stack)
4. [Test Structure](#test-structure)
5. [Testing Types](#testing-types)
6. [Component Testing Guidelines](#component-testing-guidelines)
7. [API Hook Testing Guidelines](#api-hook-testing-guidelines)
8. [Redux Store Testing](#redux-store-testing)
9. [Screen Testing Guidelines](#screen-testing-guidelines)
10. [Integration Testing](#integration-testing)
11. [E2E Testing](#e2e-testing)
12. [Mocking Guidelines](#mocking-guidelines)
13. [Test Coverage Requirements](#test-coverage-requirements)
14. [Best Practices](#best-practices)
15. [Common Pitfalls](#common-pitfalls)
16. [Running Tests](#running-tests)

---

## Overview

UltimateHealth is a React Native + Expo application built with TypeScript, Redux Toolkit, and React Query. This document outlines comprehensive testing guidelines for all aspects of the application.

**Current Status**: Testing infrastructure needs to be established. This document serves as the roadmap for implementing a robust testing strategy.

---

## Testing Philosophy

### Core Principles

1. **Test Behavior, Not Implementation** - Focus on what the user sees and does
2. **Write Tests Before Fixing Bugs** - Every bug fix should start with a failing test
3. **Maintainable Tests** - Tests should be easy to read and update
4. **Fast Feedback Loop** - Tests should run quickly during development
5. **Confidence Over Coverage** - 100% coverage doesn't mean bug-free code

### Testing Pyramid

```
     /\
    /E2E\         <- Few, critical user flows (5-10%)
   /------\
  /Integration\   <- Key feature flows (20-30%)
 /------------\
/   Unit Tests  \  <- Most tests here (60-70%)
```

---

## Testing Stack

### Required Dependencies

```json
{
  "devDependencies": {
    "@testing-library/react-native": "^12.0.0",
    "@testing-library/jest-native": "^5.4.0",
    "@testing-library/react-hooks": "^8.0.1",
    "@testing-library/user-event": "^14.0.0",
    "jest": "^29.0.0",
    "jest-expo": "^51.0.0",
    "@types/jest": "^29.0.0",
    "react-test-renderer": "^18.0.0",
    "redux-mock-store": "^1.5.4",
    "axios-mock-adapter": "^1.22.0",
    "jest-websocket-mock": "^2.5.0",
    "@testing-library/jest-dom": "^6.0.0",
    "detox": "^20.0.0" // For E2E testing
  }
}
```

### Jest Configuration

Create/Update `jest.config.js`:

```javascript
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
    '<rootDir>/jest.setup.js'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@gorhom/bottom-sheet|tamagui|@tamagui/.*)'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/**/index.ts',
    '!src/assets/**',
    '!src/type.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  testMatch: [
    '**/__tests__/**/*.test.{ts,tsx}',
    '**/*.test.{ts,tsx}'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@assets/(.*)$': '<rootDir>/src/assets/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@screens/(.*)$': '<rootDir>/src/screens/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@helper/(.*)$': '<rootDir>/src/helper/$1',
    '^@store/(.*)$': '<rootDir>/src/store/$1'
  }
};
```

---

## Test Structure

### Directory Organization

```
frontend/
├── src/
│   ├── components/
│   │   ├── ArticleCard/
│   │   │   ├── ArticleCard.tsx
│   │   │   └── __tests__/
│   │   │       ├── ArticleCard.test.tsx
│   │   │       └── ArticleCard.integration.test.tsx
│   ├── hooks/
│   │   ├── useGetArticleContent.ts
│   │   └── __tests__/
│   │       └── useGetArticleContent.test.ts
│   ├── screens/
│   │   ├── article/
│   │   │   ├── ArticleScreen.tsx
│   │   │   └── __tests__/
│   │   │       └── ArticleScreen.test.tsx
│   ├── store/
│   │   ├── slices/
│   │   │   ├── userSlice.ts
│   │   │   └── __tests__/
│   │   │       └── userSlice.test.ts
│   └── helper/
│       ├── apiConfig.ts
│       └── __tests__/
│           └── apiConfig.test.ts
└── __tests__/
    ├── setup/
    │   ├── jest.setup.js
    │   ├── mocks.ts
    │   └── testUtils.tsx
    ├── e2e/
    │   ├── auth.e2e.test.ts
    │   ├── article.e2e.test.ts
    │   └── podcast.e2e.test.ts
    └── integration/
        ├── articleFlow.test.tsx
        └── authFlow.test.tsx
```

### Naming Conventions

- **Unit tests**: `ComponentName.test.tsx`
- **Integration tests**: `featureName.integration.test.tsx`
- **E2E tests**: `featureName.e2e.test.ts`
- **Test utilities**: `testUtils.ts`, `mocks.ts`

---

## Testing Types

### 1. Unit Tests (60-70%)

Test individual functions, components, and hooks in isolation.

**What to Test:**
- Pure utility functions
- Component rendering with different props
- Custom hooks
- Redux reducers and actions
- API configuration functions

**Example:**
```typescript
// src/helper/__tests__/validator.test.ts
import { validateEmail } from '../validator';

describe('validateEmail', () => {
  it('should return true for valid email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });

  it('should return false for invalid email', () => {
    expect(validateEmail('invalid-email')).toBe(false);
  });
});
```

### 2. Integration Tests (20-30%)

Test how multiple components/modules work together.

**What to Test:**
- Component + API hooks
- Navigation flows
- Redux store + components
- Form submission flows

### 3. E2E Tests (5-10%)

Test complete user journeys.

**What to Test:**
- Login → Browse Articles → Read Article
- Create Article → Preview → Publish
- Record Podcast → Upload → Publish
- User Registration → Email Verification → Profile Setup

---

## Component Testing Guidelines

### Basic Component Test Template

```typescript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { ArticleCard } from '../ArticleCard';
import { mockArticle } from '@/__tests__/setup/mocks';

describe('ArticleCard', () => {
  it('should render article title and author', () => {
    render(<ArticleCard article={mockArticle} />);

    expect(screen.getByText(mockArticle.title)).toBeTruthy();
    expect(screen.getByText(mockArticle.author.name)).toBeTruthy();
  });

  it('should call onPress when tapped', () => {
    const onPress = jest.fn();
    render(<ArticleCard article={mockArticle} onPress={onPress} />);

    fireEvent.press(screen.getByTestId('article-card'));

    expect(onPress).toHaveBeenCalledWith(mockArticle.id);
  });

  it('should show like count', () => {
    render(<ArticleCard article={{ ...mockArticle, likes: 42 }} />);

    expect(screen.getByText('42')).toBeTruthy();
  });
});
```

### Testing Components with Navigation

```typescript
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

const renderWithNavigation = (component: React.ReactElement) => {
  return render(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Test" component={() => component} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

describe('ArticleScreen', () => {
  it('should navigate to author profile on author tap', () => {
    const navigation = { navigate: jest.fn() };
    renderWithNavigation(<ArticleScreen navigation={navigation} />);

    fireEvent.press(screen.getByTestId('author-avatar'));

    expect(navigation.navigate).toHaveBeenCalledWith('Profile', {
      userId: mockArticle.author.id
    });
  });
});
```

### Testing Components with Redux

```typescript
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '@/store/slices/userSlice';

const renderWithRedux = (
  component: React.ReactElement,
  initialState = {}
) => {
  const store = configureStore({
    reducer: { user: userReducer },
    preloadedState: initialState
  });

  return render(<Provider store={store}>{component}</Provider>);
};

describe('ProfileHeader', () => {
  it('should display logged in user name', () => {
    const initialState = {
      user: {
        currentUser: { name: 'John Doe', email: 'john@example.com' }
      }
    };

    renderWithRedux(<ProfileHeader />, initialState);

    expect(screen.getByText('John Doe')).toBeTruthy();
  });
});
```

### Testing Async Components

```typescript
describe('ArticleList', () => {
  it('should show loading state initially', () => {
    render(<ArticleList />);

    expect(screen.getByTestId('loading-spinner')).toBeTruthy();
  });

  it('should display articles after loading', async () => {
    render(<ArticleList />);

    await waitFor(() => {
      expect(screen.getByText('Article 1')).toBeTruthy();
      expect(screen.getByText('Article 2')).toBeTruthy();
    });
  });

  it('should show error message on fetch failure', async () => {
    // Mock API to return error
    jest.spyOn(api, 'getArticles').mockRejectedValue(new Error('Network error'));

    render(<ArticleList />);

    await waitFor(() => {
      expect(screen.getByText(/error loading articles/i)).toBeTruthy();
    });
  });
});
```

---

## API Hook Testing Guidelines

### Testing React Query Hooks

```typescript
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGetArticleContent } from '../useGetArticleContent';
import * as api from '@/helper/apiConfig';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useGetArticleContent', () => {
  it('should fetch article content successfully', async () => {
    const mockArticle = { id: '123', title: 'Test Article', content: 'Content' };
    jest.spyOn(api, 'getArticleContent').mockResolvedValue(mockArticle);

    const { result } = renderHook(() => useGetArticleContent('123'), {
      wrapper: createWrapper()
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockArticle);
  });

  it('should handle error state', async () => {
    jest.spyOn(api, 'getArticleContent').mockRejectedValue(
      new Error('Article not found')
    );

    const { result } = renderHook(() => useGetArticleContent('999'), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Article not found');
  });
});
```

### Testing Mutation Hooks

```typescript
describe('useCreateArticle', () => {
  it('should create article successfully', async () => {
    const mockArticle = { title: 'New Article', content: 'Content' };
    jest.spyOn(api, 'createArticle').mockResolvedValue({ id: '123', ...mockArticle });

    const { result } = renderHook(() => useCreateArticle(), {
      wrapper: createWrapper()
    });

    act(() => {
      result.current.mutate(mockArticle);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.id).toBe('123');
    expect(api.createArticle).toHaveBeenCalledWith(mockArticle);
  });

  it('should handle validation errors', async () => {
    jest.spyOn(api, 'createArticle').mockRejectedValue(
      new Error('Title is required')
    );

    const { result } = renderHook(() => useCreateArticle(), {
      wrapper: createWrapper()
    });

    act(() => {
      result.current.mutate({ title: '', content: 'Content' });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Title is required');
  });
});
```

---

## Redux Store Testing

### Testing Reducers

```typescript
import userReducer, { setUser, clearUser, updateProfile } from '../userSlice';

describe('userSlice', () => {
  const initialState = {
    currentUser: null,
    isAuthenticated: false,
    loading: false
  };

  it('should handle setUser', () => {
    const user = { id: '123', name: 'John Doe', email: 'john@example.com' };
    const state = userReducer(initialState, setUser(user));

    expect(state.currentUser).toEqual(user);
    expect(state.isAuthenticated).toBe(true);
  });

  it('should handle clearUser', () => {
    const stateWithUser = {
      currentUser: { id: '123', name: 'John Doe' },
      isAuthenticated: true,
      loading: false
    };

    const state = userReducer(stateWithUser, clearUser());

    expect(state.currentUser).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should handle updateProfile', () => {
    const stateWithUser = {
      currentUser: { id: '123', name: 'John Doe', bio: 'Old bio' },
      isAuthenticated: true,
      loading: false
    };

    const updates = { bio: 'New bio', location: 'New York' };
    const state = userReducer(stateWithUser, updateProfile(updates));

    expect(state.currentUser?.bio).toBe('New bio');
    expect(state.currentUser?.location).toBe('New York');
  });
});
```

### Testing Async Thunks

```typescript
import { configureStore } from '@reduxjs/toolkit';
import userReducer, { loginUser } from '../userSlice';
import * as api from '@/helper/apiConfig';

describe('loginUser thunk', () => {
  it('should handle successful login', async () => {
    const mockUser = { id: '123', name: 'John', token: 'abc123' };
    jest.spyOn(api, 'login').mockResolvedValue(mockUser);

    const store = configureStore({ reducer: { user: userReducer } });

    await store.dispatch(loginUser({ email: 'john@example.com', password: 'pass123' }));

    const state = store.getState().user;
    expect(state.currentUser).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.loading).toBe(false);
  });

  it('should handle login failure', async () => {
    jest.spyOn(api, 'login').mockRejectedValue(new Error('Invalid credentials'));

    const store = configureStore({ reducer: { user: userReducer } });

    await store.dispatch(loginUser({ email: 'wrong@example.com', password: 'wrong' }));

    const state = store.getState().user;
    expect(state.currentUser).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBe('Invalid credentials');
  });
});
```

---

## Screen Testing Guidelines

### Testing Screen Rendering

```typescript
import { ArticleScreen } from '../ArticleScreen';
import { renderWithProviders } from '@/__tests__/setup/testUtils';

describe('ArticleScreen', () => {
  it('should render article content', async () => {
    const mockArticle = {
      id: '123',
      title: 'Test Article',
      content: '<p>Article content</p>',
      author: { name: 'John Doe' }
    };

    renderWithProviders(<ArticleScreen route={{ params: { id: '123' } }} />);

    await waitFor(() => {
      expect(screen.getByText('Test Article')).toBeTruthy();
      expect(screen.getByText('John Doe')).toBeTruthy();
    });
  });

  it('should show like button and handle like action', async () => {
    renderWithProviders(<ArticleScreen route={{ params: { id: '123' } }} />);

    const likeButton = await screen.findByTestId('like-button');
    expect(likeButton).toBeTruthy();

    fireEvent.press(likeButton);

    await waitFor(() => {
      expect(screen.getByTestId('like-button-active')).toBeTruthy();
    });
  });

  it('should handle share action', async () => {
    const mockShare = jest.fn();
    jest.mock('react-native-share', () => ({ default: mockShare }));

    renderWithProviders(<ArticleScreen route={{ params: { id: '123' } }} />);

    const shareButton = await screen.findByTestId('share-button');
    fireEvent.press(shareButton);

    expect(mockShare).toHaveBeenCalled();
  });
});
```

---

## Integration Testing

### Testing Complete User Flows

```typescript
describe('Article Creation Flow', () => {
  it('should allow user to create and publish article', async () => {
    const { store } = renderWithProviders(<App />);

    // Navigate to create article screen
    const createButton = screen.getByTestId('create-article-button');
    fireEvent.press(createButton);

    // Fill in article details
    const titleInput = await screen.findByTestId('article-title-input');
    fireEvent.changeText(titleInput, 'My New Article');

    const contentInput = screen.getByTestId('article-content-input');
    fireEvent.changeText(contentInput, 'This is the article content');

    // Preview article
    const previewButton = screen.getByTestId('preview-button');
    fireEvent.press(previewButton);

    await waitFor(() => {
      expect(screen.getByText('My New Article')).toBeTruthy();
    });

    // Publish article
    const publishButton = screen.getByTestId('publish-button');
    fireEvent.press(publishButton);

    await waitFor(() => {
      expect(screen.getByText('Article published successfully')).toBeTruthy();
    });

    // Verify article appears in list
    const backButton = screen.getByTestId('back-button');
    fireEvent.press(backButton);

    await waitFor(() => {
      expect(screen.getByText('My New Article')).toBeTruthy();
    });
  });
});
```

### Testing Authentication Flow

```typescript
describe('Authentication Flow', () => {
  it('should handle complete login flow', async () => {
    renderWithProviders(<App />);

    // Enter credentials
    const emailInput = screen.getByTestId('email-input');
    fireEvent.changeText(emailInput, 'test@example.com');

    const passwordInput = screen.getByTestId('password-input');
    fireEvent.changeText(passwordInput, 'password123');

    // Submit login
    const loginButton = screen.getByTestId('login-button');
    fireEvent.press(loginButton);

    // Wait for navigation to home screen
    await waitFor(() => {
      expect(screen.getByTestId('home-screen')).toBeTruthy();
    });

    // Verify user data is stored
    const user = await AsyncStorage.getItem('user');
    expect(user).toBeTruthy();
  });

  it('should show error for invalid credentials', async () => {
    jest.spyOn(api, 'login').mockRejectedValue(new Error('Invalid credentials'));

    renderWithProviders(<App />);

    const emailInput = screen.getByTestId('email-input');
    fireEvent.changeText(emailInput, 'wrong@example.com');

    const passwordInput = screen.getByTestId('password-input');
    fireEvent.changeText(passwordInput, 'wrongpass');

    const loginButton = screen.getByTestId('login-button');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeTruthy();
    });
  });
});
```

---

## E2E Testing

### Setup Detox for E2E Tests

```javascript
// .detoxrc.js
module.exports = {
  testRunner: {
    args: {
      '$0': 'jest',
      config: 'e2e/jest.config.js'
    },
    jest: {
      setupTimeout: 120000
    }
  },
  apps: {
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug'
    },
    'android.release': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      build: 'cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release'
    }
  },
  devices: {
    simulator: {
      type: 'android.emulator',
      device: { avdName: 'Pixel_4_API_30' }
    }
  },
  configurations: {
    'android.debug': {
      device: 'simulator',
      app: 'android.debug'
    }
  }
};
```

### E2E Test Example

```typescript
// e2e/article.e2e.test.ts
describe('Article E2E Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should create, view, and like an article', async () => {
    // Login
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();

    // Wait for home screen
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Navigate to create article
    await element(by.id('create-article-button')).tap();

    // Fill article details
    await element(by.id('article-title-input')).typeText('E2E Test Article');
    await element(by.id('article-content-input')).typeText('This is test content');

    // Publish
    await element(by.id('publish-button')).tap();

    // Verify success message
    await expect(element(by.text('Article published successfully'))).toBeVisible();

    // View article
    await element(by.text('E2E Test Article')).tap();
    await expect(element(by.text('E2E Test Article'))).toBeVisible();

    // Like article
    await element(by.id('like-button')).tap();
    await expect(element(by.id('like-button-active'))).toBeVisible();
  });
});
```

---

## Mocking Guidelines

### Mock Setup File

```typescript
// __tests__/setup/mocks.ts
export const mockUser = {
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
  bio: 'Test bio',
  avatar: 'https://example.com/avatar.jpg'
};

export const mockArticle = {
  id: '456',
  title: 'Test Article',
  content: '<p>Test content</p>',
  author: mockUser,
  likes: 10,
  views: 100,
  createdAt: '2024-01-01T00:00:00Z',
  tags: ['health', 'wellness']
};

export const mockPodcast = {
  id: '789',
  title: 'Test Podcast',
  description: 'Test podcast description',
  audioUrl: 'https://example.com/podcast.mp3',
  author: mockUser,
  duration: 1800,
  likes: 5,
  plays: 50
};

export const mockComment = {
  id: '111',
  content: 'Great article!',
  author: mockUser,
  articleId: '456',
  createdAt: '2024-01-01T00:00:00Z'
};
```

### Mocking AsyncStorage

```typescript
// __tests__/setup/jest.setup.js
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
```

### Mocking Navigation

```typescript
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn()
  }),
  useRoute: () => ({
    params: { id: '123' }
  })
}));
```

### Mocking Firebase

```typescript
jest.mock('@react-native-firebase/messaging', () => ({
  messaging: () => ({
    requestPermission: jest.fn(() => Promise.resolve(1)),
    getToken: jest.fn(() => Promise.resolve('mock-token')),
    onMessage: jest.fn(),
    onNotificationOpenedApp: jest.fn()
  })
}));
```

### Mocking Axios

```typescript
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

const mockAxios = new MockAdapter(axios);

// Mock GET request
mockAxios.onGet('/api/articles').reply(200, {
  articles: [mockArticle]
});

// Mock POST request
mockAxios.onPost('/api/articles').reply(201, mockArticle);

// Mock error response
mockAxios.onGet('/api/articles/999').reply(404, {
  error: 'Article not found'
});
```

### Mocking Socket.IO

```typescript
import { Server } from 'jest-websocket-mock';

describe('Real-time notifications', () => {
  let server: Server;

  beforeEach(async () => {
    server = new Server('ws://localhost:1234');
  });

  afterEach(() => {
    server.close();
  });

  it('should receive notification', async () => {
    // Test socket connection and messages
    server.send(JSON.stringify({ type: 'notification', data: {} }));
  });
});
```

---

## Test Coverage Requirements

### Minimum Coverage Thresholds

```javascript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    },
    // Critical modules require higher coverage
    './src/helper/apiConfig.ts': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './src/store/slices/*.ts': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  }
};
```

### What Requires 100% Coverage

1. **Authentication Logic** - Login, signup, password reset
2. **Payment Processing** (if applicable)
3. **Data Validation** - Form validators, input sanitization
4. **Security Functions** - Token handling, permission checks
5. **Critical Business Logic** - Article publishing, user permissions

### What Can Have Lower Coverage

1. **UI Components** - Pure presentational components (60-70%)
2. **Configuration Files** - Constants, themes (50-60%)
3. **Types/Interfaces** - TypeScript definitions (excluded)
4. **Assets** - Images, fonts, Lottie files (excluded)

---

## Best Practices

### 1. Test Naming

```typescript
// ❌ Bad
it('test1', () => {});
it('should work', () => {});

// ✅ Good
it('should display article title when article is loaded', () => {});
it('should show error message when article fetch fails', () => {});
it('should navigate to profile when author name is tapped', () => {});
```

### 2. Arrange-Act-Assert Pattern

```typescript
it('should update article like count when like button is pressed', () => {
  // Arrange
  const mockArticle = { ...baseArticle, likes: 10 };
  render(<ArticleCard article={mockArticle} />);

  // Act
  const likeButton = screen.getByTestId('like-button');
  fireEvent.press(likeButton);

  // Assert
  expect(screen.getByText('11')).toBeTruthy();
});
```

### 3. Test Independence

```typescript
// ❌ Bad - Tests depend on each other
let user;
it('should create user', () => {
  user = createUser();
});
it('should update user', () => {
  updateUser(user); // Depends on previous test
});

// ✅ Good - Each test is independent
it('should create user', () => {
  const user = createUser();
  expect(user).toBeDefined();
});

it('should update user', () => {
  const user = createUser();
  const updated = updateUser(user);
  expect(updated.name).toBe('Updated Name');
});
```

### 4. Use Test Data Builders

```typescript
// testUtils.ts
export const buildArticle = (overrides = {}) => ({
  id: '123',
  title: 'Default Title',
  content: 'Default content',
  author: buildUser(),
  likes: 0,
  views: 0,
  createdAt: new Date().toISOString(),
  ...overrides
});

// Usage in tests
const article = buildArticle({ title: 'Custom Title', likes: 42 });
```

### 5. Test User Behavior, Not Implementation

```typescript
// ❌ Bad - Testing implementation details
it('should call handleLike function', () => {
  const handleLike = jest.fn();
  render(<ArticleCard onLike={handleLike} />);
  // Testing internal function call
});

// ✅ Good - Testing user-visible behavior
it('should show active like state after tapping like button', () => {
  render(<ArticleCard />);
  fireEvent.press(screen.getByTestId('like-button'));
  expect(screen.getByTestId('like-button-active')).toBeTruthy();
});
```

### 6. Use Testing Library Queries Properly

```typescript
// Preferred query order:
// 1. getByRole (for accessibility)
// 2. getByLabelText
// 3. getByPlaceholderText
// 4. getByText
// 5. getByDisplayValue
// 6. getByTestId (last resort)

// ✅ Good
const button = screen.getByRole('button', { name: /submit/i });
const input = screen.getByLabelText('Email address');
const heading = screen.getByText(/welcome/i);

// ⚠️ Use sparingly
const element = screen.getByTestId('custom-component');
```

### 7. Async Testing

```typescript
// ❌ Bad - No waiting
it('should load articles', () => {
  render(<ArticleList />);
  expect(screen.getByText('Article 1')).toBeTruthy(); // Will fail
});

// ✅ Good - Proper async handling
it('should load articles', async () => {
  render(<ArticleList />);

  expect(screen.getByTestId('loading')).toBeTruthy();

  await waitFor(() => {
    expect(screen.getByText('Article 1')).toBeTruthy();
  });

  expect(screen.queryByTestId('loading')).toBeNull();
});
```

### 8. Mock Only What You Need

```typescript
// ❌ Bad - Over-mocking
jest.mock('../Article', () => ({
  default: jest.fn(),
  ArticleCard: jest.fn(),
  ArticleList: jest.fn(),
  // ... mocking everything
}));

// ✅ Good - Mock only external dependencies
jest.mock('@/helper/apiConfig', () => ({
  getArticles: jest.fn()
}));
// Let actual components render
```

### 9. Clean Up After Tests

```typescript
afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});

afterAll(() => {
  jest.restoreAllMocks();
});
```

### 10. Use Descriptive Test Data

```typescript
// ❌ Bad
const user1 = { id: '1', name: 'a' };
const user2 = { id: '2', name: 'b' };

// ✅ Good
const authorUser = { id: 'author-123', name: 'Dr. Jane Smith' };
const readerUser = { id: 'reader-456', name: 'John Doe' };
```

---

## Common Pitfalls

### 1. Testing Implementation Details

```typescript
// ❌ Bad
it('should update state', () => {
  const { result } = renderHook(() => useArticle());
  expect(result.current.state.loading).toBe(false);
});

// ✅ Good
it('should display article after loading', async () => {
  render(<Article id="123" />);
  await waitFor(() => {
    expect(screen.getByText('Article Title')).toBeTruthy();
  });
});
```

### 2. Not Waiting for Async Operations

```typescript
// ❌ Bad
it('should fetch articles', () => {
  render(<ArticleList />);
  expect(screen.getByText('Article 1')).toBeTruthy(); // Fails
});

// ✅ Good
it('should fetch articles', async () => {
  render(<ArticleList />);
  expect(await screen.findByText('Article 1')).toBeTruthy();
});
```

### 3. Brittle Selectors

```typescript
// ❌ Bad - Breaks with style changes
const button = container.querySelector('.btn-primary');

// ✅ Good - Semantic and stable
const button = screen.getByRole('button', { name: /submit/i });
```

### 4. Too Many Assertions

```typescript
// ❌ Bad - Hard to debug when it fails
it('should handle article flow', () => {
  // 50 lines of test code
  expect(condition1).toBe(true);
  expect(condition2).toBe(true);
  // ... 20 more assertions
});

// ✅ Good - One logical concept per test
it('should display article title', () => {
  render(<Article />);
  expect(screen.getByText('Title')).toBeTruthy();
});

it('should display article content', () => {
  render(<Article />);
  expect(screen.getByText('Content')).toBeTruthy();
});
```

### 5. Not Cleaning Up Side Effects

```typescript
// ❌ Bad - Timers/listeners not cleaned
it('should auto-save', () => {
  render(<ArticleEditor />);
  jest.advanceTimersByTime(5000);
  // Timer still running
});

// ✅ Good - Proper cleanup
it('should auto-save', () => {
  jest.useFakeTimers();
  render(<ArticleEditor />);

  jest.advanceTimersByTime(5000);
  expect(mockSave).toHaveBeenCalled();

  jest.useRealTimers();
});
```

---

## Running Tests

### Package.json Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2",
    "test:unit": "jest --testPathPattern='test\\.tsx?$'",
    "test:integration": "jest --testPathPattern='integration\\.test\\.tsx?$'",
    "test:e2e": "detox test",
    "test:e2e:build": "detox build -c android.debug",
    "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand"
  }
}
```

### Running Tests Locally

```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Run specific test file
npm test -- ArticleCard.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="should display article"

# Run with coverage
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run E2E tests
npm run test:e2e:build
npm run test:e2e
```

### CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run unit tests
        run: npm run test:ci

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/coverage-final.json

      - name: Run E2E tests
        run: |
          npm run test:e2e:build
          npm run test:e2e
```

---

## Test Utilities

### Custom Render Function

```typescript
// __tests__/setup/testUtils.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '@/store/slices/userSlice';
import dataReducer from '@/store/slices/dataSlice';

export const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      user: userReducer,
      data: dataReducer
    },
    preloadedState: initialState
  });
};

export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0
      },
      mutations: {
        retry: false
      }
    }
  });
};

export const renderWithProviders = (
  ui: React.ReactElement,
  {
    initialState = {},
    store = createTestStore(initialState),
    queryClient = createTestQueryClient(),
    ...renderOptions
  } = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          {children}
        </NavigationContainer>
      </QueryClientProvider>
    </Provider>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    store,
    queryClient
  };
};

// Export everything from testing library
export * from '@testing-library/react-native';
```

### Usage

```typescript
import { renderWithProviders, screen } from '@/__tests__/setup/testUtils';

it('should render with all providers', () => {
  renderWithProviders(<MyComponent />);
  expect(screen.getByText('Hello')).toBeTruthy();
});
```

---

## Conclusion

This testing guideline provides a comprehensive framework for testing the UltimateHealth application. Key takeaways:

1. **Start Small** - Begin with critical paths (auth, article CRUD)
2. **Build Incrementally** - Add tests as you develop new features
3. **Maintain Quality** - Keep tests clean, readable, and maintainable
4. **Automate** - Run tests in CI/CD pipeline
5. **Monitor Coverage** - Track and improve coverage over time

### Next Steps

1. Install testing dependencies
2. Set up Jest configuration
3. Create test utilities and mocks
4. Write first test suite (start with authentication)
5. Add pre-commit hooks to run tests
6. Set up CI/CD pipeline
7. Gradually increase coverage

### Resources

- [Jest Documentation](https://jestjs.io/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Detox E2E Testing](https://wix.github.io/Detox/)

---

**Remember**: Tests are not just about coverage numbers. They're about confidence in your code and catching bugs before they reach production.

Happy Testing! 🧪
