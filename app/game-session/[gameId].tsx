import { useArbitratorCommand } from "@/hooks/useArbitratorCommand";
import { useGameTimer } from "@/hooks/useGameTimer";
import { GameState, GameStatus } from "@/src/core/domain/GameState";
import { useCoreStore } from "@/src/presentation/state/useCoreStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function MatchScreen() {
  const router = useRouter();
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const {
    games,
    teams,
    fields,
    startGame,
    pauseGame,
    resumeGame,
    finishGame,
    scorePoint,
    adjustTime,
    adjustScore,
    loadGames,
  } = useCoreStore();

  const game = games.find((g) => g.id === gameId);
  const teamA = teams.find((t) => t.id === game?.matchup.teamA);
  const teamB = teams.find((t) => t.id === game?.matchup.teamB);
  const field = fields.find((f) => f.id === game?.fieldId);

  const [gameState, setGameState] = useState(GameState.create());
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [currentRoundScoreA, setCurrentRoundScoreA] = useState(0);
  const [currentRoundScoreB, setCurrentRoundScoreB] = useState(0);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustType, setAdjustType] = useState<"time" | "score">("time");
  const [adjustValue, setAdjustValue] = useState("");
  const [adjustReason, setAdjustReason] = useState("");

  const commandHandler = useArbitratorCommand();

  // Initialize timer with game mode duration
  const gameTimeSeconds = game?.gameMode.gameTime?.minutes
    ? game.gameMode.gameTime.minutes * 60
    : 600;
  const breakTimeSeconds = game?.gameMode.breakTime?.seconds || 30;
  const overtimeSeconds = game?.gameMode.overTime?.minutes
    ? game.gameMode.overTime.minutes * 60
    : 300;

  const gameTimer = useGameTimer(gameTimeSeconds);
  const breakTimer = useGameTimer(breakTimeSeconds);
  const overtimeTimer = useGameTimer(overtimeSeconds);

  // Charger les games au montage
  useEffect(() => {
    console.log("[GameSession] Montage - gameId:", gameId);
    loadGames();
  }, []);

  useEffect(() => {
    console.log("[GameSession] Games chargés:", games.length);
    console.log("[GameSession] Game trouvé:", game ? game.id : "NON TROUVÉ");
    if (game) {
      console.log("[GameSession] Game status:", game.status);
      console.log(
        "[GameSession] Teams:",
        game.matchup.teamA,
        game.matchup.teamB,
      );
    }
  }, [games, gameId]);

  if (!game) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Chargement du match...</Text>
          <Text style={styles.debugText}>Game ID: {gameId}</Text>
          <Text style={styles.debugText}>Games chargés: {games.length}</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleStartGame = async () => {
    try {
      await startGame(gameId as string);
      const newState = gameState.start();
      setGameState(newState);
      gameTimer.start();
    } catch (error) {
      Alert.alert("Erreur", (error as Error).message);
    }
  };

  const handlePauseGame = async () => {
    try {
      await pauseGame(gameId as string);
      const newState = gameState.pause();
      setGameState(newState);

      if (gameState.status === GameStatus.RUNNING) {
        gameTimer.pause();
      } else if (gameState.status === GameStatus.OVERTIME) {
        overtimeTimer.pause();
      }
    } catch (error) {
      Alert.alert("Erreur", (error as Error).message);
    }
  };

  const handleResumeGame = async () => {
    try {
      await resumeGame(gameId as string);
      const newState = gameState.resume();
      setGameState(newState);

      if (gameState.status === GameStatus.RUNNING) {
        gameTimer.resume();
      } else if (gameState.status === GameStatus.OVERTIME) {
        overtimeTimer.resume();
      }
    } catch (error) {
      Alert.alert("Erreur", (error as Error).message);
    }
  };

  const handleScorePoint = async (team: "A" | "B") => {
    if (!gameState.isRunning()) {
      Alert.alert(
        "Erreur",
        "Le match doit être en cours pour marquer un point",
      );
      return;
    }

    try {
      const teamId = team === "A" ? game?.matchup.teamA : game?.matchup.teamB;
      if (teamId) {
        await scorePoint(gameId as string, teamId);
        await loadGames();

        if (team === "A") {
          setScoreA((prev) => prev + 1);
          setCurrentRoundScoreA((prev) => prev + 1);
        } else {
          setScoreB((prev) => prev + 1);
          setCurrentRoundScoreB((prev) => prev + 1);
        }

        // Check if race to limit reached
        const newScoreA = team === "A" ? scoreA + 1 : scoreA;
        const newScoreB = team === "B" ? scoreB + 1 : scoreB;
        if (
          game &&
          (newScoreA >= game.gameMode.raceTo.value ||
            newScoreB >= game.gameMode.raceTo.value)
        ) {
          await handlePauseGame();
          Alert.alert(
            "Score Limite Atteint!",
            `${team === "A" ? teamA?.name : teamB?.name} a atteint le score limite!`,
            [{ text: "OK", onPress: () => handleFinishGame() }],
          );
        }
      }
    } catch (error) {
      Alert.alert("Erreur", (error as Error).message);
    }
  };

  const handleUndoPoint = (team: "A" | "B") => {
    if (team === "A" && currentRoundScoreA > 0) {
      setCurrentRoundScoreA((prev) => prev - 1);
    } else if (team === "B" && currentRoundScoreB > 0) {
      setCurrentRoundScoreB((prev) => prev - 1);
    }
  };

  const handleEndRound = () => {
    Alert.alert("Fin du Round", "Quelle équipe a gagné ce round ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Équipe A",
        onPress: () => {
          setScoreA((prev) => prev + 1);
          startBreak();
        },
      },
      {
        text: "Équipe B",
        onPress: () => {
          setScoreB((prev) => prev + 1);
          startBreak();
        },
      },
    ]);
  };

  const startBreak = () => {
    try {
      const newState = gameState.startBreak();
      setGameState(newState);
      gameTimer.pause();
      breakTimer.reset();
      breakTimer.start();
      setCurrentRoundScoreA(0);
      setCurrentRoundScoreB(0);
    } catch (error) {
      Alert.alert("Erreur", (error as Error).message);
    }
  };

  const handleEndBreak = () => {
    try {
      const newState = gameState.endBreak();
      setGameState(newState);
      breakTimer.pause();
      gameTimer.reset(gameTimeSeconds);
      gameTimer.start();
    } catch (error) {
      Alert.alert("Erreur", (error as Error).message);
    }
  };

  const handleStartOvertime = () => {
    try {
      const newState = gameState.startOvertime();
      setGameState(newState);
      gameTimer.pause();
      overtimeTimer.reset();
      overtimeTimer.start();
    } catch (error) {
      Alert.alert("Erreur", (error as Error).message);
    }
  };

  const openAdjustModal = (type: "time" | "score") => {
    if (gameState.status === GameStatus.RUNNING) {
      Alert.alert(
        "Erreur",
        "Vous devez mettre le match en pause avant d'ajuster les paramètres.",
      );
      return;
    }
    setAdjustType(type);
    setAdjustValue("");
    setAdjustReason("");
    setShowAdjustModal(true);
  };

  const handleValidateAdjustment = async () => {
    try {
      if (!adjustValue || !adjustReason) {
        Alert.alert("Erreur", "Veuillez remplir tous les champs");
        return;
      }

      if (adjustType === "time") {
        const seconds = parseInt(adjustValue);
        if (isNaN(seconds) || seconds < 0) {
          Alert.alert("Erreur", "Temps invalide");
          return;
        }
        await adjustTime(gameId as string, seconds, adjustReason);
        gameTimer.reset(seconds);
      } else {
        const scores = adjustValue.split("-");
        if (scores.length !== 2) {
          Alert.alert("Erreur", "Format invalide. Utilisez: ScoreA-ScoreB");
          return;
        }
        const newScoreA = parseInt(scores[0]);
        const newScoreB = parseInt(scores[1]);
        if (
          isNaN(newScoreA) ||
          isNaN(newScoreB) ||
          newScoreA < 0 ||
          newScoreB < 0
        ) {
          Alert.alert("Erreur", "Scores invalides");
          return;
        }
        await adjustScore(gameId as string, newScoreA, newScoreB, adjustReason);
        setScoreA(newScoreA);
        setScoreB(newScoreB);
      }

      setShowAdjustModal(false);
      await loadGames();
      Alert.alert("Succès", "Ajustement enregistré");
    } catch (error) {
      Alert.alert("Erreur", (error as Error).message);
    }
  };

  const handleFinishGame = () => {
    Alert.alert(
      "Terminer le Match",
      `Score final: ${scoreA} - ${scoreB}\nVoulez-vous terminer ce match ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Terminer",
          style: "destructive",
          onPress: async () => {
            try {
              await finishGame(gameId as string, "MANUAL");
              const newState = gameState.finish();
              setGameState(newState);
              gameTimer.pause();
              breakTimer.pause();
              overtimeTimer.pause();

              Alert.alert(
                "Match Terminé",
                "Le match a été enregistré avec succès",
                [{ text: "OK", onPress: () => router.back() }],
              );
            } catch (error) {
              Alert.alert("Erreur", (error as Error).message);
            }
          },
        },
      ],
    );
  };

  // Auto-detect when game timer ends
  useEffect(() => {
    if (gameTimer.isFinished && gameState.status === GameStatus.RUNNING) {
      // Check for tie and trigger overtime
      if (scoreA === scoreB && game?.gameMode.overTime) {
        Alert.alert(
          "Égalité!",
          "Le temps est écoulé et les scores sont égaux. Prolongation!",
          [{ text: "OK", onPress: handleStartOvertime }],
        );
      } else {
        handleEndRound();
      }
    }
  }, [gameTimer.isFinished, scoreA, scoreB]);

  // Auto-detect when break timer ends
  useEffect(() => {
    if (breakTimer.isFinished && gameState.status === GameStatus.BREAK) {
      handleEndBreak();
    }
  }, [breakTimer.isFinished]);

  // Auto-detect when overtime ends
  useEffect(() => {
    if (overtimeTimer.isFinished && gameState.status === GameStatus.OVERTIME) {
      Alert.alert(
        "Fin de la Prolongation",
        "Le temps de prolongation est écoulé!",
        [{ text: "OK", onPress: handleEndRound }],
      );
    }
  }, [overtimeTimer.isFinished]);

  const getStatusColor = () => {
    switch (gameState.status) {
      case GameStatus.NOT_STARTED:
        return "#95cbbc";
      case GameStatus.RUNNING:
        return "#5FC2BA";
      case GameStatus.BREAK:
        return "#FFB84D";
      case GameStatus.OVERTIME:
        return "#FF6B6B";
      case GameStatus.FINISHED:
        return "#2c4b5c";
      default:
        return "#95cbbc";
    }
  };

  const getStatusText = () => {
    if (gameState.isPaused) return "PAUSE";
    switch (gameState.status) {
      case GameStatus.NOT_STARTED:
        return "NON DÉMARRÉ";
      case GameStatus.RUNNING:
        return `ROUND ${gameState.currentRound}`;
      case GameStatus.BREAK:
        return "PAUSE";
      case GameStatus.OVERTIME:
        return "PROLONGATION";
      case GameStatus.FINISHED:
        return "TERMINÉ";
      default:
        return "";
    }
  };

  const getCurrentTimer = () => {
    if (gameState.status === GameStatus.BREAK) return breakTimer;
    if (gameState.status === GameStatus.OVERTIME) return overtimeTimer;
    return gameTimer;
  };

  const currentTimer = getCurrentTimer();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: getStatusColor() }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.statusText}>{getStatusText()}</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Timer Display */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerLabel}>
            {gameState.status === GameStatus.BREAK
              ? "Temps de pause"
              : "Temps de jeu"}
          </Text>
          <Text style={styles.timerText}>{currentTimer.formattedTime}</Text>
          {gameState.isPaused && (
            <Text style={styles.pausedText}>⏸ EN PAUSE</Text>
          )}
        </View>

        {/* Score Display */}
        <View style={styles.scoreContainer}>
          <View style={styles.teamScore}>
            <Text style={styles.teamName}>{teamA?.name || "Équipe A"}</Text>
            <Text style={styles.scoreText}>{scoreA}</Text>
            <Text style={styles.roundScoreText}>
              Round: {currentRoundScoreA}
            </Text>
          </View>

          <Text style={styles.vsText}>VS</Text>

          <View style={styles.teamScore}>
            <Text style={styles.teamName}>{teamB?.name || "Équipe B"}</Text>
            <Text style={styles.scoreText}>{scoreB}</Text>
            <Text style={styles.roundScoreText}>
              Round: {currentRoundScoreB}
            </Text>
          </View>
        </View>

        {/* Game Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>Mode: {game.gameMode.name}</Text>
          <Text style={styles.infoText}>
            Race to: {game.gameMode.raceTo.value}
          </Text>
          <Text style={styles.infoText}>Terrain: {field?.name || "N/A"}</Text>
        </View>

        {/* Controls */}
        {gameState.status === GameStatus.NOT_STARTED && (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleStartGame}
          >
            <Text style={styles.primaryButtonText}>▶ Démarrer le Match</Text>
          </TouchableOpacity>
        )}

        {gameState.isInProgress() &&
          gameState.status !== GameStatus.FINISHED && (
            <>
              {/* Pause/Resume */}
              <View style={styles.controlRow}>
                {!gameState.isPaused ? (
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={handlePauseGame}
                  >
                    <Text style={styles.secondaryButtonText}>⏸ Pause</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={handleResumeGame}
                  >
                    <Text style={styles.secondaryButtonText}>▶ Reprendre</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Score Buttons */}
              {(gameState.status === GameStatus.RUNNING ||
                gameState.status === GameStatus.OVERTIME) && (
                <View style={styles.scoreButtons}>
                  <View style={styles.teamControls}>
                    <TouchableOpacity
                      style={styles.scoreButton}
                      onPress={() => handleScorePoint("A")}
                      disabled={gameState.isPaused}
                    >
                      <Text style={styles.scoreButtonText}>+1</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.undoButton}
                      onPress={() => handleUndoPoint("A")}
                      disabled={gameState.isPaused || currentRoundScoreA === 0}
                    >
                      <Text style={styles.undoButtonText}>↶ Annuler</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.teamControls}>
                    <TouchableOpacity
                      style={styles.scoreButton}
                      onPress={() => handleScorePoint("B")}
                      disabled={gameState.isPaused}
                    >
                      <Text style={styles.scoreButtonText}>+1</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.undoButton}
                      onPress={() => handleUndoPoint("B")}
                      disabled={gameState.isPaused || currentRoundScoreB === 0}
                    >
                      <Text style={styles.undoButtonText}>↶ Annuler</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Round/Break Controls */}
              {gameState.status === GameStatus.RUNNING && (
                <View style={styles.controlRow}>
                  <TouchableOpacity
                    style={styles.warningButton}
                    onPress={handleEndRound}
                  >
                    <Text style={styles.warningButtonText}>Fin du Round</Text>
                  </TouchableOpacity>
                  {game.gameMode.overTime && (
                    <TouchableOpacity
                      style={styles.warningButton}
                      onPress={handleStartOvertime}
                    >
                      <Text style={styles.warningButtonText}>Prolongation</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {gameState.status === GameStatus.BREAK && (
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleEndBreak}
                >
                  <Text style={styles.primaryButtonText}>
                    Reprendre le Match
                  </Text>
                </TouchableOpacity>
              )}

              {/* Arbitrator Controls */}
              {gameState.isPaused && (
                <View style={styles.arbitratorControls}>
                  <Text style={styles.arbitratorTitle}>Contrôles Arbitre</Text>
                  <View style={styles.controlRow}>
                    <TouchableOpacity
                      style={styles.adjustButton}
                      onPress={() => openAdjustModal("time")}
                    >
                      <Text style={styles.adjustButtonText}>
                        ⏱ Ajuster Temps
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.adjustButton}
                      onPress={() => openAdjustModal("score")}
                    >
                      <Text style={styles.adjustButtonText}>
                        🎯 Ajuster Score
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Finish Game */}
              <TouchableOpacity
                style={styles.dangerButton}
                onPress={handleFinishGame}
              >
                <Text style={styles.dangerButtonText}>⏹ Terminer le Match</Text>
              </TouchableOpacity>
            </>
          )}

        {gameState.status === GameStatus.FINISHED && (
          <View style={styles.finishedContainer}>
            <Text style={styles.finishedText}>🏆 Match Terminé</Text>
            <Text style={styles.finalScoreText}>
              Score Final: {scoreA} - {scoreB}
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.back()}
            >
              <Text style={styles.primaryButtonText}>Retour</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Adjust Modal */}
      <Modal
        visible={showAdjustModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAdjustModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {adjustType === "time" ? "Ajuster le Temps" : "Ajuster le Score"}
            </Text>
            <Text style={styles.modalSubtitle}>
              {adjustType === "time"
                ? "Entrez le nouveau temps en secondes"
                : "Entrez le nouveau score (format: ScoreA-ScoreB)"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder={adjustType === "time" ? "Ex: 300" : "Ex: 5-3"}
              value={adjustValue}
              onChangeText={setAdjustValue}
              keyboardType={adjustType === "time" ? "numeric" : "default"}
            />

            <TextInput
              style={styles.input}
              placeholder="Raison de l'ajustement"
              value={adjustReason}
              onChangeText={setAdjustReason}
              multiline
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowAdjustModal(false)}
              >
                <Text style={styles.modalCancelText}>✗ Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalValidateButton}
                onPress={handleValidateAdjustment}
              >
                <Text style={styles.modalValidateText}>✓ Valider</Text>
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
    backgroundColor: "#EBF2FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    color: "#fff",
    fontSize: 16,
  },
  statusText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  timerContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timerLabel: {
    fontSize: 14,
    color: "#2c4b5c",
    marginBottom: 8,
  },
  timerText: {
    fontSize: 64,
    fontWeight: "700",
    color: "#152b42",
    fontVariant: ["tabular-nums"],
  },
  pausedText: {
    fontSize: 16,
    color: "#FFB84D",
    marginTop: 8,
    fontWeight: "600",
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teamScore: {
    alignItems: "center",
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c4b5c",
    marginBottom: 8,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: "700",
    color: "#152b42",
  },
  roundScoreText: {
    fontSize: 14,
    color: "#95cbbc",
    marginTop: 4,
  },
  vsText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#95cbbc",
    marginHorizontal: 16,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: "#2c4b5c",
    marginBottom: 4,
  },
  controlRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: "#5FC2BA",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#2c4b5c",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  scoreButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  teamControls: {
    flex: 1,
    gap: 8,
  },
  scoreButton: {
    backgroundColor: "#5FC2BA",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  scoreButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },
  undoButton: {
    backgroundColor: "#95cbbc",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  undoButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  warningButton: {
    flex: 1,
    backgroundColor: "#FFB84D",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  warningButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  dangerButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 12,
  },
  dangerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  finishedContainer: {
    alignItems: "center",
    padding: 32,
  },
  finishedText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#152b42",
    marginBottom: 16,
  },
  finalScoreText: {
    fontSize: 24,
    color: "#2c4b5c",
    marginBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: "#2c4b5c",
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "600",
  },
  debugText: {
    fontSize: 14,
    color: "#95cbbc",
    textAlign: "center",
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#2c4b5c",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  arbitratorControls: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  arbitratorTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2c4b5c",
    marginBottom: 12,
    textAlign: "center",
  },
  adjustButton: {
    flex: 1,
    backgroundColor: "#95cbbc",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  adjustButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#152b42",
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#2c4b5c",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#EBF2FA",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#95cbbc",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: "#FF6B6B",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  modalCancelText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalValidateButton: {
    flex: 1,
    backgroundColor: "#5FC2BA",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  modalValidateText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
