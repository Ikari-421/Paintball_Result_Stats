import { ScreenHeader } from "@/components/common/ScreenHeader";
import { SearchInput } from "@/components/common/SearchInput";
import { GuestTeamForm } from "@/components/team/GuestTeamForm";
import { TeamCard } from "@/components/team/TeamCard";
import { Colors, Spacing } from "@/constants/theme";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { useSearch } from "@/hooks/useSearch";
import { useCoreStore } from "@/src/presentation/state/useCoreStore";
import { getAvatarColor } from "@/utils/avatarUtils";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";

export default function TeamsListScreen() {
  const router = useRouter();
  const { teams, fields, loadTeams, loadFields, createTeam, deleteTeam } =
    useCoreStore();
  const { query, setQuery, filteredItems } = useSearch(teams, "name");
  const { showConfirm } = useConfirmDialog();

  useEffect(() => {
    loadTeams();
    loadFields();
  }, []);

  const handleEdit = (teamId: string) => {
    router.push(`/team/edit-team?id=${teamId}`);
  };

  const handleDelete = (teamId: string, teamName: string) => {
    const isUsedInMatchups = fields.some((field) =>
      field.matchups.some(
        (m: { teamA: string; teamB: string }) =>
          m.teamA === teamId || m.teamB === teamId,
      ),
    );

    if (isUsedInMatchups) {
      Alert.alert(
        "Cannot Delete Team",
        `"${teamName}" is used in active matchups. Please remove the team from all matchups first.`,
      );
      return;
    }
    showConfirm(
      "Delete Team",
      `Are you sure you want to delete "${teamName}"?`,
      async () => {
        await deleteTeam(teamId);
      },
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Select Team" onBack={() => router.push("/menu")} />

      <ScrollView style={styles.content}>
        <SearchInput
          value={query}
          onChangeText={setQuery}
          placeholder="Filter teams..."
        />

        {filteredItems.map((team, index) => (
          <TeamCard
            key={team.id}
            team={team}
            onEdit={() => handleEdit(team.id)}
            onDelete={() => handleDelete(team.id, team.name)}
            avatarColor={getAvatarColor(index)}
          />
        ))}

        <GuestTeamForm onSubmit={createTeam} />
      </ScrollView>
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
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
});
