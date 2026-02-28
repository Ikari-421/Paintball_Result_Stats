import { Colors, Spacing, Typography } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";

interface EmptyStateProps {
  message: string;
}

export const EmptyState = ({ message }: EmptyStateProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xxl,
    alignItems: "center",
  },
  text: {
    ...Typography.subtitle,
    color: Colors.text,
    opacity: 0.7,
  },
});
