import React from "react";
import {
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";

interface Props extends TouchableOpacityProps {
  accessibilityLabel: string;
  accessibilityHint?: string;
}

const AccessibleTouchable: React.FC<Props> = ({
  accessibilityLabel,
  accessibilityHint,
  children,
  ...props
}) => {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
};

export default AccessibleTouchable;