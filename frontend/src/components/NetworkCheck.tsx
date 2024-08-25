import React from 'react';
import {View, StyleSheet} from 'react-native';
import LottieView from 'lottie-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import {PRIMARY_COLOR} from '../helper/Theme';
const NetworkCheck = () => {
  // Shared values for text opacity
  const fadeText1 = useSharedValue(0);
  const fadeText2 = useSharedValue(0);
  const fadeText3 = useSharedValue(0);
  // Animated styles for text
  const textStyle1 = useAnimatedStyle(() => ({
    opacity: fadeText1.value,
  }));

  const textStyle2 = useAnimatedStyle(() => ({
    opacity: fadeText2.value,
  }));

  const textStyle3 = useAnimatedStyle(() => ({
    opacity: fadeText3.value,
  }));
  // Start the animation loop
  React.useEffect(() => {
    fadeText1.value = withTiming(1, {duration: 800});
    fadeText2.value = withDelay(800, withTiming(1, {duration: 800}));
    fadeText3.value = withDelay(1600, withTiming(1, {duration: 800}));
  }, [fadeText1, fadeText2, fadeText3]);
  return (
    <View style={styles.container}>
      <View style={styles.lottieContainer}>
        <LottieView
          source={require('../assets/LottieAnimation/NetworkAnimation.json')}
          autoPlay={true}
          loop={true}
          style={styles.lottieView}
        />
      </View>
      <Animated.Text style={[styles.loadingText, textStyle1]}>
        Please wait...
      </Animated.Text>
      <Animated.Text style={[styles.subText, textStyle2]}>
        We're checking your network connection
      </Animated.Text>
      <Animated.Text style={[styles.subText, textStyle3]}>
        This may take a few moments
      </Animated.Text>
    </View>
  );
};

export default NetworkCheck;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
  },
  lottieContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  lottieView: {
    width: '100%',
    aspectRatio: 1,
  },
  loadingText: {
    fontSize: 18,
    color: PRIMARY_COLOR,
    fontWeight: '600',
  },
  subText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
  },
});
