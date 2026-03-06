import { MatchStatusBadge } from "@/components/match/MatchStatusBadge";
import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from "@/constants/theme";
import { GameStatus } from "@/src/core/domain/GameStatus";
import { Ionicons } from "@expo/vector-icons";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface MatchupCardProps {
  teamAName: string;
  teamBName: string;
  gameModeName?: string;
  status?: GameStatus | string;
  scoreA?: number;
  scoreB?: number;
  onPress: () => void;
  onDelete?: () => void;
}

export const MatchupCard = ({
  teamAName,
  teamBName,
  gameModeName,
  status,
  scoreA,
  scoreB,
  onPress,
  onDelete,
}: MatchupCardProps) => {
  const currentStatus = status || GameStatus.NOT_STARTED;
  const isStopped = currentStatus === "TIME_STOPPED" || currentStatus === GameStatus.BREAK;

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.content} onPress={onPress}>
        <View style={styles.mainContent}>
          <View style={styles.teamsContainer}>
            <View style={styles.teamScoreWrapper}>
              <Text style={styles.teamName}>{teamAName}</Text>
              {scoreA !== undefined && (
                <Text style={styles.scoreText}>{scoreA}</Text>
              )}
            </View>
            <View style={styles.vsBadge}>
              <Text style={styles.vsText}>VS</Text>
            </View>
            <View style={styles.teamScoreWrapper}>
              <Text style={styles.teamName}>{teamBName}</Text>
              {scoreB !== undefined && (
                <Text style={styles.scoreText}>{scoreB}</Text>
              )}
            </View>
          </View>
          {gameModeName && (
            <Text style={styles.gameMode}>🎮 {gameModeName}</Text>
          )}
          <View style={styles.badgeContainer}>
            <MatchStatusBadge status={currentStatus as GameStatus} isTimeStopped={isStopped} />
          </View>
        </View>
      </TouchableOpacity>
      {onDelete && (
        <TouchableOpacity style={styles.deleteButton} onPress={() => {
          Alert.alert(
            "Delete Matchup",
            "Are you sure you want to delete this matchup?",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Delete", style: "destructive", onPress: onDelete }
            ]
          );
        }}>
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    ...Shadows.card,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
  },
  mainContent: {
    flex: 1,
  },
  teamsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  gameMode: {
    fontSize: 12,
    color: Colors.secondary,
    textAlign: "center",
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  teamName: {
    textAlign: "center",
    ...Typography.subtitle,
    color: Colors.text,
  },
  teamScoreWrapper: {
    flex: 1,
    alignItems: "center",
  },
  scoreText: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.primary,
    marginTop: 4,
  },
  vsBadge: {
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.md,
  },
  vsText: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.text,
  },
  badgeContainer: {
    marginTop: Spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButton: {
    width: 50,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteIcon: {
    fontSize: 20,
  },
});
