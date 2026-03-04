import { RefereeControls } from "@/components/game-session/RefereeControls";
import { ScoreBoard } from "@/components/game-session/ScoreBoard";
import { TimerDisplay } from "@/components/game-session/TimerDisplay";
import { AdjustModal } from "@/components/game-session/modals/AdjustModal";
import { ScoreValidationModal } from "@/components/game-session/modals/ScoreValidationModal";
import { Colors } from "@/constants/theme";
import { useGameStateMachine } from "@/hooks/useGameStateMachine";
import { GameStatus } from "@/src/core/domain/GameStatus";
import { useCoreStore } from "@/src/presentation/state/useCoreStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function MatchScreen() {
  const router = useRouter();
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const {
    games,
    teams,
    fields,
    loadGames,
    startGame,
    stopGameTime,
    resumeGame,
    finishGame,
    startBreak,
    endBreak,
    scorePoint,
    adjustTime,
    adjustScore,
    startOvertime,
  } = useCoreStore();

  const game = games.find((g) => g.id === gameId);
  const teamA = teams.find((t) => t.id === game?.matchup.teamA);
  const teamB = teams.find((t) => t.id === game?.matchup.teamB);
  const field = fields.find((f) => f.id === game?.fieldId);

  // Use our new State Machine Hook! No more local duplicate state!
  const { view: fsmView, activeTimer, controllers } = useGameStateMachine(game);

  // Local state purely for Modals and temporary referee overrides
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);

  // Modals Visibility
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showScoreValidationModal, setShowScoreValidationModal] = useState(false);

  // 1. Initial Load
  useEffect(() => {
    loadGames();
  }, []);

  // 2. Sync Modals local state with DB Score when not actively editing
  useEffect(() => {
    if (game && !showScoreValidationModal) {
      setScoreA(game.score.teamAScore);
      setScoreB(game.score.teamBScore);
    }
  }, [game?.score.teamAScore, game?.score.teamBScore, showScoreValidationModal]);

  // 3. Auto-resume when Break timer finishes
  useEffect(() => {
    if (game?.status === GameStatus.BREAK && controllers.breakTimer.isFinished) {
      handleAction("RESUME_MATCH");
    }
  }, [game?.status, controllers.breakTimer.isFinished]);

  // 4. Auto-stop when primary game/overtime timer finishes
  useEffect(() => {
    const isActuallyRunning = (game?.status === GameStatus.RUNNING || game?.status === GameStatus.OVERTIME) &&
      !(game?.isTimeStopped === 1 || (game?.isTimeStopped as any) === true);

    if (isActuallyRunning && activeTimer.isFinished) {
      handleAction("STOP_MATCH");
    }
  }, [game?.status, game?.isTimeStopped, activeTimer.isFinished]);

  // Command handlers - Mapped from State Machine Action IDs
  const handleAction = async (actionId: string, subType?: string) => {
    try {
      if (!game) return;

      switch (actionId) {
        case "START_MATCH":
          await startGame(game.id);
          controllers.gameTimer.start();
          break;
        case "STOP_MATCH":
          await stopGameTime(game.id);
          activeTimer.stop();
          break;
        case "RESUME_MATCH":
          await resumeGame(game.id);
          if (game.status === GameStatus.OVERTIME) {
            controllers.overtimeTimer.resume();
          } else {
            controllers.gameTimer.resume();
          }
          controllers.breakTimer.reset(game.gameMode.breakTime.seconds);
          break;
        case "START_BREAK":
          const breakSeconds = subType === "long-break" ? game.gameMode.breakTime.seconds : 5;
          await startBreak(game.id);
          controllers.breakTimer.startNew(breakSeconds);
          break;
        case "STOP_BREAK":
          controllers.breakTimer.stop();
          controllers.breakTimer.reset(game.gameMode.breakTime.seconds);
          await endBreak(game.id);
          break;
        case "START_OVERTIME":
          await startOvertime(game.id);
          controllers.overtimeTimer.start();
          break;
        default:
          console.warn("Unknown action", actionId);
      }

      // Sync State
      await loadGames();
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    }
  };

  // Referee Explicit Controls
  const handleScorePointLocally = (team: "A" | "B") => {
    if (game?.isTimeStopped !== 1 && (game?.isTimeStopped as any) !== true && game?.status !== GameStatus.BREAK) {
      Alert.alert("Error", "The match must be stopped to score a point");
      return;
    }
    if (team === "A") setScoreA((prev) => prev + 1);
    else setScoreB((prev) => prev + 1);
  };

  const handleUndoPointLocally = (team: "A" | "B") => {
    if (team === "A" && scoreA > 0) setScoreA((prev) => prev - 1);
    else if (team === "B" && scoreB > 0) setScoreB((prev) => prev - 1);
  };

  const handleOpenAdjustModal = () => {
    if (game?.isTimeStopped !== 1 && (game?.isTimeStopped as any) !== true && game?.status !== GameStatus.BREAK) {
      Alert.alert("Error", "You must stop the match time before adjusting settings.");
      return;
    }
    setShowAdjustModal(true);
  };

  const confirmAdjustModal = async (seconds: number, reason: string) => {
    try {
      await adjustTime(gameId as string, seconds, reason);
      setShowAdjustModal(false);
      await loadGames();
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    }
  };

  const confirmScoreValidation = async () => {
    try {
      await adjustScore(gameId as string, scoreA, scoreB, "Manual validation");
      await loadGames();
      setShowScoreValidationModal(false);

      if (game && (scoreA >= game.gameMode.raceTo.value || scoreB >= game.gameMode.raceTo.value)) {
        Alert.alert(
          "Target Score Reached!",
          `${scoreA > scoreB ? teamA?.name : teamB?.name} has reached the target score!`,
          [{ text: "OK", onPress: () => handleAction("STOP_MATCH") }]
        );
      }
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    }
  };

  // Render Loading Fallback
  if (!game || !fsmView) {
    return (
      <View style={[styles.container, styles.centerAll]}>
        <Text style={styles.loadingText}>Loading match...</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.fallbackButton}>
          <Text style={styles.fallbackButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Determine if we show explicit referee tools
  const canShowRefereeTools = (game.isTimeStopped === 1 || (game.isTimeStopped as any) === true) && game.status !== GameStatus.BREAK;
  const hasPendingScore = scoreA !== game.score.teamAScore || scoreB !== game.score.teamBScore;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.statusText}>{field?.name || "Match"}</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Extracted ScoreBoard */}
        <ScoreBoard
          teamAName={teamA?.name || "Team A"}
          teamBName={teamB?.name || "Team B"}
          scoreA={scoreA}
          scoreB={scoreB}
          gameModeName={game.gameMode.name}
        />

        {/* Extracted Timer Display */}
        <TimerDisplay
          status={game.status}
          isTimeStopped={game.isTimeStopped === 1 || (game.isTimeStopped as any) === true}
          formattedTime={activeTimer.formattedTime}
          onAdjustTime={canShowRefereeTools ? handleOpenAdjustModal : undefined}
        />

        {/* Referee Direct Scoring Buttons (shown only when stopped/break) */}
        {canShowRefereeTools && (
          <View style={styles.scoreButtons}>
            <View style={styles.teamControls}>
              <TouchableOpacity style={styles.scoreButton} onPress={() => handleScorePointLocally("A")}>
                <Text style={styles.scoreButtonText}>+1</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.undoButton} onPress={() => handleUndoPointLocally("A")}>
                <Text style={styles.undoButtonText}>-1</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.teamControls}>
              <TouchableOpacity style={styles.scoreButton} onPress={() => handleScorePointLocally("B")}>
                <Text style={styles.scoreButtonText}>+1</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.undoButton} onPress={() => handleUndoPointLocally("B")}>
                <Text style={styles.undoButtonText}>-1</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Main Interaction Buttons (Start, Stop, Validate...) */}
        <View style={{ paddingHorizontal: 16 }}>
          {hasPendingScore ? (
            <View style={{ gap: 12, marginBottom: 24 }}>
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: "#34C759" }]}
                onPress={() => setShowScoreValidationModal(true)}
              >
                <Text style={styles.primaryButtonText}>Validate Score</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: "#FF3B30" }]}
                onPress={() => { setScoreA(game.score.teamAScore); setScoreB(game.score.teamBScore); }}
              >
                <Text style={styles.primaryButtonText}>Cancel Changes</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <RefereeControls
              actions={fsmView.actions}
              onAction={handleAction}
            />
          )}

          {/* Explicit Finish Game Button */}
          {canShowRefereeTools && game.status !== GameStatus.FINISHED && (
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: Colors.error, marginTop: 12, marginHorizontal: 16 }]}
              onPress={() => {
                Alert.alert("End Match", "Are you sure you want to finalize this match?", [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "End", style: "destructive", onPress: async () => {
                      await finishGame(game.id, "MANUAL");
                      await loadGames();
                      router.back();
                    }
                  }
                ]);
              }}
            >
              <Text style={styles.primaryButtonText}>Finish Match</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Modals */}
        <ScoreValidationModal
          visible={showScoreValidationModal}
          scoreA={scoreA}
          scoreB={scoreB}
          teamAName={teamA?.name || "Team A"}
          teamBName={teamB?.name || "Team B"}
          onConfirm={confirmScoreValidation}
          onCancel={() => setShowScoreValidationModal(false)}
        />

        {showAdjustModal && (
          <AdjustModal
            visible={showAdjustModal}
            initialSeconds={activeTimer.remainingSeconds}
            onConfirm={confirmAdjustModal}
            onCancel={() => setShowAdjustModal(false)}
          />
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  centerAll: { justifyContent: "center", alignItems: "center" },
  loadingText: { color: Colors.white, fontSize: 18, marginBottom: 16 },
  fallbackButton: { backgroundColor: Colors.primary, padding: 16, borderRadius: 12 },
  fallbackButtonText: { color: Colors.white, fontWeight: "700" },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: { width: 80 },
  backText: { color: Colors.white, fontSize: 16, fontWeight: "600" },
  statusText: { color: Colors.white, fontSize: 18, fontWeight: "700" },
  content: { flex: 1 },
  scoreButtons: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  teamControls: { flex: 1, gap: 8 },
  scoreButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  scoreButtonText: { color: Colors.white, fontSize: 32, fontWeight: "800" },
  undoButton: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  undoButtonText: { color: Colors.text, fontSize: 16, fontWeight: "700" },
  primaryButton: {
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: { color: Colors.white, fontSize: 18, fontWeight: "700" },
});
