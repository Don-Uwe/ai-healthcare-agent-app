import React from 'react';
import { View } from 'react-native';

const PagerView = (props) => {
  return <View {...props}>{props.children}</View>;
};

export default PagerView;
