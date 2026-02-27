import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { TempMatchup } from "@/contexts/MatchupCreationContext";
import { Matchup } from "@/src/core/domain/Field";
import { Team } from "@/src/core/domain/Team";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface MatchupListProps {
  matchups: (Matchup | TempMatchup)[];
  teams: Team[];
  onDelete: (matchupId: string) => void;
  onMoveUp?: (matchupId: string) => void;
  onMoveDown?: (matchupId: string) => void;
}

export const MatchupList = ({
  matchups,
  teams,
  onDelete,
  onMoveUp,
  onMoveDown,
}: MatchupListProps) => {
  const getTeamName = (teamId: string, cachedName?: string) => {
    if (cachedName) return cachedName;
    return teams.find((t) => t.id === teamId)?.name || "Unknown";
  };

  if (matchups.length === 0) {
    return (
      <Text style={styles.emptyText}>
        No matchups yet. Add teams to this field.
      </Text>
    );
  }

  return (
    <>
      {matchups.map((matchup, index) => {
        const teamAName =
          "teamAName" in matchup ? matchup.teamAName : undefined;
        const teamBName =
          "teamBName" in matchup ? matchup.teamBName : undefined;

        return (
          <View key={matchup.id} style={styles.matchupCard}>
            <View style={styles.matchupContent}>
              <Text style={styles.teamName}>
                {getTeamName(matchup.teamA, teamAName)}
              </Text>
              <View style={styles.vsBadge}>
                <Text style={styles.vsText}>VS</Text>
              </View>
              <Text style={styles.teamName}>
                {getTeamName(matchup.teamB, teamBName)}
              </Text>
            </View>
            <View style={styles.actionsContainer}>
              {onMoveUp && index > 0 && (
                <TouchableOpacity
                  style={styles.reorderButton}
                  onPress={() => onMoveUp(matchup.id)}
                >
                  <Text style={styles.reorderIcon}>⬆️</Text>
                </TouchableOpacity>
              )}
              {onMoveDown && index < matchups.length - 1 && (
                <TouchableOpacity
                  style={styles.reorderButton}
                  onPress={() => onMoveDown(matchup.id)}
                >
                  <Text style={styles.reorderIcon}>⬇️</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.deleteMatchupButton}
                onPress={() => onDelete(matchup.id)}
              >
                <Text style={styles.deleteIcon}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </>
  );
};

const styles = StyleSheet.create({
  emptyText: {
    fontSize: 14,
    color: Colors.text,
    opacity: 0.6,
    textAlign: "center",
    marginTop: Spacing.xxl,
    fontStyle: "italic",
  },
  matchupCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  matchupContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  teamName: {
    flex: 1,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 14,
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
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  reorderButton: {
    padding: Spacing.xs,
  },
  reorderIcon: {
    fontSize: 16,
  },
  deleteMatchupButton: {
    padding: Spacing.sm,
  },
  deleteIcon: {
    fontSize: 18,
  },
});
