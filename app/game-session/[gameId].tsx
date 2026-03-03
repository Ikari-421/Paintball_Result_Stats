import { Colors } from "@/constants/theme";
import { useArbitratorCommand } from "@/hooks/useArbitratorCommand";
import { useGameTimer } from "@/hooks/useGameTimer";
import { GameState } from "@/src/core/domain/GameState";
import { GameStatus } from "@/src/core/domain/GameStatus";
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
    stopGameTime,
    resumeGame,
    finishGame,
    scorePoint,
    adjustTime,
    adjustScore,
    loadGames,
    updateGameState,
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
  const [showMatchupModal, setShowMatchupModal] = useState(false);

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

  // Charger le GameState depuis la DB au montage
  useEffect(() => {
    if (game && game.currentRound !== undefined) {
      console.log("[GameSession] Chargement GameState depuis DB");
      const loadedState = GameState.create(
        game.gameStateStatus as GameStatus,
        game.currentRound,
        game.isTimeStopped === 1,
      );
      setGameState(loadedState);

      if (loadedState.status === GameStatus.BREAK) {
        breakTimer.syncWithDB(
          game.timer.remainingTime,
          game.timer.isRunning,
          game.timer.endTimestamp || null
        );
      } else if (loadedState.status === GameStatus.OVERTIME) {
        overtimeTimer.syncWithDB(
          game.timer.remainingTime,
          game.timer.isRunning,
          game.timer.endTimestamp || null
        );
      } else {
        gameTimer.syncWithDB(
          game.timer.remainingTime,
          game.timer.isRunning,
          game.timer.endTimestamp || null
        );
      }

      console.log(
        "[GameSession] GameState chargé:",
        loadedState.status,
        "round:",
        loadedState.currentRound,
      );
    }
  }, [game?.id]);

  // Sauvegarder le GameState à chaque changement
  useEffect(() => {
    if (game && gameState.status !== GameStatus.NOT_STARTED) {
      console.log(
        "[GameSession] Sauvegarde GameState:",
        gameState.status,
        "round:",
        gameState.currentRound,
        "time_stopped:",
        gameState.isTimeStopped,
      );
      updateGameState(gameId as string, {
        currentRound: gameState.currentRound,
        isTimeStopped: gameState.isTimeStopped,
        status: gameState.status,
      });
    }
  }, [gameState.status, gameState.currentRound, gameState.isTimeStopped]);

  useEffect(() => {
    console.log("[GameSession] Loaded games:", games.length);
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
          <Text style={styles.errorText}>Loading match...</Text>
          <Text style={styles.debugText}>Game ID: {gameId}</Text>
          <Text style={styles.debugText}>Loaded games: {games.length}</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Back</Text>
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
      Alert.alert("Error", (error as Error).message);
    }
  };

  const handleStopGameTime = async () => {
    try {
      await stopGameTime(gameId as string);
      const newState = gameState.stopTime();
      setGameState(newState);

      if (gameState.status === GameStatus.RUNNING) {
        gameTimer.stop();
      } else if (gameState.status === GameStatus.OVERTIME) {
        overtimeTimer.stop();
      }
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
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
      Alert.alert("Error", (error as Error).message);
    }
  };

  const handleScorePoint = async (team: "A" | "B") => {
    if (!gameState.isTimeStopped) {
      Alert.alert(
        "Error",
        "The match must be stopped to score a point",
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
          await handleStopGameTime();
          Alert.alert(
            "Target Score Reached!",
            `${team === "A" ? teamA?.name : teamB?.name} has reached the target score!`,
            [{ text: "OK", onPress: () => handleFinishGame() }],
          );
        }
      }
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
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
    // If no other matchups available, end round and start break directly.
    if ((field?.matchups.length || 0) <= 1) {
      handleEndRoundAction();
    } else {
      setShowMatchupModal(true);
    }
  };

  const handleEndRoundAction = () => {
    Alert.alert("End Round", "Which team won this round?", [
      { text: "Cancel", style: "cancel" },
      {
        text: teamA?.name || "Team A",
        onPress: () => {
          setScoreA((prev) => prev + 1);
          startBreak();
        },
      },
      {
        text: teamB?.name || "Team B",
        onPress: () => {
          setScoreB((prev) => prev + 1);
          startBreak();
        },
      },
      {
        text: "Draw",
        onPress: () => {
          startBreak();
        },
      },
    ]);
  };

  const handleSelectNextMatchup = async (matchupId: string) => {
    setShowMatchupModal(false);
    // Ideally here we finish current game, create new game for the next matchup and redirect to it in BREAK state.
    // For now, doing standard end round on current game as a placeholder.
    handleEndRoundAction();
  };

  const startBreak = () => {
    try {
      const newState = gameState.startBreak();
      setGameState(newState);
      gameTimer.stop();
      breakTimer.reset();
      breakTimer.start();
      setCurrentRoundScoreA(0);
      setCurrentRoundScoreB(0);
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    }
  };

  const handleEndBreak = () => {
    try {
      const newState = gameState.endBreak();
      setGameState(newState);
      breakTimer.stop();
      gameTimer.reset(gameTimeSeconds);
      gameTimer.start();
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    }
  };

  const handleStartOvertime = () => {
    try {
      const newState = gameState.startOvertime();
      setGameState(newState);
      gameTimer.stop();
      overtimeTimer.reset();
      overtimeTimer.start();
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    }
  };

  const openAdjustModal = (type: "time" | "score") => {
    if (!gameState.isTimeStopped) {
      Alert.alert(
        "Error",
        "You must stop the match time before adjusting settings.",
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
        Alert.alert("Error", "Please fill all fields");
        return;
      }

      if (adjustType === "time") {
        const seconds = parseInt(adjustValue);
        if (isNaN(seconds) || seconds < 0) {
          Alert.alert("Error", "Invalid time");
          return;
        }
        await adjustTime(gameId as string, seconds, adjustReason);
        gameTimer.reset(seconds);
      } else {
        const scores = adjustValue.split("-");
        if (scores.length !== 2) {
          Alert.alert("Error", "Invalid format. Use: ScoreA-ScoreB");
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
          Alert.alert("Error", "Invalid scores");
          return;
        }
        await adjustScore(gameId as string, newScoreA, newScoreB, adjustReason);
        setScoreA(newScoreA);
        setScoreB(newScoreB);
      }

      setShowAdjustModal(false);
      await loadGames();
      Alert.alert("Success", "Adjustment saved");
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    }
  };

  const handleFinishGame = () => {
    Alert.alert(
      "End Match",
      `Final score: ${scoreA} - ${scoreB}\nDo you want to end this match?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "End",
          style: "destructive",
          onPress: async () => {
            try {
              await finishGame(gameId as string, "MANUAL");
              const newState = gameState.finish();
              setGameState(newState);
              gameTimer.stop();
              breakTimer.stop();
              overtimeTimer.stop();

              Alert.alert(
                "Match Finished",
                "The match was saved successfully",
                [{ text: "OK", onPress: () => router.back() }],
              );
            } catch (error) {
              Alert.alert("Error", (error as Error).message);
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
          "Tie!",
          "Time is up and scores are equal. Overtime!",
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
        "End of Overtime",
        "Overtime is over!",
        [{ text: "OK", onPress: handleEndRound }],
      );
    }
  }, [overtimeTimer.isFinished]);

  const getTimerBorderColor = () => {
    if (gameState.isTimeStopped) return "#FF3B30"; // Red when time stopped
    switch (gameState.status) {
      case GameStatus.NOT_STARTED:
      case GameStatus.FINISHED:
        return "#FF3B30"; // Red
      case GameStatus.BREAK:
        return "#FF9500"; // Orange
      case GameStatus.RUNNING:
      case GameStatus.OVERTIME:
        return "#34C759"; // Green
      default:
        return "transparent";
    }
  };

  const getStatusText = () => {
    if (gameState.isTimeStopped) return "TIME_STOPPED";
    switch (gameState.status) {
      case GameStatus.NOT_STARTED:
        return "NOT STARTED";
      case GameStatus.RUNNING:
        return "RUNNING";
      case GameStatus.BREAK:
        return "TIME_STOPPED";
      case GameStatus.OVERTIME:
        return "OVERTIME";
      case GameStatus.FINISHED:
        return "FINISHED";
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
      <View style={[styles.header, { backgroundColor: Colors.primary }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.statusText}>{field?.name || "Match"}</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Score Display */}
        <View style={styles.scoreContainer}>
          <View style={styles.scoreMainRow}>
            <View style={styles.teamScore}>
              <Text style={styles.teamName}>{teamA?.name || "Team A"}</Text>
              <Text style={styles.scoreText}>{scoreA}</Text>
            </View>

            <View style={styles.centerScoreInfo}>
              <Text style={styles.vsText}>VS</Text>
            </View>

            <View style={styles.teamScore}>
              <Text style={styles.teamName}>{teamB?.name || "Team B"}</Text>
              <Text style={styles.scoreText}>{scoreB}</Text>
            </View>
          </View>
          {game?.gameMode.name && (
            <Text style={[styles.gameModeTextInline, { color: "#95cbbc" }]}>
              {game.gameMode.name}
            </Text>
          )}
        </View>

        {/* Timer Display */}
        <View style={[styles.timerContainer, { borderColor: getTimerBorderColor() }]}>
          <Text style={[styles.timerStatusText, { color: getTimerBorderColor(), marginTop: 0, marginBottom: 8 }]}>
            {getStatusText()}
          </Text>
          <Text style={styles.timerText}>{currentTimer.formattedTime}</Text>
        </View>

        {/* Game Info - removed as requested */}

        {/* Controls */}
        {gameState.status === GameStatus.NOT_STARTED && (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleStartGame}
          >
            <Text style={styles.primaryButtonText}>Start Match</Text>
          </TouchableOpacity>
        )}

        {gameState.isInProgress() && gameState.status !== GameStatus.FINISHED && (
          <>
            {/* RUNNING / OVERTIME State */}
            {!gameState.isTimeStopped && (gameState.status === GameStatus.RUNNING || gameState.status === GameStatus.OVERTIME) && (
              <View style={styles.controlRow}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleStopGameTime}
                >
                  <Text style={styles.secondaryButtonText}>Stop</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* BREAK State */}
            {!gameState.isTimeStopped && gameState.status === GameStatus.BREAK && (
              <View style={styles.controlRow}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleStopGameTime}
                >
                  <Text style={styles.secondaryButtonText}>Stop</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.warningButton}
                  onPress={() => {
                    breakTimer.setTime(5);
                  }}
                >
                  <Text style={styles.warningButtonText}>SKIP to 5sec</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* TIME_STOPPED State */}
            {gameState.isTimeStopped && (
              <>
                <View style={styles.controlRow}>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleResumeGame}
                  >
                    <Text style={styles.primaryButtonText}>Resume</Text>
                  </TouchableOpacity>
                </View>

                {/* Score Buttons (only visible in time stopped state) */}
                <View style={styles.scoreButtons}>
                  <View style={styles.teamControls}>
                    <TouchableOpacity
                      style={styles.scoreButton}
                      onPress={() => handleScorePoint("A")}
                    >
                      <Text style={styles.scoreButtonText}>+1</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.undoButton}
                      onPress={() => handleUndoPoint("A")}
                      disabled={currentRoundScoreA === 0}
                    >
                      <Text style={styles.undoButtonText}>-1</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.teamControls}>
                    <TouchableOpacity
                      style={styles.scoreButton}
                      onPress={() => handleScorePoint("B")}
                    >
                      <Text style={styles.scoreButtonText}>+1</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.undoButton}
                      onPress={() => handleUndoPoint("B")}
                      disabled={currentRoundScoreB === 0}
                    >
                      <Text style={styles.undoButtonText}>-1</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.controlRow}>
                  <TouchableOpacity
                    style={styles.warningButton}
                    onPress={handleEndRound}
                  >
                    <Text style={styles.warningButtonText}>Next Round/Matchup</Text>
                  </TouchableOpacity>
                </View>

                {/* Arbitrator Controls */}
                <View style={styles.arbitratorControls}>
                  <Text style={styles.arbitratorTitle}>Referee Controls</Text>
                  <View style={styles.controlRow}>
                    <TouchableOpacity
                      style={styles.adjustButton}
                      onPress={() => openAdjustModal("time")}
                    >
                      <Text style={styles.adjustButtonText}>
                        Adjust Time
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.adjustButton}
                      onPress={() => openAdjustModal("score")}
                    >
                      <Text style={styles.adjustButtonText}>
                        Adjust Score
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Finish Game */}
                <TouchableOpacity
                  style={styles.dangerButton}
                  onPress={handleFinishGame}
                >
                  <Text style={styles.dangerButtonText}>End Match</Text>
                </TouchableOpacity>
              </>
            )}
          </>
        )}

        {gameState.status === GameStatus.FINISHED && (
          <View style={styles.finishedContainer}>
            <Text style={styles.finishedText}>Match Finished</Text>
            <Text style={styles.finalScoreText}>
              Final Score: {scoreA} - {scoreB}
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.back()}
            >
              <Text style={styles.primaryButtonText}>GO FIELD</Text>
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
              {adjustType === "time" ? "Adjust Time" : "Adjust Score"}
            </Text>
            <Text style={styles.modalSubtitle}>
              {adjustType === "time"
                ? "Enter new time in seconds"
                : "Enter new score (format: ScoreA-ScoreB)"}
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
              placeholder="Reason for adjustment"
              value={adjustReason}
              onChangeText={setAdjustReason}
              multiline
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowAdjustModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalValidateButton}
                onPress={handleValidateAdjustment}
              >
                <Text style={styles.modalValidateText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Matchup Selection Modal */}
      <Modal
        visible={showMatchupModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMatchupModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Next Matchup</Text>
            <ScrollView style={{ maxHeight: 300, width: "100%", marginVertical: 10 }}>
              {field?.matchups.map((m) => {
                const teamAInfo = teams.find((t) => t.id === m.teamA);
                const teamBInfo = teams.find((t) => t.id === m.teamB);
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={{
                      padding: 15,
                      borderBottomWidth: 1,
                      borderBottomColor: "#eee",
                      alignItems: "center",
                    }}
                    onPress={() => handleSelectNextMatchup(m.id)}
                  >
                    <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                      {teamAInfo?.name || "Team A"} vs {teamBInfo?.name || "Team B"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity
              style={[styles.modalCancelButton, { width: "100%" }]}
              onPress={() => {
                setShowMatchupModal(false);
                handleEndRoundAction();
              }}
            >
              <Text style={styles.modalCancelText}>Cancel (Just End Round)</Text>
            </TouchableOpacity>
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
    backgroundColor: Colors.primary,
    borderRadius: 16,
    borderWidth: 2,
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
    color: Colors.white,
    marginBottom: 8,
    opacity: 0.8,
  },
  timerText: {
    fontSize: 64,
    fontWeight: "700",
    color: Colors.white,
    fontVariant: ["tabular-nums"],
  },
  timerStatusText: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8,
  },
  timeStoppedText: {
    fontSize: 16,
    color: "#FFB84D",
    marginTop: 8,
    fontWeight: "600",
  },
  scoreContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
  },
  scoreMainRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    width: "100%",
  },
  teamScore: {
    alignItems: "center",
    flex: 1,
  },
  centerScoreInfo: {
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 8,
  },
  gameModeTextInline: {
    fontSize: 14,
    color: "#2c4b5c",
    marginTop: 4,
    fontWeight: "600",
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
