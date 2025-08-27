import {Dimensions} from 'react-native';
export const {width, height} = Dimensions.get('window');

  export const baseHeight = height * 0.1;
  export const scalePerChar = height * 0.002;

export const wp = (percent: number): number => {
  return (width * percent) / 100;
};

export const hp = (percent: number): number => {
  return (height * percent) / 100;
};

// Define a function that calculates font size percentage
export const fp = (percent: number): number => {
  // Using the width for font size calculation as it usually scales better with different screen sizes
  return (width * percent) / 100;
};
