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
        <View style={styles.gridContainer}>
          {/* Row 1 / Merged Col : Status */}
          <View style={styles.rowTop}>
            <MatchStatusBadge status={currentStatus as GameStatus} isTimeStopped={isStopped} />
          </View>

          {/* Row 2 : Team A - VS - Team B */}
          <View style={styles.rowMiddle}>
            <View style={styles.teamCol}>
              <Text style={styles.teamName}>{teamAName}</Text>
              {scoreA !== undefined && (
                <Text style={styles.scoreText}>{scoreA}</Text>
              )}
            </View>

            <View style={styles.vsCol}>
              <View style={styles.vsBadge}>
                <Text style={styles.vsText}>VS</Text>
              </View>
            </View>

            <View style={styles.teamCol}>
              <Text style={styles.teamName}>{teamBName}</Text>
              {scoreB !== undefined && (
                <Text style={styles.scoreText}>{scoreB}</Text>
              )}
            </View>
          </View>

          {/* Row 3 / Merged Col : Game Mode */}
          {gameModeName && (
            <View style={styles.rowBottom}>
              <Text style={styles.gameMode}>Game Mode : <Text style={{ fontWeight: "bold" }}>{gameModeName}</Text></Text>
            </View>
          )}
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
    borderLeftWidth: 6,
    borderLeftColor: Colors.error,
    borderRightWidth: 6,
    borderRightColor: "#007AFF",
    ...Shadows.card,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
  },
  gridContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  rowTop: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  rowMiddle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  teamCol: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  vsCol: {
    paddingHorizontal: Spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  rowBottom: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.md,
  },
  gameMode: {
    fontSize: 12,
    color: Colors.secondary,
    textAlign: "center",
  },
  teamName: {
    textAlign: "center",
    ...Typography.subtitle,
    color: Colors.text,
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
  },
  vsText: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.text,
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
