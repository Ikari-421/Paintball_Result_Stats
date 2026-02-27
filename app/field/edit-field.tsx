import { OutlineButton } from "@/components/common/OutlineButton";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { SecondaryButton } from "@/components/common/SecondaryButton";
import { MatchupList } from "@/components/field/MatchupList";
import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { Matchup } from "@/src/core/domain/Field";
import { useCoreStore } from "@/src/presentation/state/useCoreStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface MatchupWithDetails extends Matchup {
  teamAName?: string;
  teamBName?: string;
  gameModeId?: string;
  gameModeName?: string;
}

export default function EditFieldScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    matchup?: string;
    teamAName?: string;
    teamBName?: string;
    gameModeId?: string;
    gameModeName?: string;
  }>();
  const { id } = params;
  const {
    fields,
    teams,
    updateField,
    addMatchupToField,
    removeMatchupFromField,
    loadTeams,
    error,
  } = useCoreStore();

  const [name, setName] = useState("");
  const [matchups, setMatchups] = useState<MatchupWithDetails[]>([]);
  const lastProcessedMatchup = useRef<string | null>(null);

  const field = fields.find((f) => f.id === id);

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    if (field) {
      setName(field.name);
      const matchupsWithDetails: MatchupWithDetails[] = field.matchups.map(
        (m) => {
          const teamA = teams.find((t) => t.id === m.teamA);
          const teamB = teams.find((t) => t.id === m.teamB);
          return {
            ...m,
            teamAName: teamA?.name,
            teamBName: teamB?.name,
          };
        },
      );
      setMatchups(matchupsWithDetails);
    }
  }, [field, teams]);

  useEffect(() => {
    if (
      params.matchup &&
      field &&
      params.matchup !== lastProcessedMatchup.current
    ) {
      try {
        const matchup = JSON.parse(params.matchup) as Matchup;
        addMatchupToField(field.id, matchup.teamA, matchup.teamB);
        lastProcessedMatchup.current = params.matchup;
      } catch (err) {
        console.error("Error parsing matchup:", err);
      }
    }
  }, [params.matchup, field]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Field name is required");
      return;
    }

    if (!field) {
      Alert.alert("Error", "Field not found");
      return;
    }

    try {
      await updateField(field.id, name.trim());
      router.push(`/field/${field.id}`);
    } catch (err) {
      Alert.alert("Error", error || "Unable to update field");
    }
  };

  const handleAddMatchup = () => {
    router.push(
      `/field/matchup/create-matchup?returnTo=/field/edit-field&fieldId=${id}`,
    );
  };

  const handleDeleteMatchup = async (matchupId: string) => {
    if (!field) return;

    try {
      await removeMatchupFromField(field.id, matchupId);
      setMatchups(matchups.filter((m) => m.id !== matchupId));
    } catch (err) {
      Alert.alert("Error", "Unable to delete matchup");
    }
  };

  const handleMoveUp = (matchupId: string) => {
    const index = matchups.findIndex((m) => m.id === matchupId);
    if (index > 0) {
      const newMatchups = [...matchups];
      [newMatchups[index - 1], newMatchups[index]] = [
        newMatchups[index],
        newMatchups[index - 1],
      ];
      setMatchups(newMatchups);
    }
  };

  const handleMoveDown = (matchupId: string) => {
    const index = matchups.findIndex((m) => m.id === matchupId);
    if (index < matchups.length - 1) {
      const newMatchups = [...matchups];
      [newMatchups[index], newMatchups[index + 1]] = [
        newMatchups[index + 1],
        newMatchups[index],
      ];
      setMatchups(newMatchups);
    }
  };

  const handleModSetup = () => {
    router.push("/gamemode/game-modes-list");
  };

  if (!field) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Edit Field" onBack={() => router.back()} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Field not found</Text>
          <PrimaryButton title="Go Back" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Edit Field"
        onBack={() => router.push(`/field/${field.id}`)}
      />

      <ScrollView style={styles.content}>
        <Text style={styles.label}>Field Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Main Arena"
          placeholderTextColor={Colors.secondary}
          autoFocus
        />

        <View style={styles.matchupsHeader}>
          <Text style={styles.matchupsTitle}>MatchUps</Text>
          <Text style={styles.matchupsCount}>{matchups.length} Scheduled</Text>
        </View>

        <MatchupList
          matchups={matchups}
          teams={teams}
          onDelete={handleDeleteMatchup}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
        />
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.actionButtons}>
          <OutlineButton
            title="+ MatchUp"
            onPress={handleAddMatchup}
            style={styles.actionButton}
          />
          <SecondaryButton
            title="Mod Setup"
            onPress={handleModSetup}
            style={styles.actionButton}
          />
        </View>
        <PrimaryButton
          title="Update Field"
          onPress={handleSubmit}
          disabled={!name.trim()}
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    marginBottom: Spacing.xl,
  },
  matchupsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  matchupsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
  },
  matchupsCount: {
    fontSize: 13,
    color: Colors.secondary,
  },
  footer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  actionButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
