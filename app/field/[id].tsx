import { EmptyState } from "@/components/common/EmptyState";
import { OutlineButton } from "@/components/common/OutlineButton";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { SecondaryButton } from "@/components/common/SecondaryButton";
import { FieldDetailHeader } from "@/components/field/FieldDetailHeader";
import { MatchupCard } from "@/components/field/MatchupCard";
import { Colors, Spacing } from "@/constants/theme";
import { useCoreStore } from "@/src/presentation/state/useCoreStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, ScrollView, StyleSheet, View } from "react-native";

export default function FieldDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { fields, teams, deleteField } = useCoreStore();

  const field = fields.find((f) => f.id === id);

  if (!field) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <EmptyState message="Field not found" />
          <PrimaryButton title="Go Back" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  const handleStartGames = () => {
    if (field.matchups.length === 0) return;
    const firstMatchup = field.matchups[0];
    router.push(`/game?fieldId=${field.id}&matchupId=${firstMatchup.id}`);
  };

  const handleEditField = () => {
    router.push(`/edit-field?id=${field.id}`);
  };

  const handleDeleteField = () => {
    if (field.matchups.length > 0) {
      Alert.alert(
        "Cannot Delete Field",
        `This field has ${field.matchups.length} matchup(s) scheduled. Please remove all matchups before deleting the field.`,
      );
      return;
    }

    Alert.alert(
      "Delete Field",
      `Are you sure you want to delete "${field.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteField(field.id);
            router.push("/fields-list");
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <FieldDetailHeader
        fieldName={field.name}
        matchupsCount={field.matchups.length}
        onBack={() => router.push("/fields-list")}
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
              />
            );
          })
        )}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title="Start Games"
          onPress={handleStartGames}
          disabled={field.matchups.length === 0}
          style={styles.startButton}
        />
        <View style={styles.actionButtons}>
          <OutlineButton
            title="Edit Field"
            onPress={handleEditField}
            style={styles.actionButton}
          />
          <SecondaryButton
            title="Delete Field"
            onPress={handleDeleteField}
            style={styles.deleteButton}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  footer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  startButton: {
    backgroundColor: Colors.accent,
  },
  actionButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: Colors.danger,
  },
});
