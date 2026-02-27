import { ThemedText } from "@/components/themed-text";
import { AppBorderRadius } from "@/constants/AppSpacing";
import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native";

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "accent" | "danger";
  disabled?: boolean;
  style?: ViewStyle;
}

export function AppButton({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  style,
}: AppButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <ThemedText style={styles.buttonText}>{title}</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: AppBorderRadius.md,
    alignItems: "center",
  },
  primary: {
    backgroundColor: "#A1CEDC",
  },
  secondary: {
    backgroundColor: "#FFB84D",
  },
  accent: {
    backgroundColor: "#90EE90",
  },
  danger: {
    backgroundColor: "#FFB8A0",
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
});
