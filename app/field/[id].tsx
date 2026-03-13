import { EmptyState } from "@/components/common/EmptyState";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { FieldDetailHeader } from "@/components/field/FieldDetailHeader";
import { MatchupCard } from "@/components/field/MatchupCard";
import { Colors, Spacing } from "@/constants/theme";
import { GameStatus } from "@/src/core/domain/GameStatus";
import { useCoreStore } from "@/src/presentation/state/useCoreStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function FieldDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    fields,
    teams,
    gameModes,
    games,
    createGame,
    deleteField,
    loadGames,
  } = useCoreStore();

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

  const handleStartGames = async () => {
    if (field.matchups.length === 0) return;
    const firstMatchup = field.matchups[0];

    // Check if matchup has a gameMode
    if (!firstMatchup.gameModeId) {
      Alert.alert(
        "Mode de jeu manquant",
        "Ce matchup n'a pas de mode de jeu associé. Veuillez éditer le terrain pour ajouter un mode de jeu.",
      );
      return;
    }

    try {
      console.log("[FieldDetails] Matchup:", firstMatchup.id);
      console.log("[FieldDetails] GameMode:", firstMatchup.gameModeId);

      // Vérifier si un game existe déjà pour ce matchup
      const existingGame = games.find(
        (g) => g.matchup.id === firstMatchup.id && g.fieldId === field.id,
      );

      let gameId: string;

      if (existingGame) {
        console.log("[FieldDetails] Game existant trouvé:", existingGame.id);
        gameId = existingGame.id;
      } else {
        console.log("[FieldDetails] Création d'un nouveau game");
        gameId = await createGame({
          fieldId: field.id,
          matchupId: firstMatchup.id,
          teamAId: firstMatchup.teamA,
          teamBId: firstMatchup.teamB,
          matchupOrder: firstMatchup.order,
          gameModeId: firstMatchup.gameModeId,
        });

        console.log("[FieldDetails] Game créé avec ID:", gameId);
        console.log("[FieldDetails] Rechargement des games...");
        await loadGames();
      }

      console.log("[FieldDetails] Navigation vers:", `/game-session/${gameId}`);

      // Navigate to game session
      router.push(`/game-session/${gameId}`);
    } catch (error) {
      console.error("[FieldDetails] Erreur création game:", error);
      Alert.alert("Erreur", (error as Error).message);
    }
  };

  const handleEditField = () => {
    router.push(`/field/edit-field?id=${field.id}`);
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
            router.push(`/tournament/${field.tournamentId}` as any);
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
        onBack={() => router.back()}
      />

      <ScrollView style={styles.content}>
        {field.matchups.length === 0 ? (
          <EmptyState message="No matchups scheduled" />
        ) : (
          field.matchups.map((matchup, index) => {
            const teamA = teams.find((t) => t.id === matchup.teamA);
            const teamB = teams.find((t) => t.id === matchup.teamB);
            const existingGame = games.find(
              (g) => g.matchup.id === matchup.id && g.fieldId === field.id,
            );
            const gameMode = gameModes.find((mode) => mode.id === matchup.gameModeId);
            const gameStatus = existingGame?.gameStateStatus || undefined;
            const isTimeStopped = existingGame?.isTimeStopped === 1;
            const displayStatus = existingGame?.status === GameStatus.FINISHED
              ? GameStatus.FINISHED
              : (isTimeStopped ? "TIME_STOPPED" : gameStatus);

            return (
              <MatchupCard
                key={matchup.id}
                teamAName={teamA?.name || "Team A"}
                teamBName={teamB?.name || "Team B"}
                status={displayStatus}
                scoreA={existingGame?.score?.teamAScore}
                scoreB={existingGame?.score?.teamBScore}
                gameModeName={gameMode?.name}
                onPress={async () => {
                  if (!matchup.gameModeId) {
                    Alert.alert(
                      "Mode de jeu manquant",
                      "Ce matchup n'a pas de mode de jeu associé.",
                    );
                    return;
                  }

                  try {
                    // Vérifier si un game existe déjà pour ce matchup
                    const existingGame = games.find(
                      (g) =>
                        g.matchup.id === matchup.id && g.fieldId === field.id,
                    );

                    let gameId: string;

                    if (existingGame) {
                      console.log(
                        "[MatchupCard] Game existant trouvé:",
                        existingGame.id,
                      );
                      gameId = existingGame.id;
                    } else {
                      console.log("[MatchupCard] Création d'un nouveau game");
                      gameId = await createGame({
                        fieldId: field.id,
                        matchupId: matchup.id,
                        teamAId: matchup.teamA,
                        teamBId: matchup.teamB,
                        matchupOrder: matchup.order,
                        gameModeId: matchup.gameModeId,
                      });
                      await loadGames();
                    }

                    router.push(`/game-session/${gameId}`);
                  } catch (error) {
                    Alert.alert("Erreur", (error as Error).message);
                  }
                }}
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
        />
        <TouchableOpacity style={styles.editLink} onPress={handleEditField}>
          <Text style={styles.editLinkText}>Edit Field</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteLink} onPress={handleDeleteField}>
          <Text style={styles.deleteLinkText}>Delete Field</Text>
        </TouchableOpacity>
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
  },
  editLink: {
    marginTop: Spacing.xl,
    alignItems: "center",
  },
  editLinkText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  deleteLink: {
    marginTop: Spacing.md,
    alignItems: "center",
  },
  deleteLinkText: {
    color: "#ff3b30",
    fontSize: 14,
    fontWeight: "600",
  },
});
