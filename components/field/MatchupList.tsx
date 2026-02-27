import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { Matchup } from "@/src/core/domain/Field";
import { Team } from "@/src/core/domain/Team";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface MatchupListProps {
  matchups: Matchup[];
  teams: Team[];
  onDelete: (matchupId: string) => void;
}

export const MatchupList = ({ matchups, teams, onDelete }: MatchupListProps) => {
  const getTeamName = (teamId: string) => {
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
      {matchups.map((matchup) => (
        <View key={matchup.id} style={styles.matchupCard}>
          <View style={styles.matchupContent}>
            <Text style={styles.teamName}>{getTeamName(matchup.teamA)}</Text>
            <View style={styles.vsBadge}>
              <Text style={styles.vsText}>VS</Text>
            </View>
            <Text style={styles.teamName}>{getTeamName(matchup.teamB)}</Text>
          </View>
          <TouchableOpacity
            style={styles.deleteMatchupButton}
            onPress={() => onDelete(matchup.id)}
          >
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
      ))}
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
  deleteMatchupButton: {
    padding: Spacing.sm,
  },
  deleteIcon: {
    fontSize: 18,
  },
});
