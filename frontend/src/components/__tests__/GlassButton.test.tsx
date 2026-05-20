import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import GlassButton from '../GlassButton';

describe('GlassButton', () => {
  it('renders correctly with title', () => {
    const { getByText } = render(
      <GlassButton title="Click Me" onPress={() => {}} />
    );
    expect(getByText('Click Me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <GlassButton title="Submit" onPress={onPressMock} />
    );
    
    fireEvent.press(getByText('Submit'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('shows loading spinner when loading is true and hides title', () => {
    const { queryByText, getByTestId } = render(
      <GlassButton title="Submit" onPress={() => {}} loading={true} />
    );
    
    // Title should not be visible when loading
    expect(queryByText('Submit')).toBeNull();
    // Spinner should be rendered
    expect(getByTestId('loading-spinner')).toBeTruthy();
  });

  it('does not call onPress when disabled', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <GlassButton title="Disabled Button" onPress={onPressMock} disabled={true} />
    );
    
    fireEvent.press(getByText('Disabled Button'));
    expect(onPressMock).not.toHaveBeenCalled();
  });
});
