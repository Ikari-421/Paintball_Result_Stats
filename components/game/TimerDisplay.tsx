import { ThemedText } from "@/components/themed-text";
import { AppBorderRadius, AppSpacing } from "@/constants/AppSpacing";
import { StyleSheet, View } from "react-native";

interface TimerDisplayProps {
  label: string;
  minutes: number;
  seconds: number;
}

export function TimerDisplay({ label, minutes, seconds }: TimerDisplayProps) {
  const formattedTime = `${minutes.toString().padStart(2, "0")} : ${seconds.toString().padStart(2, "0")}`;

  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <ThemedText style={styles.time}>{formattedTime}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF8DC",
    padding: AppSpacing.lg,
    borderRadius: AppBorderRadius.md,
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: AppSpacing.xs,
  },
  time: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
});
