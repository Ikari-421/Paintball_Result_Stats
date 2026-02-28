import { OutlineButton } from "@/components/common/OutlineButton";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { SecondaryButton } from "@/components/common/SecondaryButton";
import { MatchupList } from "@/components/field/MatchupList";
import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { useMatchupCreation } from "@/contexts/MatchupCreationContext";
import { useCoreStore } from "@/src/presentation/state/useCoreStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

// Removed MatchupWithDetails - using field.matchups directly

export default function EditFieldScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
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
  const { tempMatchups, clearTempMatchups, addTempMatchup } =
    useMatchupCreation();

  const [name, setName] = useState("");

  const field = fields.find((f) => f.id === id);

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    if (field) {
      setName(field.name);
    }
  }, [field]);

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

  const handleAddMatchup = async () => {
    if (!field) return;

    router.push(
      `/field/matchup/create-matchup?returnTo=/field/edit-field&fieldId=${id}`,
    );
  };

  useEffect(() => {
    const addTempMatchups = async () => {
      if (field && tempMatchups.length > 0) {
        for (const matchup of tempMatchups) {
          await addMatchupToField(
            field.id,
            matchup.teamA,
            matchup.teamB,
            matchup.gameModeId,
          );
        }
        // Clear tempMatchups after adding to avoid duplicates
        clearTempMatchups();
      }
    };
    addTempMatchups();
  }, [tempMatchups]);

  const handleDeleteMatchup = async (matchupId: string) => {
    if (!field) return;

    try {
      await removeMatchupFromField(field.id, matchupId);
    } catch (err) {
      Alert.alert("Error", "Unable to delete matchup");
    }
  };

  const handleMoveUp = (matchupId: string) => {
    if (!field) return;
    const index = field.matchups.findIndex((m) => m.id === matchupId);
    if (index > 0) {
      // TODO: Implémenter la réorganisation avec persistance
      Alert.alert(
        "Info",
        "La réorganisation des matchups sera implémentée prochainement",
      );
    }
  };

  const handleMoveDown = (matchupId: string) => {
    if (!field) return;
    const index = field.matchups.findIndex((m) => m.id === matchupId);
    if (index < field.matchups.length - 1) {
      // TODO: Implémenter la réorganisation avec persistance
      Alert.alert(
        "Info",
        "La réorganisation des matchups sera implémentée prochainement",
      );
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
          <Text style={styles.matchupsCount}>
            {field.matchups.length} Scheduled
          </Text>
        </View>

        <MatchupList
          matchups={field.matchups}
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
