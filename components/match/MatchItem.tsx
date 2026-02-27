import { ThemedText } from "@/components/themed-text";
import { AppBorderRadius, AppSpacing } from "@/constants/AppSpacing";
import { Match } from "@/types";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface MatchItemProps {
  match: Match;
  onPress?: () => void;
  onSettingsPress?: () => void;
}

export function MatchItem({ match, onPress, onSettingsPress }: MatchItemProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.matchRow}>
        <View style={styles.teamBox}>
          <ThemedText style={styles.teamText}>{match.teamA.name}</ThemedText>
        </View>
        <ThemedText style={styles.vsText}>VS</ThemedText>
        <View style={styles.teamBox}>
          <ThemedText style={styles.teamText}>{match.teamB.name}</ThemedText>
        </View>
        {onSettingsPress && (
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={onSettingsPress}
          >
            <ThemedText style={styles.settingsText}>⚙️</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#E8E8E8",
    padding: AppSpacing.lg,
    borderRadius: AppBorderRadius.md,
  },
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  teamBox: {
    backgroundColor: "#A1CEDC",
    paddingVertical: AppSpacing.sm,
    paddingHorizontal: AppSpacing.lg,
    borderRadius: AppBorderRadius.sm,
    flex: 1,
    marginHorizontal: AppSpacing.xs,
  },
  teamText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
  },
  vsText: {
    fontSize: 14,
    fontWeight: "bold",
    marginHorizontal: AppSpacing.xs,
  },
  settingsButton: {
    backgroundColor: "#FFD700",
    width: 35,
    height: 35,
    borderRadius: AppBorderRadius.round,
    justifyContent: "center",
    alignItems: "center",
  },
  settingsText: {
    fontSize: 16,
  },
});
