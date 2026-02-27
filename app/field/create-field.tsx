import { OutlineButton } from "@/components/common/OutlineButton";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { SecondaryButton } from "@/components/common/SecondaryButton";
import { MatchupList } from "@/components/field/MatchupList";
import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { useMatchupCreation } from "@/contexts/MatchupCreationContext";
import { useCoreStore } from "@/src/presentation/state/useCoreStore";
import { useRouter } from "expo-router";
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
  const {
    teams,
    fields,
    loadTeams,
    loadFields,
    createField,
    addMatchupToField,
    error,
  } = useCoreStore();
  const { tempMatchups, removeTempMatchup, clearTempMatchups } =
    useMatchupCreation();
  const [name, setName] = useState("");

  useEffect(() => {
    loadTeams();
  }, []);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Field name is required");
      return;
    }

    try {
      const fieldId = `field-${Date.now()}`;
      await createField(name.trim());

      // Recharger les fields pour obtenir le field créé
      await loadFields();

      // Ajouter les matchups au field créé
      const createdField = fields.find((f) => f.name === name.trim());
      if (createdField && tempMatchups.length > 0) {
        for (const matchup of tempMatchups) {
          await addMatchupToField(
            createdField.id,
            matchup.teamA,
            matchup.teamB,
          );
        }
      }

      clearTempMatchups();
      router.push("/field/fields-list");
    } catch (err) {
      Alert.alert("Error", error || "Unable to create field");
    }
  };

  const handleAddMatchup = () => {
    router.push("/field/matchup/create-matchup?returnTo=/field/create-field");
  };

  const handleDeleteMatchup = (matchupId: string) => {
    removeTempMatchup(matchupId);
  };

  const handleModSetup = () => {
    router.push("/gamemode/game-modes-list");
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Create Field" onBack={() => router.push("/menu")} />

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
