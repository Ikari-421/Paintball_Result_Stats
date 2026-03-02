import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { TempMatchup } from "@/contexts/MatchupCreationContext";
import { Matchup } from "@/src/core/domain/Field";
import { Team } from "@/src/core/domain/Team";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";

interface MatchupListProps {
  matchups: (Matchup | TempMatchup)[];
  teams: Team[];
  onDelete: (matchupId: string) => void;
  onDragEnd?: (data: (Matchup | TempMatchup)[]) => void;
  ListHeaderComponent?: React.ReactElement;
}

export const MatchupList = ({
  matchups,
  teams,
  onDelete,
  onDragEnd,
  ListHeaderComponent,
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
    const teamBName = "teamBName" in matchup ? matchup.teamBName : undefined;

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
              <TouchableOpacity
                style={styles.deleteMatchupButton}
                onPress={() => onDelete(matchup.id)}
              >
                <Text style={styles.deleteIcon}>🗑️</Text>
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
      contentContainerStyle={{ paddingBottom: Spacing.xxl }}
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
  deleteMatchupButton: {
    padding: Spacing.sm,
  },
  deleteIcon: {
    fontSize: 18,
  },
});
