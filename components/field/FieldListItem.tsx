import { ThemedText } from "@/components/themed-text";
import { AppBorderRadius, AppSpacing } from "@/constants/AppSpacing";
import { Field } from "@/types";
import { StyleSheet, TouchableOpacity } from "react-native";

interface FieldListItemProps {
  field: Field;
  onPress: () => void;
}

export function FieldListItem({ field, onPress }: FieldListItemProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <ThemedText style={styles.text}>{field.name}</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFB8A0",
    paddingVertical: AppSpacing.lg,
    paddingHorizontal: AppSpacing.xl,
    borderRadius: AppBorderRadius.md,
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
});
