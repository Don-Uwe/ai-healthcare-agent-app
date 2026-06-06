import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  useColorScheme,
} from 'react-native';

import {
  ProfessionalColors,
  Typography,
  Spacing,
} from '../styles/GlassStyles';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  disabled?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  secureTextEntry,
  editable = true,
  disabled = false,
  accessibilityLabel,
  style,
  id,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const isPasswordField = secureTextEntry;

  const isEditable = disabled ? false : editable;

  const borderColor = !isEditable
    ? ProfessionalColors.gray400
    : error
    ? ProfessionalColors.error
    : isFocused
    ? ProfessionalColors.primary
    : isDarkMode
    ? ProfessionalColors.gray700
    : ProfessionalColors.gray300;

  return (
    <View style={styles.container}>
      {label && (
        <Text
          style={[
            Typography.bodySmall,
            styles.label,
            {
              color: isDarkMode
                ? ProfessionalColors.gray300
                : ProfessionalColors.gray700,
            },
          ]}
        >
          {label}
        </Text>
      )}

      <View style={styles.inputWrapper}>
        <TextInput
          {...props}
          nativeID={id}
          editable={isEditable}
          secureTextEntry={
            isPasswordField
              ? !showPassword
              : secureTextEntry
          }
          style={[
            styles.input,
            Typography.body,
            {
              borderColor,

              color: isDarkMode
                ? ProfessionalColors.white
                : ProfessionalColors.gray800,

              backgroundColor: isDarkMode
                ? ProfessionalColors.gray900
                : ProfessionalColors.white,

              opacity: isEditable ? 1 : 0.6,

              paddingRight: isPasswordField ? 70 : 16,
            },
            style,
          ]}
          placeholderTextColor={
            isDarkMode
              ? ProfessionalColors.gray500
              : ProfessionalColors.gray400
          }
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          accessibilityLabel={accessibilityLabel || label}
          accessibilityHint={
            error ? `Error: ${error}` : undefined
          }
          accessibilityState={{
            disabled: !isEditable,
          }}
        />

        {isPasswordField && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={
              showPassword
                ? 'Hide password'
                : 'Show password'
            }
            onPress={() =>
              setShowPassword((prev) => !prev)
            }
            style={styles.toggleButton}
          >
            <Text
              style={[
                Typography.bodySmall,
                {
                  color: ProfessionalColors.primary,
                  fontWeight: '600',
                },
              ]}
            >
              {showPassword ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.errorContainer}>
        {error ? (
          <Text
            accessibilityRole="alert"
            style={[
              Typography.caption,
              {
                color: ProfessionalColors.error,
              },
            ]}
          >
            {error}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  label: {
    marginBottom: Spacing.xs,
    fontWeight: '500',
  },

  inputWrapper: {
    position: 'relative',
    width: '100%',
  },

  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
  },

  toggleButton: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
  },

  errorContainer: {
    minHeight: 20,
    marginTop: Spacing.xs,
  },
});

export default Input;
