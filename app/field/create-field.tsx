import { OutlineButton } from "@/components/common/OutlineButton";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { ScreenHeader } from "@/components/common/ScreenHeader";
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

export default function CreateFieldScreen() {
  const router = useRouter();
  const { teams, loadTeams, createField, addMatchupToField, error } =
    useCoreStore();
  const { tournamentId } = useLocalSearchParams<{ tournamentId: string }>();
  const {
    tempMatchups,
    removeTempMatchup,
    reorderTempMatchups,
    clearTempMatchups,
  } = useMatchupCreation();
  const [name, setName] = useState("");

  useEffect(() => {
    loadTeams();
    clearTempMatchups();
  }, []);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Field name is required");
      return;
    }
    if (!tournamentId) {
      Alert.alert("Error", "Missing tournament context");
      return;
    }

    try {
      console.log("[CreateField] Début création field:", name.trim());
      console.log("[CreateField] Nombre de matchups:", tempMatchups.length);

      // Créer le field et récupérer son ID
      const fieldId = await createField(name.trim(), tournamentId);
      console.log("[CreateField] Field créé avec ID:", fieldId);

      // Ajouter les matchups au field créé
      if (tempMatchups.length > 0) {
        for (const matchup of tempMatchups) {
          console.log(
            "[CreateField] Ajout matchup:",
            matchup.id,
            "avec gameModeId:",
            matchup.gameModeId,
          );
          await addMatchupToField(
            fieldId,
            matchup.teamA,
            matchup.teamB,
            matchup.gameModeId,
          );
        }
        console.log("[CreateField] Tous les matchups ajoutés");
      }

      clearTempMatchups();
      console.log("[CreateField] Navigation vers tournoi");
      router.push(`/tournament/${tournamentId}` as any);
    } catch (err) {
      console.error("[CreateField] Erreur:", err);
      Alert.alert("Error", error || "Unable to create field");
    }
  };

  const handleAddMatchup = () => {
    router.push("/field/matchup/create-matchup?returnTo=/field/create-field");
  };

  const handleDeleteMatchup = (matchupId: string) => {
    removeTempMatchup(matchupId);
  };

  const handleMoveUp = (matchupId: string) => {
    const index = tempMatchups.findIndex((m) => m.id === matchupId);
    if (index > 0) {
      const newMatchups = [...tempMatchups];
      [newMatchups[index - 1], newMatchups[index]] = [
        newMatchups[index],
        newMatchups[index - 1],
      ];
      reorderTempMatchups(newMatchups);
    }
  };

  const handleMoveDown = (matchupId: string) => {
    const index = tempMatchups.findIndex((m) => m.id === matchupId);
    if (index < tempMatchups.length - 1) {
      const newMatchups = [...tempMatchups];
      [newMatchups[index], newMatchups[index + 1]] = [
        newMatchups[index + 1],
        newMatchups[index],
      ];
      reorderTempMatchups(newMatchups);
    }
  };


  const handleBack = () => {
    clearTempMatchups();
    router.back();
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Create Field" onBack={handleBack} />

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
            {tempMatchups.length} Scheduled
          </Text>
        </View>

        <MatchupList
          matchups={tempMatchups}
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
        </View>
        <PrimaryButton
          title="Create Field"
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
