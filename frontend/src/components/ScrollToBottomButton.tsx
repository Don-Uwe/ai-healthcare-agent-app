import React from 'react';
import AccessibleTouchable from './common/AccessibleTouchable';
import {
  Animated,
  StyleSheet,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export interface ScrollToBottomButtonProps {
  opacity: Animated.Value;
  onPress: () => void;
  visible: boolean;
  buttonColor?: string;
  iconColor?: string;
}

export const ScrollToBottomButton: React.FC<ScrollToBottomButtonProps> = ({
  opacity,
  onPress,
  visible,
  buttonColor = '#4CAF50',
  iconColor = '#fff',
}) => {
  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.fab, { opacity, backgroundColor: buttonColor }]}
    >
      <AccessibleTouchable
        onPress={onPress}
        accessibilityLabel="Scroll to bottom"
        accessibilityHint="Scrolls the page to the bottom"
      >
        <Ionicons name="arrow-down" size={22} color={iconColor} />
      </AccessibleTouchable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow — iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    // Elevation — Android
    elevation: 6,
  },
});
