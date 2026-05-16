import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const Loader = () => {
  return (
    <LoadingSpinner
      fullScreen
      size={50}
      text="Please wait..."
      subText="We're processing your request"
    />
  );
};

export default Loader;
