import React from 'react';
import { View, ViewStyle, StyleProp, useColorScheme } from 'react-native';
import { GlassStyles } from '../styles/GlassStyles';

interface GlassContainerProps {
  children: React.ReactNode;
  variant?: 'default' | 'light' | 'dark' | 'card' | 'elevated' | 'frosted';
  style?: StyleProp<ViewStyle>;
}

export const GlassContainer: React.FC<GlassContainerProps> = ({
  children,
  variant = 'default',
  style,
}) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const getVariantStyle = () => {
    switch (variant) {
      case 'light':
        return GlassStyles.glassContainerLight;
      case 'dark':
        return GlassStyles.glassContainerDark;
      case 'card':
        return isDarkMode ? GlassStyles.glassCard : GlassStyles.glassCardLight;
      case 'elevated':
        return isDarkMode ? GlassStyles.glassCardElevated : GlassStyles.glassCardElevatedLight;
      case 'frosted':
        return GlassStyles.frostedGlass;
      case 'default':
      default:
        return isDarkMode ? GlassStyles.glassContainer : GlassStyles.glassContainerLightMode;
    }
  };

  return <View style={[getVariantStyle(), style]}>{children}</View>;
};

export default GlassContainer;
