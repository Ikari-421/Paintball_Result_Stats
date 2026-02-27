import { BorderRadius, Colors, Spacing, Typography } from "@/constants/theme";
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";

interface OutlineButtonProps {
  title: string;
  icon?: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export const OutlineButton = ({
  title,
  icon,
  onPress,
  disabled,
  style,
}: OutlineButtonProps) => {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled}
    >
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  icon: {
    fontSize: 20,
  },
  text: {
    ...Typography.subtitle,
    color: Colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
});
