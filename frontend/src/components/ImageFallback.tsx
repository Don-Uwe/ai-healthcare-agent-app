import React, { useState } from 'react';
import { Image, ImageProps, ImageSourcePropType } from 'react-native';

interface ImageFallbackProps extends ImageProps {
  fallbackSource: ImageSourcePropType;
}

export const ImageFallback = ({ source, fallbackSource, style, ...props }: ImageFallbackProps) => {
  const [hasError, setHasError] = useState(false);

  // Check if the primary source is a valid URI object, or a valid local file (number)
  const isPrimaryUriValid = 
    typeof source === 'number' || 
    (typeof source === 'object' && source !== null && 'uri' in source && typeof (source as any).uri === 'string' && (source as any).uri.length > 0);

  // If the primary URI is invalid from the start, or an error occurred, use the fallback
  const finalSource = (!isPrimaryUriValid || hasError) ? fallbackSource : source;

  return (
    <Image
      source={finalSource}
      onError={(e) => {
        // Only trigger our error state if the original URI was theoretically valid
        if (isPrimaryUriValid) {
          setHasError(true);
        }
        // If an onError prop was passed in from the parent, make sure we still call it!
        if (props.onError) {
          props.onError(e);
        }
      }}
      style={style}
      {...props}
    />
  );
};