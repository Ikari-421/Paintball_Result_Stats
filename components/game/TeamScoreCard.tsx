import { ThemedText } from "@/components/themed-text";
import { AppBorderRadius, AppSpacing } from "@/constants/AppSpacing";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface TeamScoreCardProps {
  teamName: string;
  score: number;
  backgroundColor: string;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function TeamScoreCard({
  teamName,
  score,
  backgroundColor,
  onIncrement,
  onDecrement,
}: TeamScoreCardProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.teamHeader, { backgroundColor }]}>
        <ThemedText style={styles.teamName}>{teamName}</ThemedText>
      </View>
      <ThemedText style={styles.score}>
        {score.toString().padStart(2, "0")}
      </ThemedText>
      <View style={styles.scoreButtons}>
        <TouchableOpacity style={styles.scoreButton} onPress={onIncrement}>
          <ThemedText style={styles.scoreButtonText}>+ Point</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.scoreButton} onPress={onDecrement}>
          <ThemedText style={styles.scoreButtonText}>- Point</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
  },
  teamHeader: {
    paddingVertical: AppSpacing.sm,
    paddingHorizontal: AppSpacing.xl,
    borderRadius: AppBorderRadius.md,
    marginBottom: AppSpacing.lg,
  },
  teamName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  score: {
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: AppSpacing.lg,
  },
  scoreButtons: {
    gap: AppSpacing.sm,
  },
  scoreButton: {
    backgroundColor: "#E8E8E8",
    paddingVertical: AppSpacing.sm,
    paddingHorizontal: AppSpacing.lg,
    borderRadius: AppBorderRadius.sm,
  },
  scoreButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
});
