import { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { G, Path } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const SoundWave = () => {
  const waveOffset = useSharedValue(0);

  const animatedProps = useAnimatedProps(() => {
    // Simulate moving wave using sine pattern
    const path = `M0 30 ${Array.from({length: 50}, (_, i) => {
      const x = i * 5;
      const y =
        30 + 10 * Math.sin((i * 0.5 + waveOffset.value) % (2 * Math.PI));
      return `L${x} ${y.toFixed(2)}`;
    }).join(' ')}`;

    return {
      d: path,
    };
  });

  useEffect(() => {
    waveOffset.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 1000, easing: Easing.linear }),
      -1,
      false
    );
  }, [waveOffset]);

  /*
  waveOffset.value = withRepeat(
    withTiming(Math.PI * 2, {duration: 1000, easing: Easing.linear}),
    -1,
    false,
  );
  */

  return (
    <Svg height="60" width="100%" viewBox="0 0 300 60">
    <G transform="translate(40, 0)"> 
    <AnimatedPath
      animatedProps={animatedProps}
      stroke="#38bdf8"
      strokeWidth="2"
      fill="none"
    />
  </G>
</Svg>
  );
};

export default SoundWave;
