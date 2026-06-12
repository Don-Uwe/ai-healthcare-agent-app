import React, { useState } from 'react';
import { Image, ImageProps, ImageSourcePropType } from 'react-native';

/**
 * Props for the ImageFallback component.
 * Extends standard React Native ImageProps to include a required fallback source.
 */
interface ImageFallbackProps extends ImageProps {
  // The local image asset to display if the primary source fails to load
  fallbackSource: ImageSourcePropType;
}

/**
 * A wrapper around the standard React Native Image component.
 * Gracefully handles broken image URLs or network failures by swapping 
 * to a provided local fallback image.
 */
export const ImageFallback = ({ source, fallbackSource, style, ...props }: ImageFallbackProps) => {
  // State to track if the primary image source has failed to load
  const [hasError, setHasError] = useState(false);

  return (
    <Image
      // If an error occurred previously, render the fallback. Otherwise, attempt to load the primary source.
      source={hasError ? fallbackSource : source}
      // Catch loading errors (e.g., 404, network timeout) and trigger the fallback state
      onError={() => setHasError(true)}
      style={style}
      // Pass down any remaining standard Image props (like resizeMode, accessibilityLabel, etc.)
      {...props}
    />
  );
};