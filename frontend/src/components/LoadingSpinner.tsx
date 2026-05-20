import React from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import {ON_PRIMARY_COLOR, PRIMARY_COLOR} from '../helper/Theme';

type LoadingSpinnerProps = {
  size?: 'small' | 'large' | number;
  color?: string;
  text?: string;
  subText?: string;
  fullScreen?: boolean;
  overlay?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
};

const LoadingSpinner = ({
  size = 'large',
  color = PRIMARY_COLOR,
  text,
  subText,
  fullScreen = false,
  overlay = false,
  containerStyle,
  textStyle,
  testID = 'loading-spinner',
}: LoadingSpinnerProps) => (
  <View
    testID={testID}
    accessibilityRole="progressbar"
    accessibilityLabel={text || 'Loading'}
    style={[
      styles.container,
      fullScreen && styles.fullScreen,
      overlay && styles.overlay,
      containerStyle,
    ]}>
    <ActivityIndicator size={size} color={color} />
    {text ? <Text style={[styles.text, {color}, textStyle]}>{text}</Text> : null}
    {subText ? <Text style={styles.subText}>{subText}</Text> : null}
  </View>
);

export default LoadingSpinner;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreen: {
    flex: 1,
    padding: 24,
  },
  overlay: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    zIndex: 10,
    backgroundColor: ON_PRIMARY_COLOR,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  subText: {
    marginTop: 6,
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});
