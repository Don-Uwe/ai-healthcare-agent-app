import React from 'react';
import {View, StyleSheet} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
} from 'react-native-reanimated';
import {PRIMARY_COLOR} from '../helper/Theme';
const Loader = () => {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  // Shared values for text opacity
  const fadeText1 = useSharedValue(0);
  const fadeText2 = useSharedValue(0);
  const fadeText3 = useSharedValue(0);

  // Bouncing animation for each dot
  const animatedStyle1 = useAnimatedStyle(() => ({
    transform: [{translateY: dot1.value}],
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [{translateY: dot2.value}],
  }));

  const animatedStyle3 = useAnimatedStyle(() => ({
    transform: [{translateY: dot3.value}],
  }));

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
    // Dot animations
    dot1.value = withDelay(
      0,
      withRepeat(withTiming(-30, {duration: 400}), -1, true),
    );
    dot2.value = withDelay(
      200,
      withRepeat(withTiming(-30, {duration: 400}), -1, true),
    );
    dot3.value = withDelay(
      400,
      withRepeat(withTiming(-30, {duration: 400}), -1, true),
    );

    // Sequential text animations
    fadeText1.value = withTiming(1, {duration: 800});
    fadeText2.value = withDelay(800, withTiming(1, {duration: 800}));
    fadeText3.value = withDelay(1600, withTiming(1, {duration: 800}));
  }, [dot1, dot2, dot3, fadeText1, fadeText2, fadeText3]);
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <View style={styles.dotContainer}>
        <Animated.View style={[styles.dot, animatedStyle1]} />
        <Animated.View style={[styles.dot, animatedStyle2]} />
        <Animated.View style={[styles.dot, animatedStyle3]} />
      </View>
      <Animated.Text style={[styles.loadingText, textStyle1]}>
        Please wait...
      </Animated.Text>
      <Animated.Text style={[styles.subText, textStyle2]}>
        We're processing your request
      </Animated.Text>
      <Animated.Text style={[styles.subText, textStyle3]}>
        This may take a few moments
      </Animated.Text>
      {/* <Animated.Text style={[styles.loadingText, textStyle1]}>
        Please wait...
      </Animated.Text>
      <Animated.Text style={[styles.subText, textStyle2]}>
        We're checking your network connection
      </Animated.Text>
      <Animated.Text style={[styles.subText, textStyle3]}>
        This may take a few moments
      </Animated.Text> */}
    </View>
  );
};

export default Loader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
  },
  dotContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  dot: {
    width: 25,
    height: 25,
    borderRadius: 50,
    backgroundColor: PRIMARY_COLOR,
    marginHorizontal: 10,
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
