import React from 'react';
import {
  TouchableOpacity,
  Text,
  ViewStyle,
  TextStyle,
  StyleProp,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { GlassStyles, ProfessionalColors, Typography } from '../styles/GlassStyles';

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'default' | 'primary';
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
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return GlassStyles.glassButtonPrimary;
      case 'default':
      default:
        return isDarkMode ? GlassStyles.glassButton : GlassStyles.glassButtonLight;
    }
  };

  const getTextColor = () => {
    if (variant === 'primary') return ProfessionalColors.white;
    return isDarkMode ? ProfessionalColors.white : ProfessionalColors.gray800;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        getVariantStyle(),
        fullWidth && { width: '100%' },
        disabled && { opacity: 0.5 },
        style,
      ]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? ProfessionalColors.white : ProfessionalColors.primary}
        />
      ) : (
        <Text
          style={[
            Typography.button,
            {
              color: getTextColor(),
              textAlign: 'center',
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default GlassButton;
