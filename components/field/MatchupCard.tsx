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
  onPress: () => void;
  onDelete?: () => void;
}

export const MatchupCard = ({
  teamAName,
  teamBName,
  gameModeName,
  status,
  onPress,
  onDelete,
}: MatchupCardProps) => {
  const getStatusConfig = (status: GameStatus | string) => {
    switch (status) {
      case GameStatus.NOT_STARTED:
      case GameStatus.FINISHED:
        return { color: "#FF3B30", text: status ? status.replace("_", " ") : "UNKNOWN" };
      case GameStatus.BREAK:
        return { color: "#FF9500", text: status };
      case GameStatus.RUNNING:
      case GameStatus.OVERTIME:
        return { color: "#34C759", text: status };
      default:
        return { color: Colors.secondary, text: status || "UNKNOWN" };
    }
  };

  const currentStatus = status || GameStatus.NOT_STARTED;
  const statusConfig = getStatusConfig(currentStatus);

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.content} onPress={onPress}>
        <View style={styles.mainContent}>
          <View style={styles.teamsContainer}>
            <Text style={styles.teamName}>
              {teamAName}
            </Text>
            <View style={styles.vsBadge}>
              <Text style={styles.vsText}>
                VS
              </Text>
            </View>
            <Text style={styles.teamName}>
              {teamBName}
            </Text>
          </View>
          {gameModeName && (
            <Text style={styles.gameMode}>🎮 {gameModeName}</Text>
          )}
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.text}
            </Text>
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
    flex: 1,
    textAlign: "center",
    ...Typography.subtitle,
    color: Colors.text,
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
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
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
