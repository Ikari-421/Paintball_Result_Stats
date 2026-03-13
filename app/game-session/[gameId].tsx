import { RefereeControls } from "@/components/game-session/RefereeControls";
import { ScoreBoard } from "@/components/game-session/ScoreBoard";
import { TimerDisplay } from "@/components/game-session/TimerDisplay";
import { AdjustModal } from "@/components/game-session/modals/AdjustModal";
import { FinishMatchModal } from "@/components/game-session/modals/FinishMatchModal";
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
    loadGameEvents,
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
  const [events, setEvents] = useState<any[]>([]);

  // Modals Visibility
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showScoreValidationModal, setShowScoreValidationModal] = useState(false);
  const [showFinishMatchModal, setShowFinishMatchModal] = useState(false);

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

  // 3. Auto-resume or Auto-start when Break timer finishes
  useEffect(() => {
    if (game?.status === GameStatus.BREAK && controllers.breakTimer.isFinished) {
      // If the game was never effectively started yet, we START_MATCH
      const isGameNotStartedYet = game.gameStateStatus === GameStatus.NOT_STARTED ||
        (game.timer.remainingTime === game.gameMode.gameTime.minutes * 60 &&
          game.score.teamAScore === 0 &&
          game.score.teamBScore === 0);

      // If the game regulation time is fully finished and we are NOT in overtime yet
      const isRegulationFinished = game.timer.remainingTime === 0 && game.gameStateStatus !== GameStatus.OVERTIME;

      if (isGameNotStartedYet) {
        handleAction("START_MATCH");
      } else if (isRegulationFinished) {
        // According to user request, we DO NOT auto-start overtime.
        // The break simply finishes. The user must click "Go to Overtime".
      } else {
        handleAction("RESUME_MATCH");
      }
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

  // 5. Fetch events if finished
  useEffect(() => {
    if (game?.status === GameStatus.FINISHED && events.length === 0) {
      loadGameEvents(game.id).then((fetchedEvents: any[]) => {
        setEvents(fetchedEvents);
      });
    }
  }, [game?.status]);

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
          // Overtime timer should not start directly; it requires a break first.
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
      if (!game) return;

      const currentScoreA = game.score.teamAScore;
      const currentScoreB = game.score.teamBScore;
      const diffA = scoreA - currentScoreA;
      const diffB = scoreB - currentScoreB;

      // Determine which action to take for a "clean" event recording
      if (diffA === 1 && diffB === 0) {
        // Simple +1 for Team A
        await scorePoint(game.id, game.matchup.teamA);
      } else if (diffA === 0 && diffB === 1) {
        // Simple +1 for Team B
        await scorePoint(game.id, game.matchup.teamB);
      } else if (diffA !== 0 || diffB !== 0) {
        // Complex modification or correction
        await adjustScore(game.id, scoreA, scoreB, "Manual validation");
      }

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

  const confirmFinishMatch = async (note?: string) => {
    try {
      if (game) {
        await finishGame(game.id, "MANUAL", note);
        setShowFinishMatchModal(false);
        await loadGames();
        router.back();
      }
    } catch (error) {
      Alert.alert("Error ending match", (error as Error).message);
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
  const canShowRefereeTools =
    game.status !== GameStatus.FINISHED &&
    ((game.isTimeStopped === 1 || (game.isTimeStopped as any) === true) && game.status !== GameStatus.BREAK);
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
          status={game.status}
        />

        {/* Extracted Timer Display */}
        {game.status !== GameStatus.FINISHED && (
          <TimerDisplay
            status={game.status}
            isTimeStopped={game.isTimeStopped === 1 || (game.isTimeStopped as any) === true}
            formattedTime={activeTimer.formattedTime}
            activeTimerType={fsmView.activeTimerType}
          />
        )}

        {/* Adjust Time Link */}
        {canShowRefereeTools && (
          <View style={{ alignItems: "center", marginBottom: 16 }}>
            <TouchableOpacity onPress={handleOpenAdjustModal} style={styles.adjustLink}>
              <Text style={styles.adjustLinkText}>Adjust time</Text>
            </TouchableOpacity>
          </View>
        )}

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
          {game.status !== GameStatus.FINISHED && (
            <>
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

              {/* Explicit Overtime / Finish Game Buttons */}
              {canShowRefereeTools && (
                <>
                  {game.timer.remainingTime === 0 && game.score.isTied() && (
                    <TouchableOpacity
                      style={[styles.primaryButton, { backgroundColor: Colors.primary, marginTop: 12, marginHorizontal: 16 }]}
                      onPress={() => handleAction("START_OVERTIME")}
                    >
                      <Text style={styles.primaryButtonText}>Go to Overtime</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.primaryButton, { backgroundColor: Colors.error, marginTop: 12, marginHorizontal: 16 }]}
                    onPress={() => setShowFinishMatchModal(true)}
                  >
                    <Text style={styles.primaryButtonText}>Finish Match</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}

          {/* Finished Match Summary */}
          {game.status === GameStatus.FINISHED && (
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Match Summary</Text>

              <View style={styles.summaryCard}>
                <Text style={styles.summarySubtitle}>Timeline & Events</Text>
                {events.length === 0 ? (
                  <Text style={styles.summaryText}>No events recorded.</Text>
                ) : (
                  events.map((evt: any, i: number) => {
                    const dateStr = new Date(evt.timestamp).toLocaleTimeString();
                    let desc = evt.type;
                    if (evt.type === "GameCreated") desc = "Game Initialized";
                    if (evt.type === "PointScored") {
                      const scorer = evt.payload.teamId === teamA?.id ? teamA?.name : teamB?.name;
                      desc = `Point Scored by ${scorer}`;
                    }
                    if (evt.type === "GameFinished") {
                      const note = evt.payload.note ? `\nNote: ${evt.payload.note}` : "";
                      desc = `Match Ended (${evt.payload.endReason})${note}`;
                    }

                    return (
                      <View key={i} style={styles.eventRow}>
                        <Text style={styles.eventTime}>{dateStr}</Text>
                        <Text style={styles.eventDesc}>{desc}</Text>
                      </View>
                    );
                  })
                )}
              </View>
            </View>
          )}
        </View>

        {/* Modals */}
        <ScoreValidationModal
          visible={showScoreValidationModal}
          scoreA={scoreA}
          scoreB={scoreB}
          currentScoreA={game?.score.teamAScore ?? 0}
          currentScoreB={game?.score.teamBScore ?? 0}
          teamAName={teamA?.name || "Team A"}
          teamBName={teamB?.name || "Team B"}
          onConfirm={confirmScoreValidation}
          onCancel={() => setShowScoreValidationModal(false)}
        />

        <FinishMatchModal
          visible={showFinishMatchModal}
          scoreA={scoreA}
          scoreB={scoreB}
          teamAName={teamA?.name || "Team A"}
          teamBName={teamB?.name || "Team B"}
          onConfirm={confirmFinishMatch}
          onCancel={() => setShowFinishMatchModal(false)}
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
  adjustLink: {
    padding: 8,
  },
  adjustLinkText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  summaryContainer: { marginTop: 24, marginHorizontal: 16, marginBottom: 40 },
  summaryTitle: { color: Colors.white, fontSize: 20, fontWeight: "700", marginBottom: 16 },
  summaryCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 16 },
  summarySubtitle: { color: Colors.text, fontSize: 16, fontWeight: "600", marginBottom: 12 },
  summaryText: { color: Colors.secondary, fontSize: 14, fontStyle: "italic" },
  eventRow: { flexDirection: "row", marginBottom: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: Colors.background },
  eventTime: { color: Colors.primary, fontWeight: "700", width: 80 },
  eventDesc: { color: Colors.text, flex: 1 },
});
