import React from 'react';
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
 
/**
 * BackToTopButton — Standalone floating action button component.
 *
 * Rendered by consumers of useBackToTop hook.
 *
 * Props:
 *   opacity      — Animated.Value controlling fade in/out
 *   onPress      — callback to scroll to top
 *   visible      — whether the button should be rendered
 *   buttonColor  — FAB background colour  (default: '#4CAF50')
 *   iconColor    — arrow icon colour      (default: '#fff')
 */
 
export interface BackToTopButtonProps {
  opacity: Animated.Value;
  onPress: () => void;
  visible: boolean;
  buttonColor?: string;
  iconColor?: string;
}
 
export const BackToTopButton: React.FC<BackToTopButtonProps> = ({
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
      <TouchableOpacity
        onPress={onPress}
        accessibilityLabel="Back to top"
        accessibilityRole="button"
        accessibilityHint="Scrolls the page back to the top"
      >
        <Ionicons name="arrow-up" size={22} color={iconColor} />
      </TouchableOpacity>
    </Animated.View>
  );
};
 
const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
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