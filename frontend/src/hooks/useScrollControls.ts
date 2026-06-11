import { useRef, useState } from 'react';
import { Animated, NativeScrollEvent, NativeSyntheticEvent, ScrollView } from 'react-native';

export interface UseScrollControlsOptions {
  threshold?: number;
  bottomThreshold?: number;
}

export function useScrollControls({ threshold = 300, bottomThreshold = 50 }: UseScrollControlsOptions = {}) {
  const scrollRef = useRef<ScrollView>(null);
  const [topVisible, setTopVisible] = useState(false);
  const [bottomVisible, setBottomVisible] = useState(true);

  const topOpacity = useRef(new Animated.Value(0)).current;
  const bottomOpacity = useRef(new Animated.Value(1)).current;

  const topVisibleRef = useRef(false);
  const bottomVisibleRef = useRef(true);

  const showTop = () => {
    if (topVisibleRef.current) return;
    topVisibleRef.current = true;
    setTopVisible(true);
    Animated.timing(topOpacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const hideTop = () => {
    if (!topVisibleRef.current) return;
    topVisibleRef.current = false;
    Animated.timing(topOpacity, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setTopVisible(false));
  };

  const showBottom = () => {
    if (bottomVisibleRef.current) return;
    bottomVisibleRef.current = true;
    setBottomVisible(true);
    Animated.timing(bottomOpacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const hideBottom = () => {
    if (!bottomVisibleRef.current) return;
    bottomVisibleRef.current = false;
    Animated.timing(bottomOpacity, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setBottomVisible(false));
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
    const y = contentOffset.y;

    // Top Button Logic
    if (y > threshold) {
      showTop();
    } else {
      hideTop();
    }

    // Bottom Button Logic
    if (contentSize.height <= layoutMeasurement.height) {
      hideBottom();
    } else {
      const isNearBottom = y + layoutMeasurement.height >= contentSize.height - bottomThreshold;
      if (isNearBottom) {
        hideBottom();
      } else {
        showBottom();
      }
    }
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const scrollToBottom = () => {
    scrollRef.current?.scrollToEnd({ animated: true });
  };

  return {
    scrollRef,
    onScroll,
    topVisible,
    topOpacity,
    bottomVisible,
    bottomOpacity,
    scrollToTop,
    scrollToBottom,
  };
}
