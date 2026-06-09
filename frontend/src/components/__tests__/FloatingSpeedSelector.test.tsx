import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import FloatingSpeedSelector from '../FloatingSpeedSelector';

const mockAddListener = jest.fn();
const mockNavigation = {
  addListener: mockAddListener,
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

jest.mock('@expo/vector-icons/Ionicons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const MockIcon = ({ name, testID }: any) => React.createElement(Text, { testID }, name);
  MockIcon.displayName = 'Ionicons';
  return MockIcon;
});

describe('FloatingSpeedSelector', () => {
  const defaultProps = {
    currentSpeed: 1.0,
    onSpeedSelect: jest.fn(),
    visible: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all playback speeds when visible', () => {
    const { getByText } = render(<FloatingSpeedSelector {...defaultProps} />);

    expect(getByText('Playback Speed')).toBeTruthy();
    expect(getByText('0.5x')).toBeTruthy();
    expect(getByText('0.75x')).toBeTruthy();
    expect(getByText('1x')).toBeTruthy();
    expect(getByText('1.25x')).toBeTruthy();
    expect(getByText('1.5x')).toBeTruthy();
    expect(getByText('1.75x')).toBeTruthy();
    expect(getByText('2x')).toBeTruthy();
  });

  it('highlights the current speed and shows checkmark icon', () => {
    const { getByTestId } = render(<FloatingSpeedSelector {...defaultProps} currentSpeed={1.25} />);

    // Expect the checkmark icon to be rendered for the selected speed
    expect(getByTestId('checkmark-icon')).toBeTruthy();
  });

  it('calls onSpeedSelect and onClose when a speed option is tapped', () => {
    const onSpeedSelectMock = jest.fn();
    const onCloseMock = jest.fn();

    const { getByText } = render(
      <FloatingSpeedSelector
        {...defaultProps}
        onSpeedSelect={onSpeedSelectMock}
        onClose={onCloseMock}
      />
    );

    fireEvent.press(getByText('1.5x'));

    expect(onSpeedSelectMock).toHaveBeenCalledWith(1.5);
    expect(onCloseMock).toHaveBeenCalled();
  });

  it('calls onClose when the backdrop overlay is tapped', () => {
    const onCloseMock = jest.fn();

    const { getByTestId } = render(
      <FloatingSpeedSelector
        {...defaultProps}
        onClose={onCloseMock}
      />
    );

    fireEvent.press(getByTestId('backdrop-touchable'));

    expect(onCloseMock).toHaveBeenCalled();
  });

  it('does not render anything when visible is false', () => {
    const { queryByText } = render(<FloatingSpeedSelector {...defaultProps} visible={false} />);

    expect(queryByText('Playback Speed')).toBeNull();
  });

  it('subscribes to navigation blur event when visible and triggers onClose when blur fires', () => {
    let blurCallback: (() => void) | undefined;
    mockAddListener.mockImplementation((event, callback) => {
      if (event === 'blur') {
        blurCallback = callback;
      }
      return jest.fn();
    });

    render(<FloatingSpeedSelector {...defaultProps} />);

    expect(mockAddListener).toHaveBeenCalledWith('blur', expect.any(Function));
    expect(blurCallback).toBeDefined();

    // Trigger blur
    if (blurCallback) {
      blurCallback();
    }

    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
