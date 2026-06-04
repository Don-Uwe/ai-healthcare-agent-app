import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { BaseEmptyState, NoNotificationState } from '../EmptyStates';

jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => {
  const { Text } = require('react-native');
  return (props: any) => (
    <Text testID="material-community-icon" name={props.name} color={props.color} size={props.size}>
      {props.name}
    </Text>
  );
});

describe('EmptyStates Components', () => {
  describe('BaseEmptyState', () => {
    it('renders emoji when iconEmoji is provided', () => {
      const { getByText, queryByTestId } = render(
        <BaseEmptyState
          iconEmoji="🚀"
          title="Test Title"
          description="Test description text"
        />
      );

      expect(getByText('🚀')).toBeTruthy();
      expect(getByText('Test Title')).toBeTruthy();
      expect(getByText('Test description text')).toBeTruthy();
      expect(queryByTestId('material-community-icon')).toBeNull();
    });

    it('renders iconComponent when iconComponent is provided', () => {
      const mockIcon = <Text testID="custom-icon">🔔</Text>;
      const { getByTestId, queryByText } = render(
        <BaseEmptyState
          iconComponent={mockIcon}
          title="Test Title"
          description="Test description text"
        />
      );

      expect(getByTestId('custom-icon')).toBeTruthy();
      expect(queryByText('🚀')).toBeNull();
    });

    it('triggers action callback when action button is pressed', () => {
      const handleAction = jest.fn();
      const { getByText } = render(
        <BaseEmptyState
          iconEmoji="🚀"
          title="Test Title"
          description="Test description text"
          actionText="Click Me"
          onAction={handleAction}
        />
      );

      const actionButton = getByText('Click Me');
      fireEvent.press(actionButton);
      expect(handleAction).toHaveBeenCalledTimes(1);
    });

    it('renders infoText when provided', () => {
      const { getByText } = render(
        <BaseEmptyState
          iconEmoji="🚀"
          title="Test Title"
          description="Test description"
          infoText="Here is some info"
        />
      );

      expect(getByText('Here is some info')).toBeTruthy();
    });
  });

  describe('NoNotificationState', () => {
    it('renders correctly with title, description, and bell icon', () => {
      const { getByText, getByTestId } = render(
        <NoNotificationState />
      );

      expect(getByText('No Notifications Yet')).toBeTruthy();
      expect(
        getByText("You're all caught up. New notifications will appear here when available.")
      ).toBeTruthy();

      const icon = getByTestId('material-community-icon');
      expect(icon).toBeTruthy();
      expect(icon.props.name).toBe('bell-outline');
      expect(icon.props.size).toBe(48);
    });

    it('shows action button if onRefresh is provided', () => {
      const handleRefresh = jest.fn();
      const { getByText } = render(
        <NoNotificationState onRefresh={handleRefresh} />
      );

      const refreshButton = getByText('Refresh');
      fireEvent.press(refreshButton);
      expect(handleRefresh).toHaveBeenCalledTimes(1);
    });
  });
});
