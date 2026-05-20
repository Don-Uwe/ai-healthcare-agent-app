import React, { useRef, useState } from "react";
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ScrollViewProps,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
 
 
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
 
  // The floating button — rendered by the consumer
  const BackToTopButton = ({
    buttonColor = "#4CAF50",
    iconColor = "#fff",
  }: {
    buttonColor?: string;
    iconColor?: string;
  }) =>
    visible ? (
      <Animated.View style={[styles.fab, { opacity, backgroundColor: buttonColor }]}>
        <TouchableOpacity
          onPress={scrollToTop}
          accessibilityLabel="Back to top"
          accessibilityRole="button"
          accessibilityHint="Scrolls the page back to the top"
        >
          <Ionicons name="arrow-up" size={22} color={iconColor} />
        </TouchableOpacity>
      </Animated.View>
    ) : null;
 
  return { scrollRef, onScroll, BackToTopButton, scrollToTop };
}
 
// ─── Convenience wrapper component ──────────────────────────────────────────
 
interface BackToTopScrollViewProps extends ScrollViewProps {
  threshold?: number;
  buttonColor?: string;
  iconColor?: string;
  children: React.ReactNode;
}
 
export function BackToTopScrollView({
  threshold = 300,
  buttonColor = "#4CAF50",
  iconColor = "#fff",
  children,
  ...scrollViewProps
}: BackToTopScrollViewProps) {
  const { scrollRef, onScroll, BackToTopButton } = useBackToTop({ threshold });
 
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
 
      {/* FAB floats above the ScrollView */}
      <BackToTopButton buttonColor={buttonColor} iconColor={iconColor} />
    </>
  );
}
 
// ─── Styles ──────────────────────────────────────────────────────────────────
 
const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    // Shadow — iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    // Elevation — Android
    elevation: 6,
  },
});