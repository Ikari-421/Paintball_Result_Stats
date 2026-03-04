import { MatchStatusBadge } from "@/components/match/MatchStatusBadge";
import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { TempMatchup } from "@/contexts/MatchupCreationContext";
import { Matchup } from "@/src/core/domain/Field";
import { GameStatus } from "@/src/core/domain/GameStatus";
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
}

export const MatchupList = ({
  matchups,
  teams,
  onDelete,
  onEdit,
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
    const teamBName = (matchup as any).teamBName;
    const gameModeName = (matchup as any).gameMode?.name;

    const statusStr = (matchup as any).status || GameStatus.NOT_STARTED;
    const isStopped = statusStr === "TIME_STOPPED" || statusStr === GameStatus.BREAK;

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
              {gameModeName && (
                <Text style={styles.gameMode}>🎮 {gameModeName}</Text>
              )}
              <View style={styles.statusContainer}>
                <MatchStatusBadge status={statusStr} isTimeStopped={isStopped} />
              </View>
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
    flexDirection: "column",
    justifyContent: "center",
  },
  teamsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  teamName: {
    flex: 1,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 14,
    color: Colors.text,
  },
  gameMode: {
    fontSize: 12,
    color: Colors.secondary,
    textAlign: "center",
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
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
