import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import NotificationPreferencesScreen from '../NotificationPreferencesScreen';

const mockNavigate = jest.fn();
const mockUpdatePreferences = jest.fn();

jest.mock('react-native-snackbar', () => ({
  show: jest.fn(),
  LENGTH_SHORT: 0,
}));

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
  })),
}));

jest.mock('../../helper/Metric', () => ({
  fp: (value: number) => value,
  hp: (value: number) => value,
  wp: (value: number) => value,
}));

jest.mock('../../hooks/useGetArticleTags', () => ({
  useGetCategories: jest.fn(),
}));

jest.mock('../../hooks/useGetNotificationPreferences', () => ({
  useGetNotificationPreferences: jest.fn(),
}));

jest.mock('../../hooks/useUpdateNotificationPreferences', () => ({
  useUpdateNotificationPreferences: jest.fn(),
}));

// Mock MaterialCommunityIcons
jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => {
  const React = require('react');
  const {Text} = require('react-native');
  const MockIcon = ({name, testID}: {name: string; testID?: string}) =>
    React.createElement(Text, {testID: testID ?? `icon-${name}`}, name);
  MockIcon.displayName = 'MaterialCommunityIcons';
  return MockIcon;
});

// Mock components
jest.mock('../../components/LoadingSpinner', () => {
  const React = require('react');
  const {Text} = require('react-native');
  const MockSpinner = () => React.createElement(Text, null, 'Loading...');
  MockSpinner.displayName = 'LoadingSpinner';
  return MockSpinner;
});

const mockCategories = [
  {_id: 'cat-1', id: 1, name: 'Nutrition', __v: 0},
  {_id: 'cat-2', id: 2, name: 'Fitness', __v: 0},
  {_id: 'cat-3', id: 3, name: 'Mental Health', __v: 0},
];

const mockPreferences = {
  preferences: {
    contentClusters: [
      {_id: 'cat-1', id: 1, name: 'Nutrition', __v: 0},
    ],
  },
  message: 'Success',
};

const mockUseSelector = require('react-redux').useSelector as jest.Mock;
const mockUseGetCategories = require('../../hooks/useGetArticleTags').useGetCategories as jest.Mock;
const mockUseGetNotificationPreferences = require('../../hooks/useGetNotificationPreferences').useGetNotificationPreferences as jest.Mock;
const mockUseUpdateNotificationPreferences = require('../../hooks/useUpdateNotificationPreferences').useUpdateNotificationPreferences as jest.Mock;

