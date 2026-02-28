import { useCoreStore } from "@/src/presentation/state/useCoreStore";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function StartMatchScreen() {
  const router = useRouter();
  const { fields, gameModes, teams, createGame } = useCoreStore();

  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [selectedMatchupId, setSelectedMatchupId] = useState<string | null>(
    null,
  );
  const [selectedGameModeId, setSelectedGameModeId] = useState<string | null>(
    null,
  );

  const selectedField = fields.find((f) => f.id === selectedFieldId);
  const selectedMatchup = selectedField?.matchups.find(
    (m) => m.id === selectedMatchupId,
  );
  const selectedGameMode = gameModes.find((gm) => gm.id === selectedGameModeId);

  const teamA = teams.find((t) => t.id === selectedMatchup?.teamA);
  const teamB = teams.find((t) => t.id === selectedMatchup?.teamB);

  const canStart = selectedFieldId && selectedMatchupId && selectedGameModeId;

  const handleStartMatch = async () => {
    if (!canStart || !selectedMatchup) {
      Alert.alert(
        "Erreur",
        "Veuillez sélectionner un terrain, un matchup et un mode de jeu",
      );
      return;
    }

    try {
      await createGame({
        fieldId: selectedFieldId!,
        matchupId: selectedMatchupId!,
        teamAId: selectedMatchup.teamA,
        teamBId: selectedMatchup.teamB,
        matchupOrder: selectedMatchup.order,
        gameModeId: selectedGameModeId!,
      });

      // Navigate to the match screen
      // Note: We need to get the created game ID - for now we'll just go back
      Alert.alert("Succès", "Match créé avec succès", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Erreur", (error as Error).message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Nouveau Match</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Field Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Sélectionner un Terrain</Text>
          {fields.length === 0 ? (
            <Text style={styles.emptyText}>Aucun terrain disponible</Text>
          ) : (
            fields.map((field) => (
              <TouchableOpacity
                key={field.id}
                style={[
                  styles.card,
                  selectedFieldId === field.id && styles.cardSelected,
                ]}
                onPress={() => {
                  setSelectedFieldId(field.id);
                  setSelectedMatchupId(null); // Reset matchup when field changes
                }}
              >
                <Text style={styles.cardTitle}>{field.name}</Text>
                <Text style={styles.cardSubtitle}>
                  {field.matchups.length} confrontation
                  {field.matchups.length > 1 ? "s" : ""}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Matchup Selection */}
        {selectedField && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              2. Sélectionner une Confrontation
            </Text>
            {selectedField.matchups.length === 0 ? (
              <Text style={styles.emptyText}>
                Aucune confrontation sur ce terrain
              </Text>
            ) : (
              selectedField.matchups.map((matchup) => {
                const teamAName =
                  teams.find((t) => t.id === matchup.teamA)?.name || "Équipe A";
                const teamBName =
                  teams.find((t) => t.id === matchup.teamB)?.name || "Équipe B";

                return (
                  <TouchableOpacity
                    key={matchup.id}
                    style={[
                      styles.card,
                      selectedMatchupId === matchup.id && styles.cardSelected,
                    ]}
                    onPress={() => setSelectedMatchupId(matchup.id)}
                  >
                    <Text style={styles.cardTitle}>
                      {teamAName} vs {teamBName}
                    </Text>
                    <Text style={styles.cardSubtitle}>
                      Match #{matchup.order + 1}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {/* Game Mode Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            3. Sélectionner un Mode de Jeu
          </Text>
          {gameModes.length === 0 ? (
            <Text style={styles.emptyText}>Aucun mode de jeu disponible</Text>
          ) : (
            gameModes.map((mode) => (
              <TouchableOpacity
                key={mode.id}
                style={[
                  styles.card,
                  selectedGameModeId === mode.id && styles.cardSelected,
                ]}
                onPress={() => setSelectedGameModeId(mode.id)}
              >
                <Text style={styles.cardTitle}>{mode.name}</Text>
                <View style={styles.modeDetails}>
                  <Text style={styles.modeDetail}>
                    ⏱️ {mode.gameTime.minutes} min
                  </Text>
                  <Text style={styles.modeDetail}>
                    🎯 Race to {mode.raceTo.value}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Summary */}
        {canStart && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Récapitulatif</Text>
            <Text style={styles.summaryText}>
              Terrain: {selectedField?.name}
            </Text>
            <Text style={styles.summaryText}>
              Match: {teamA?.name} vs {teamB?.name}
            </Text>
            <Text style={styles.summaryText}>
              Mode: {selectedGameMode?.name}
            </Text>
          </View>
        )}

        {/* Start Button */}
        <TouchableOpacity
          style={[styles.startButton, !canStart && styles.startButtonDisabled]}
          onPress={handleStartMatch}
          disabled={!canStart}
        >
          <Text style={styles.startButtonText}>
            {canStart
              ? "▶ Démarrer le Match"
              : "Sélectionnez toutes les options"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EBF2FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#2c4b5c",
  },
  backButton: {
    padding: 8,
  },
  backText: {
    color: "#fff",
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#152b42",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardSelected: {
    borderColor: "#5FC2BA",
    backgroundColor: "#F0FFFE",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#152b42",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#2c4b5c",
  },
  modeDetails: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  modeDetail: {
    fontSize: 14,
    color: "#2c4b5c",
  },
  emptyText: {
    fontSize: 14,
    color: "#95cbbc",
    fontStyle: "italic",
    textAlign: "center",
    padding: 16,
  },
  summaryCard: {
    backgroundColor: "#5FC2BA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 4,
  },
  startButton: {
    backgroundColor: "#2c4b5c",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  startButtonDisabled: {
    backgroundColor: "#95cbbc",
    opacity: 0.5,
  },
  startButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
