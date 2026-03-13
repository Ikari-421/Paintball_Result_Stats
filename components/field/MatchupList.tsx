import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { TempMatchup } from "@/contexts/MatchupCreationContext";
import { Matchup } from "@/src/core/domain/Field";
import { Team } from "@/src/core/domain/Team";
import { Ionicons } from "@expo/vector-icons";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";

interface MatchupListProps {
  matchups: (Matchup | TempMatchup)[];
  teams: Team[];
  onDelete: (matchupId: string) => void;
  onEdit?: (matchupId: string) => void;
  onDragEnd?: (data: (Matchup | TempMatchup)[]) => void;
  ListHeaderComponent?: React.ReactElement;
  games?: any[]; // Pass games array here
}

export const MatchupList = ({
  matchups,
  teams,
  onDelete,
  onEdit,
  onDragEnd,
  ListHeaderComponent,
  games = [],
}: MatchupListProps) => {
  const getTeamName = (teamId: string, cachedName?: string) => {
    if (cachedName) return cachedName;
    return teams.find((t) => t.id === teamId)?.name || "Unknown";
  };

  if (matchups.length === 0) {
    return (
      <View>
        {ListHeaderComponent}
        <Text style={styles.emptyText}>
          No matchups yet. Add teams to this field.
        </Text>
      </View>
    );
  }

  const renderItem = ({
    item,
    drag,
    isActive,
  }: RenderItemParams<Matchup | TempMatchup>) => {
    const matchup = item;
    const teamAName = "teamAName" in matchup ? matchup.teamAName : undefined;
    const teamBName = (matchup as any).teamBName;
    const gameModeName = (matchup as any).gameMode?.name;

    // Find the real game locally
    const existingGame = games.find((g) => g.matchup.id === matchup.id);
    const scoreA = existingGame?.score?.teamAScore;
    const scoreB = existingGame?.score?.teamBScore;

    return (
      <ScaleDecorator>
        <TouchableOpacity
          activeOpacity={1}
          onLongPress={drag}
          disabled={isActive}
          style={[
            styles.matchupCardWrapper,
            { backgroundColor: isActive ? Colors.background : "transparent" },
          ]}
        >
          <View
            style={[
              styles.matchupCard,
              { elevation: isActive ? 8 : 3 },
            ]}
          >
            {onDragEnd && (
              <View style={styles.dragHandle}>
                <Text style={styles.dragIcon}>☰</Text>
              </View>
            )}
            <View style={styles.matchupContent}>
              <View style={styles.teamsContainer}>
                <View style={styles.teamScoreWrapper}>
                  <Text style={styles.teamName}>
                    {getTeamName(matchup.teamA, teamAName)}
                  </Text>
                  {scoreA !== undefined && (
                    <Text style={styles.scoreText}>{scoreA}</Text>
                  )}
                </View>

                <View style={styles.vsBadge}>
                  <Text style={styles.vsText}>VS</Text>
                </View>

                <View style={styles.teamScoreWrapper}>
                  <Text style={styles.teamName}>
                    {getTeamName(matchup.teamB, teamBName)}
                  </Text>
                  {scoreB !== undefined && (
                    <Text style={styles.scoreText}>{scoreB}</Text>
                  )}
                </View>
              </View>
              {gameModeName && (
                <Text style={styles.gameMode}>
                  Game Mode : <Text style={{ fontWeight: "bold" }}>{gameModeName}</Text>
                </Text>
              )}
            </View>
            <View style={styles.actionsContainer}>
              {onEdit && (
                <TouchableOpacity
                  style={styles.deleteMatchupButton}
                  onPress={() => onEdit(matchup.id)}
                >
                  <Ionicons name="pencil-outline" size={20} color={Colors.primary} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.deleteMatchupButton}
                onPress={() => {
                  Alert.alert(
                    "Delete Matchup",
                    "Are you sure you want to delete this matchup?",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: () => onDelete(matchup.id)
                      }
                    ]
                  );
                }}
              >
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  if (!onDragEnd) {
    return (
      <View>
        {ListHeaderComponent}
        {matchups.map((matchup) => renderItem({ item: matchup, getIndex: () => 0, drag: () => { }, isActive: false } as any))}
      </View>
    );
  }

  return (
    <DraggableFlatList
      data={matchups}
      onDragEnd={({ data }) => onDragEnd(data)}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={ListHeaderComponent}
      contentContainerStyle={{ paddingBottom: Spacing.xxxl }}
    />
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
  matchupCardWrapper: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  matchupCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dragHandle: {
    paddingRight: Spacing.md,
    justifyContent: "center",
    alignItems: "center",
  },
  dragIcon: {
    fontSize: 20,
    color: Colors.secondary,
    opacity: 0.5,
  },
  matchupContent: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  teamsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  teamName: {
    textAlign: "center",
    fontWeight: "600",
    fontSize: 14,
    color: Colors.text,
  },
  teamScoreWrapper: {
    flex: 1,
    alignItems: "center",
  },
  scoreText: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.primary,
    marginTop: 4,
  },
  gameMode: {
    fontSize: 12,
    color: Colors.secondary,
    textAlign: "center",
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
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
  deleteMatchupButton: {
    padding: Spacing.sm,
  },
  deleteIcon: {
    fontSize: 18,
  },
});
