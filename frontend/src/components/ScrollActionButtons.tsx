import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { BackToTopButton } from './BackToTopButton';
import { ScrollToBottomButton } from './ScrollToBottomButton';

export interface ScrollActionButtonsProps {
  topOpacity: Animated.Value;
  onScrollToTop: () => void;
  topVisible: boolean;
  bottomOpacity: Animated.Value;
  onScrollToBottom: () => void;
  bottomVisible: boolean;
  buttonColor?: string;
  iconColor?: string;
}

export const ScrollActionButtons: React.FC<ScrollActionButtonsProps> = ({
  topOpacity,
  onScrollToTop,
  topVisible,
  bottomOpacity,
  onScrollToBottom,
  bottomVisible,
  buttonColor = '#4CAF50',
  iconColor = '#fff',
}) => {
  return (
    <View style={styles.container} pointerEvents="box-none">
      <BackToTopButton
        opacity={topOpacity}
        onPress={onScrollToTop}
        visible={topVisible}
        buttonColor={buttonColor}
        iconColor={iconColor}
      />
      <ScrollToBottomButton
        opacity={bottomOpacity}
        onPress={onScrollToBottom}
        visible={bottomVisible}
        buttonColor={buttonColor}
        iconColor={iconColor}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    flexDirection: 'column',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 100,
  },
});
