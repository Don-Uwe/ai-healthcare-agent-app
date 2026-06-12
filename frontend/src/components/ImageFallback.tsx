import React, { useState } from 'react';
import { Image, ImageProps, ImageSourcePropType } from 'react-native';

interface ImageFallbackProps extends ImageProps {
  fallbackSource: ImageSourcePropType;
}

export const ImageFallback = ({ source, fallbackSource, style, ...props }: ImageFallbackProps) => {
  const [hasError, setHasError] = useState(false);

  return (
    <Image
      source={hasError ? fallbackSource : source}
      onError={() => setHasError(true)}
      style={style}
      {...props}
    />
  );
};