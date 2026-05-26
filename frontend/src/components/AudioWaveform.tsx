import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';

const BAR_COUNT = 22;
const BAR_WIDTH = 4;
const MAX_HEIGHT = 48;
const MIN_HEIGHT = 5;

const randomTargets = Array.from({ length: BAR_COUNT }, () =>
  Math.random() * (MAX_HEIGHT - MIN_HEIGHT) + MIN_HEIGHT
);
const randomDurations = Array.from({ length: BAR_COUNT }, () =>
  280 + Math.random() * 420
);

interface BarProps {
  index: number;
  isPlaying: boolean;
  accentColor: string;
}

const Bar = ({ index, isPlaying, accentColor }: BarProps) => {
  const height = useSharedValue(MIN_HEIGHT);

  useEffect(() => {
    if (isPlaying) {
      height.value = withRepeat(
        withSequence(
          withTiming(randomTargets[index], {
            duration: randomDurations[index],
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(MIN_HEIGHT, {
            duration: randomDurations[index],
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        false
      );
    } else {
      cancelAnimation(height);
      height.value = withTiming(MIN_HEIGHT, { duration: 200 });
    }
  }, [isPlaying]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  return (
    <Animated.View
      style={[
        styles.bar,
        animatedStyle,
        { backgroundColor: accentColor, width: BAR_WIDTH },
      ]}
    />
  );
};

interface Props {
  isPlaying: boolean;
  accentColor?: string;
}

export default function AudioWaveform({ isPlaying, accentColor = '#3B82F6' }: Props) {
  return (
    <View style={styles.container}>
      {Array.from({ length: BAR_COUNT }, (_, i) => (
        <Bar key={i} index={i} isPlaying={isPlaying} accentColor={accentColor} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: MAX_HEIGHT + 16,
    gap: 4,
    paddingVertical: 8,
    width: '100%',
  },
  bar: {
    borderRadius: 3,
  },
});