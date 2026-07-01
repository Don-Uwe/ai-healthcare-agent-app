import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BANNER_ANIMATION_DURATION = 300;
const BANNER_DISPLAY_DURATION_ONLINE = 3000;

export function NetworkBanner() {
  const netInfo = useNetInfo();
  const insets = useSafeAreaInsets();
  const [hasBeenOffline, setHasBeenOffline] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const translateY = useSharedValue(-100);

  const isOffline = netInfo.isConnected === false && netInfo.isInternetReachable === false;

  useEffect(() => {
    if (isOffline) {
      setHasBeenOffline(true);
      setIsVisible(true);
      translateY.value = withTiming(0, { duration: BANNER_ANIMATION_DURATION });
    } else if (hasBeenOffline) {
      // Just came back online
      translateY.value = withSequence(
        withTiming(0, { duration: BANNER_ANIMATION_DURATION }),
        withDelay(
          BANNER_DISPLAY_DURATION_ONLINE,
          withTiming(-100, { duration: BANNER_ANIMATION_DURATION }, () => {
            runOnJS(setIsVisible)(false);
            runOnJS(setHasBeenOffline)(false);
          })
        )
      );
    }
  }, [isOffline, hasBeenOffline]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  if (!isVisible && !isOffline && !hasBeenOffline) return null;

  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      style={[
        styles.banner,
        {
          paddingTop: insets.top || 10,
          backgroundColor: isOffline ? '#e74c3c' : '#2ecc71',
        },
        animatedStyle,
      ]}
    >
      <Text style={styles.text}>
        {isOffline ? 'No Internet Connection' : 'Back online'}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 10,
  },
  text: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
