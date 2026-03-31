import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  ViewStyle,
  TextStyle,
  StyleProp,
  TextInputProps,
  useColorScheme,
} from 'react-native';
import { GlassStyles, ProfessionalColors, Typography, Spacing } from '../styles/GlassStyles';

interface GlassInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
}


export const GlassInput: React.FC<GlassInputProps> = ({
  label,
  error,
  containerStyle,
  inputStyle,
  labelStyle,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const getInputStyle = () => {
    if (isFocused) {
      return isDarkMode ? GlassStyles.glassInputFocused : GlassStyles.glassInputFocusedLight;
    }
    return isDarkMode ? GlassStyles.glassInput : GlassStyles.glassInputLight;
  };

  return (
    <View style={[{ width: '100%' }, containerStyle]}>
      {label && (
        <Text
          style={[
            Typography.bodySmall,
            {
              color: isDarkMode ? ProfessionalColors.gray300 : ProfessionalColors.gray700,
              marginBottom: Spacing.xs,
              fontWeight: '500',
            },
            labelStyle,
          ]}
        >
          {label}
        </Text>
      )}
      <TextInput
        {...textInputProps}
        style={[
          getInputStyle(),
          Typography.body,
          {
            color: isDarkMode ? ProfessionalColors.white : ProfessionalColors.gray800,
          },
          inputStyle,
        ]}
        onFocus={(e) => {
          setIsFocused(true);
          textInputProps.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          textInputProps.onBlur?.(e);
        }}
        placeholderTextColor={isDarkMode ? ProfessionalColors.gray500 : ProfessionalColors.gray400}
      />
      {error && (
        <Text
          style={[
            Typography.caption,
            {
              color: ProfessionalColors.error,
              marginTop: Spacing.xs,
            },
          ]}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

export default GlassInput;
