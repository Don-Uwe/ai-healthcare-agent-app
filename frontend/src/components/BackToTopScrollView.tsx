import React, { useRef, useState } from 'react';
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  ScrollViewProps,
} from 'react-native';
import { BackToTopButton } from './BackToTopButton';
 
interface UseBackToTopOptions {
  threshold?: number;
}
 
export function useBackToTop({ threshold = 300 }: UseBackToTopOptions = {}) {
  const scrollRef = useRef<ScrollView>(null);
  const [visible, setVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
 
  const show = () => {
    setVisible(true);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };
 
  const hide = () => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };
 
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > threshold && !visible) show();
    if (y <= threshold && visible) hide();
  };
 
  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };
 
  return { scrollRef, onScroll, visible, opacity, scrollToTop };
}
 
interface BackToTopScrollViewProps extends ScrollViewProps {
  threshold?: number;
  buttonColor?: string;
  iconColor?: string;
  children: React.ReactNode;
}
 
export function BackToTopScrollView({
  threshold = 300,
  buttonColor = '#4CAF50',
  iconColor = '#fff',
  children,
  ...scrollViewProps
}: BackToTopScrollViewProps) {
  const { scrollRef, onScroll, visible, opacity, scrollToTop } =
    useBackToTop({ threshold });
 
  return (
    <>
      <ScrollView
        ref={scrollRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        {...scrollViewProps}
      >
        {children}
      </ScrollView>
 
      <BackToTopButton
        opacity={opacity}
        onPress={scrollToTop}
        visible={visible}
        buttonColor={buttonColor}
        iconColor={iconColor}
      />
    </>
  );
}
 
const styles = StyleSheet.create({});