describe('NotificationPreferencesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSelector.mockImplementation((selector: any) =>
      selector({
        user: {isGuest: false},
        network: {isConnected: true},
      }),
    );
    mockUseGetCategories.mockReturnValue({
      data: mockCategories,
      isLoading: false,
    });
    mockUseGetNotificationPreferences.mockReturnValue({
      data: mockPreferences,
      isLoading: false,
    });
    mockUseUpdateNotificationPreferences.mockReturnValue({
      mutate: mockUpdatePreferences,
      isPending: false,
    });
  });

  const renderScreen = () =>
    render(
      <NotificationPreferencesScreen
        navigation={{navigate: mockNavigate} as any}
        route={{} as any}
      />,
    );

  it('renders loading spinner when loading data', () => {
    mockUseGetCategories.mockReturnValue({data: null, isLoading: true});
    const {getByText} = renderScreen();
    expect(getByText('Loading...')).toBeTruthy();
  });

  it('renders categories and pre-selected checkmark based on user preferences', () => {
    const {getByText, getByTestId} = renderScreen();

    // Check header and categories
    expect(getByText('Content Interests')).toBeTruthy();
    expect(getByText('Nutrition')).toBeTruthy();
    expect(getByText('Fitness')).toBeTruthy();
    expect(getByText('Mental Health')).toBeTruthy();

    // Nutrition is pre-selected, verify check icon
    expect(getByTestId('icon-check-circle')).toBeTruthy();
  });

  it('filters preferences dynamically based on search query (case-insensitive)', () => {
    const {getByTestId, getByText, queryByText} = renderScreen();

    const searchInput = getByTestId('search-input');
    fireEvent.changeText(searchInput, 'fit');

    // Fitness should remain, Nutrition and Mental Health should be filtered out
    expect(getByText('Fitness')).toBeTruthy();
    expect(queryByText('Nutrition')).toBeNull();
    expect(queryByText('Mental Health')).toBeNull();
  });

  it('displays empty state when no matching preferences are found', () => {
    const {getByTestId, getByText, queryByText} = renderScreen();

    const searchInput = getByTestId('search-input');
    fireEvent.changeText(searchInput, 'Yoga');

    expect(getByTestId('empty-state')).toBeTruthy();
    expect(getByText('No preferences found')).toBeTruthy();
    expect(getByText('Try searching with a different keyword')).toBeTruthy();

    // None of the chips should be visible
    expect(queryByText('Nutrition')).toBeNull();
    expect(queryByText('Fitness')).toBeNull();
    expect(queryByText('Mental Health')).toBeNull();
  });

  it('shows clear button when text is typed and clears input when pressed', () => {
    const {getByTestId, queryByTestId} = renderScreen();

    // No clear button initially
    expect(queryByTestId('clear-search-button')).toBeNull();

    const searchInput = getByTestId('search-input');
    fireEvent.changeText(searchInput, 'fit');

    // Clear button should be visible now
    const clearButton = getByTestId('clear-search-button');
    expect(clearButton).toBeTruthy();

    // Press clear button
    fireEvent.press(clearButton);

    // Search input should be empty and clear button should disappear
    expect(searchInput.props.value).toBe('');
    expect(queryByTestId('clear-search-button')).toBeNull();
  });

  it('preserves current preference toggle states during filtering', () => {
    const {getByTestId, getByText, queryByText} = renderScreen();

    // Select Fitness chip (it starts unselected)
    fireEvent.press(getByText('Fitness'));

    // Filter to just Nutrition
    const searchInput = getByTestId('search-input');
    fireEvent.changeText(searchInput, 'nutr');

    expect(getByText('Nutrition')).toBeTruthy();
    expect(queryByText('Fitness')).toBeNull();

    // Clear search filter
    fireEvent.press(getByTestId('clear-search-button'));

    // Verify both Nutrition and Fitness are selected (they will display checkmark or toggle state)
    // In our component, we look at selection. Let's toggle Fitness again to verify state is preserved.
    // If state is preserved, pressing Fitness again will deselect it, meaning SelectedIds becomes just ['cat-1'].
    // We can verify this by checking save payload.
    const saveButton = getByText('Save Preferences');
    fireEvent.press(saveButton);

    expect(mockUpdatePreferences).toHaveBeenCalledWith(
      {
        contentClusters: [
          {_id: 'cat-1', id: 1, name: 'Nutrition', __v: 0},
          {_id: 'cat-2', id: 2, name: 'Fitness', __v: 0},
        ],
      },
      expect.any(Object),
    );
  });

  it('performs select all and clear all operations correctly', () => {
    const {getByText} = renderScreen();

    // Press Clear All
    fireEvent.press(getByText('Clear All'));

    // Press Save and check payload is empty
    fireEvent.press(getByText('Save Preferences'));
    expect(mockUpdatePreferences).toHaveBeenLastCalledWith(
      {contentClusters: []},
      expect.any(Object),
    );

    // Press Select All
    fireEvent.press(getByText('Select All'));

    // Press Save and check payload has all categories
    fireEvent.press(getByText('Save Preferences'));
    expect(mockUpdatePreferences).toHaveBeenLastCalledWith(
      {contentClusters: mockCategories},
      expect.any(Object),
    );
  });

  it('filters Select All to only visible items when search is active', () => {
    const {getByTestId, getByText, queryByText} = renderScreen();

    // First Clear All
    fireEvent.press(getByText('Clear All'));

    // Search for Fitness
    const searchInput = getByTestId('search-input');
    fireEvent.changeText(searchInput, 'Fit');

    // Press Select All (should only select visible 'Fitness')
    fireEvent.press(getByText('Select All'));

    // Save and verify only Fitness is saved
    fireEvent.press(getByText('Save Preferences'));
    expect(mockUpdatePreferences).toHaveBeenLastCalledWith(
      {contentClusters: [{_id: 'cat-2', id: 2, name: 'Fitness', __v: 0}]},
      expect.any(Object),
    );
  });
});
