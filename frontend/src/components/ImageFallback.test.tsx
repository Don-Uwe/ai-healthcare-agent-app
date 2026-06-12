import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ImageFallback } from './ImageFallback';

describe('ImageFallback Component', () => {
  const fallbackSource = { uri: 'https://example.com/fallback.jpg' };
  const primarySource = { uri: 'https://example.com/primary.jpg' };

  it('renders primary image when source is valid', () => {
    const { getByTestId } = render(
      <ImageFallback source={primarySource} fallbackSource={fallbackSource} testID="test-image" />
    );
    const image = getByTestId('test-image');
    expect(image.props.source).toEqual(primarySource);
  });

  it('renders fallback image immediately if primary source uri is empty', () => {
    const { getByTestId } = render(
      <ImageFallback source={{ uri: '' }} fallbackSource={fallbackSource} testID="test-image" />
    );
    const image = getByTestId('test-image');
    // Because the URI is empty, it should instantly swap to fallback
    expect(image.props.source).toEqual(fallbackSource);
  });

  it('swaps to fallback image when onError is triggered', () => {
    const { getByTestId } = render(
      <ImageFallback source={primarySource} fallbackSource={fallbackSource} testID="test-image" />
    );
    const image = getByTestId('test-image');
    
    // Simulate a network failure loading the image
    fireEvent(image, 'onError');
    
    // It should now have swapped to the fallback
    expect(image.props.source).toEqual(fallbackSource);
  });
});