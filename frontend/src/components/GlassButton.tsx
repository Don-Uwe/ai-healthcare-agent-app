import React, { useRef } from 'react';
import {
  Pressable,
  Text,
  ViewStyle,
  TextStyle,
  StyleProp,
  ActivityIndicator,
  useColorScheme,
  Animated,
} from 'react-native';
import { GlassStyles, ProfessionalColors, Typography } from '../styles/GlassStyles';

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'glass' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  title,
  onPress,
  variant = 'default',
  size = 'md',
  borderRadius = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 80,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.0,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return GlassStyles.btnPrimary;
      case 'secondary':
        return GlassStyles.btnSecondary;
      case 'outline':
        return GlassStyles.btnOutline;
      case 'danger':
        return GlassStyles.btnDanger;
      case 'glass':
        return isDarkMode ? GlassStyles.glassButton : GlassStyles.glassButtonLight;
      case 'default':
      default:
        return isDarkMode ? GlassStyles.glassButton : GlassStyles.glassButtonLight;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return GlassStyles.btnSm;
      case 'lg':
        return GlassStyles.btnLg;
      case 'md':
      default:
        return GlassStyles.btnMd;
    }
  };

  const getRadiusStyle = () => {
    switch (borderRadius) {
      case 'none':
        return GlassStyles.radiusNone;
      case 'sm':
        return GlassStyles.radiusSm;
      case 'lg':
        return GlassStyles.radiusLg;
      case 'full':
        return GlassStyles.radiusFull;
      case 'md':
      default:
        return GlassStyles.radiusMd;
    }
  };

  const getTextColor = () => {
    if (variant === 'primary' || variant === 'secondary' || variant === 'danger') {
      return ProfessionalColors.white;
    }
    if (variant === 'outline') {
      return ProfessionalColors.primary;
    }
    return isDarkMode ? ProfessionalColors.white : ProfessionalColors.gray800;
  };

  const getTextSizeStyle = () => {
    switch (size) {
      case 'sm':
        return Typography.bodySmall;
      case 'lg':
        return Typography.h6;
      case 'md':
      default:
        return Typography.button;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      accessibilityRole="button"
      style={({ pressed }) => [
        {
          width: fullWidth ? '100%' : 'auto',
          alignSelf: fullWidth ? 'stretch' : 'center',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
        },
        disabled && { opacity: 0.5 },
      ]}
    >
      <Animated.View
        style={[
          getVariantStyle(),
          getSizeStyle(),
          getRadiusStyle(),
          {
            transform: [{ scale: scaleAnim }],
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
          },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={
              variant === 'primary' || variant === 'secondary' || variant === 'danger'
                ? ProfessionalColors.white
                : ProfessionalColors.primary
            }
          />
        ) : (
          <Text
            style={[
              getTextSizeStyle(),
              {
                color: getTextColor(),
                textAlign: 'center',
                fontWeight: '600',
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        )}
      </Animated.View>
    </Pressable>
  );
};

export default GlassButton;
