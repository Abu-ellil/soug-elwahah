import React, { useState } from 'react';
import { Image, View } from 'react-native';

// Default fallback image - a simple placeholder
const defaultFallbackImage = require('../../assets/icon.png'); // Using the app's icon as fallback

const ImageWithFallback = ({ source, fallbackSource, style, resizeMode, ...props }) => {
  const [hasError, setHasError] = useState(false);

  const onError = () => {
    setHasError(true);
  };

  return (
    <Image
      source={hasError || !source ? fallbackSource || defaultFallbackImage : source}
      style={style}
      resizeMode={resizeMode}
      onError={onError}
      {...props}
    />
  );
};

export default ImageWithFallback;
