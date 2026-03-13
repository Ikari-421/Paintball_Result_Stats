import { EmptyState } from "@/components/common/EmptyState";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { FieldDetailHeader } from "@/components/field/FieldDetailHeader";
import { MatchupCard } from "@/components/field/MatchupCard";
import { Colors, Spacing } from "@/constants/theme";
import { GameStatus } from "@/src/core/domain/GameStatus";
import { useCoreStore } from "@/src/presentation/state/useCoreStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

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

  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteText, setDeleteText] = useState("");

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

    // Find the first matchup that hasn't been finished yet
    const firstUnfinishedMatchup = field.matchups.find((matchup) => {
      const g = games.find((g) => g.matchup.id === matchup.id && g.fieldId === field.id);
      return !g || g.status !== GameStatus.FINISHED;
    });

    if (!firstUnfinishedMatchup) {
      Alert.alert("All Done", "All matchups on this field have been completed.");
      return;
    }

    const firstMatchup = firstUnfinishedMatchup;

    // Check if matchup has a gameMode
    if (!firstMatchup.gameModeId) {
      Alert.alert(
        "Missing game mode",
        "This matchup has no game mode assigned. Please edit the field to add one.",
      );
      return;
    }

    // Check Concurrency: Is there any game currently active on this field?
    const hasActiveGameOnField = games.some(
      (g) => g.fieldId === field.id && (g.status === GameStatus.RUNNING || g.status === GameStatus.BREAK || g.status === GameStatus.OVERTIME)
    );

    if (hasActiveGameOnField) {
      Alert.alert(
        "Field Occupied",
        "Another match is currently active on this field. Please finish or stop it before starting a new match."
      );
      return;
    }

    try {
      const existingGame = games.find(
        (g) => g.matchup.id === firstMatchup.id && g.fieldId === field.id,
      );

      let gameId: string;

      if (existingGame) {
        gameId = existingGame.id;
      } else {
        gameId = await createGame({
          fieldId: field.id,
          matchupId: firstMatchup.id,
          teamAId: firstMatchup.teamA,
          teamBId: firstMatchup.teamB,
          matchupOrder: firstMatchup.order,
          gameModeId: firstMatchup.gameModeId,
        });
        await loadGames();
      }

      // Navigate to game session
      router.push(`/game-session/${gameId}?autoStartBreak=true`);
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    }
  };

  const handleEditField = () => {
    router.push(`/field/edit-field?id=${field.id}`);
  };

  const handleDeleteField = () => {
    setDeleteText("");
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteText !== "Delete") {
      Alert.alert("Error", 'You must type "Delete" to confirm.');
      return;
    }
    try {
      await deleteField(field!.id);
      setDeleteModalVisible(false);
      router.push(`/tournament/${field!.tournamentId}` as any);
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    }
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
            const gameStatus = existingGame?.gameStateStatus || existingGame?.status || GameStatus.NOT_STARTED;
            const isTimeStopped = existingGame?.isTimeStopped === 1;

            let displayStatus: GameStatus | string = gameStatus;
            if (existingGame?.status === GameStatus.FINISHED) {
              displayStatus = GameStatus.FINISHED;
            } else if (existingGame?.status !== GameStatus.NOT_STARTED && isTimeStopped) {
              displayStatus = "TIME_STOPPED";
            }

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

                  // Check Concurrency: Is there any game currently active on this field?
                  const hasActiveGameOnField = games.some(
                    (g) => g.fieldId === field.id && (g.status === GameStatus.RUNNING || g.status === GameStatus.BREAK || g.status === GameStatus.OVERTIME)
                  );

                  // If checking a specific match, allow clicking it if it's the one currently running
                  // Otherwise, block if another match is occupying the field.
                  const isThisMatchActive = existingGame?.status === GameStatus.RUNNING || existingGame?.status === GameStatus.BREAK || existingGame?.status === GameStatus.OVERTIME;

                  if (hasActiveGameOnField && !isThisMatchActive) {
                    Alert.alert(
                      "Field Occupied",
                      "Another match is currently active on this field. Please finish or stop it before accessing another match."
                    );
                    return;
                  }

                  try {
                    const existingGame = games.find(
                      (g) =>
                        g.matchup.id === matchup.id && g.fieldId === field.id,
                    );

                    // A FINISHED match can only be viewed, not replayed
                    if (existingGame?.status === GameStatus.FINISHED) {
                      router.push(`/game-session/${existingGame.id}`);
                      return;
                    }

                    let gameId: string;

                    if (existingGame) {
                      gameId = existingGame.id;
                    } else {
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

      {/* Delete Confirmation Modal */}
      <Modal visible={isDeleteModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Field?</Text>
            <Text style={styles.modalText}>
              This will permanently delete &quot;{field.name}&quot; and all its matchups.{"\n"}
              Type &quot;Delete&quot; to confirm.
            </Text>

            <TextInput
              style={styles.modalInput}
              value={deleteText}
              onChangeText={setDeleteText}
              placeholder="Type Delete"
              autoCapitalize="none"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => { setDeleteModalVisible(false); setDeleteText(""); }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, deleteText !== "Delete" && styles.disabledButton]}
                onPress={handleConfirmDelete}
                disabled={deleteText !== "Delete"}
              >
                <Text style={styles.confirmButtonText}>Confirm Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: Spacing.xxxl,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.xl,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: Spacing.sm,
    color: Colors.text,
  },
  modalText: {
    fontSize: 14,
    color: Colors.text,
    opacity: 0.8,
    marginBottom: Spacing.lg,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: Spacing.md,
    fontSize: 16,
    marginBottom: Spacing.xl,
    color: Colors.text,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.md,
  },
  cancelButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: Colors.text,
    fontWeight: "600",
  },
  confirmButton: {
    backgroundColor: "#ff3b30",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  confirmButtonText: {
    color: Colors.white,
    fontWeight: "600",
  },
});
