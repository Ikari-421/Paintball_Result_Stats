import { EmptyState } from "@/components/common/EmptyState";
import { IconButton } from "@/components/common/IconButton";
import { FieldDetailHeader } from "@/components/field/FieldDetailHeader";
import { MatchupCard } from "@/components/field/MatchupCard";
import { Colors, Spacing } from "@/constants/theme";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { useCoreStore } from "@/src/presentation/state/useCoreStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

export default function FieldDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { fields, teams, removeMatchupFromField } = useCoreStore();
  const { showConfirm } = useConfirmDialog();

  const field = fields.find((f) => f.id === id);

  if (!field) {
    return (
      <View style={styles.container}>
        <EmptyState message="Field not found" />
        <IconButton title="Go Back" icon="←" onPress={() => router.back()} />
      </View>
    );
  }

  const handleDeleteMatchup = (
    matchupId: string,
    teamAName: string,
    teamBName: string,
  ) => {
    showConfirm(
      "Delete Matchup",
      `Remove ${teamAName} vs ${teamBName}?`,
      async () => {
        await removeMatchupFromField(field.id, matchupId);
      },
    );
  };

  const handleStartGames = () => {
    if (field.matchups.length === 0) return;
    const firstMatchup = field.matchups[0];
    router.push(`/game?fieldId=${field.id}&matchupId=${firstMatchup.id}`);
  };

  const handleEditField = () => {
    router.push(`/create-field?id=${field.id}`);
  };

  return (
    <View style={styles.container}>
      <FieldDetailHeader
        fieldName={field.name}
        matchupsCount={field.matchups.length}
        onBack={() => router.back()}
      />

      <ScrollView style={styles.content}>
        {field.matchups.length === 0 ? (
          <EmptyState message="No matchups scheduled" />
        ) : (
          field.matchups.map((matchup, index) => {
            const teamA = teams.find((t) => t.id === matchup.teamA);
            const teamB = teams.find((t) => t.id === matchup.teamB);
            const isActive = index === 0;

            return (
              <MatchupCard
                key={matchup.id}
                teamAName={teamA?.name || "Team A"}
                teamBName={teamB?.name || "Team B"}
                isActive={isActive}
                onPress={() =>
                  router.push(
                    `/game?fieldId=${field.id}&matchupId=${matchup.id}`,
                  )
                }
                onDelete={() =>
                  handleDeleteMatchup(
                    matchup.id,
                    teamA?.name || "Team A",
                    teamB?.name || "Team B",
                  )
                }
              />
            );
          })
        )}
      </ScrollView>

      <View style={styles.footer}>
        <IconButton
          title="Start Games"
          icon="▶️"
          variant="accent"
          onPress={handleStartGames}
          disabled={field.matchups.length === 0}
          style={styles.footerButton}
        />
        <IconButton
          title="Edit Field"
          icon="✏️"
          variant="outline"
          onPress={handleEditField}
          style={styles.footerButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  footer: {
    flexDirection: "row",
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  footerButton: {
    flex: 1,
  },
});
