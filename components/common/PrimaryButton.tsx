import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from "@/constants/theme";
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export const PrimaryButton = ({
  title,
  onPress,
  disabled,
  style,
}: PrimaryButtonProps) => {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: "center",
    ...Shadows.card,
  },
  text: {
    ...Typography.subtitle,
    color: Colors.white,
  },
  disabled: {
    opacity: 0.5,
  },
});
