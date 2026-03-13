import { OutlineButton } from "@/components/common/OutlineButton";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { ScreenHeader } from "@/components/common/ScreenHeader";
import { MatchupList } from "@/components/field/MatchupList";
import { FieldNameModal } from "@/components/field/modals/FieldNameModal";
import { Colors, Spacing } from "@/constants/theme";
import { useMatchupCreation } from "@/contexts/MatchupCreationContext";
import { useCoreStore } from "@/src/presentation/state/useCoreStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

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
  const [isNameModalVisible, setIsNameModalVisible] = useState(true); // Open natively on creation

  useEffect(() => {
    loadTeams();
    clearTempMatchups();
  }, [clearTempMatchups, loadTeams]);

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

  const handleDragEnd = (newOrder: any[]) => {
    reorderTempMatchups(newOrder);
  };

  const handleBack = () => {
    clearTempMatchups();
    router.back();
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <FieldNameModal
        visible={isNameModalVisible}
        initialName={name}
        onSave={(newName) => {
          setName(newName);
          setIsNameModalVisible(false);
        }}
        onClose={() => setIsNameModalVisible(false)}
      />
      <ScreenHeader title="Create Field" onBack={handleBack} />

      <View style={styles.content}>
        <MatchupList
          matchups={tempMatchups}
          teams={teams}
          onDelete={handleDeleteMatchup}
          onDragEnd={handleDragEnd}
          ListHeaderComponent={
            <>
              <View style={styles.titleContainer}>
                <Text style={styles.fieldTitle}>
                  {name || "Unnamed Field"}
                </Text>
                <TouchableOpacity onPress={() => setIsNameModalVisible(true)}>
                  <Text style={styles.editNameLink}>Edit Field Name</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.matchupsHeader}>
                <Text style={styles.matchupsTitle}>MatchUps</Text>
                <Text style={styles.matchupsCount}>
                  {tempMatchups.length} Scheduled
                </Text>
              </View>
            </>
          }
        />
      </View>

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
    </GestureHandlerRootView>
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
  titleContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  fieldTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  editNameLink: {
    fontSize: 14,
    color: Colors.secondary,
    textDecorationLine: "underline",
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
    paddingBottom: Spacing.xxxl,
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
