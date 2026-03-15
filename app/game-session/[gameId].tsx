import { ScoreBoard } from "@/components/game-session/ScoreBoard";
import { TimerDisplay } from "@/components/game-session/TimerDisplay";
import { AdjustModal } from "@/components/game-session/modals/AdjustModal";
import { FinishMatchModal } from "@/components/game-session/modals/FinishMatchModal";
import { OvertimePromptModal } from "@/components/game-session/modals/OvertimePromptModal";
import { NextMatchDetails, ScoreValidationModal } from "@/components/game-session/modals/ScoreValidationModal";
import { Colors } from "@/constants/theme";
import { useGameStateMachine } from "@/hooks/useGameStateMachine";
import { useMatchEndEvaluator } from "@/hooks/useMatchEndEvaluator";
import { GameStatus } from "@/src/core/domain/GameStatus";
import { useCoreStore } from "@/src/presentation/state/useCoreStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function MatchScreen() {
  const router = useRouter();
  const { gameId, autoStartBreak } = useLocalSearchParams<{ gameId: string, autoStartBreak?: string }>();
  const {
    games,
    createGame,
    teams,
    fields,
    gameModes,
    loadGames,
    loadGameEvents,
    startGame,
    stopGameTime,
    resumeGame,
    finishGame,
    startBreak,
    endBreak,
    swapSides,
    scorePoint,
    adjustTime,
    adjustScore,
    startOvertime,
  } = useCoreStore();

  const game = games.find((g) => g.id === gameId);
  const teamA = teams.find((t) => t.id === game?.matchup.teamA);
  const teamB = teams.find((t) => t.id === game?.matchup.teamB);
  const field = fields.find((f) => f.id === game?.fieldId);

  // Use our new State Machine Hook!
  const { view: fsmView, activeTimer, controllers } = useGameStateMachine(game);

  // Local state purely for Modals and temporary referee overrides
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [previousScoreA, setPreviousScoreA] = useState(0);
  const [previousScoreB, setPreviousScoreB] = useState(0);
  // Events state
  const [events, setEvents] = useState<any[]>([]);

  // Modals Visibility
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showScoreValidationModal, setShowScoreValidationModal] = useState(false);
  const [showFinishMatchModal, setShowFinishMatchModal] = useState(false);
  const [showOvertimePrompt, setShowOvertimePrompt] = useState(false);
  const [hasAutoStartedBreak, setHasAutoStartedBreak] = useState(false);

  // Centralised rule engine — replaces hasPromptedOvertime + effet 4.5
  const { modalToShow, resetEvaluator } = useMatchEndEvaluator(game, activeTimer, fsmView);

  const formatSeconds = (totalSeconds: number) => {
    const mins = Math.floor(Math.abs(totalSeconds) / 60);
    const secs = Math.abs(totalSeconds) % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Command handlers - Mapped from State Machine Action IDs
  const handleAction = useCallback(async (actionId: string, subType?: string) => {
    try {
      if (!game) return;

      switch (actionId) {
        case "START_MATCH":
          await startGame(game.id);
          controllers.gameTimer.start();
          controllers.breakTimer.reset(game.gameMode.breakTime.seconds);
          break;
        case "STOP_MATCH":
          await stopGameTime(game.id);
          activeTimer.stop();
          break;
        case "RESUME_MATCH":
          await resumeGame(game.id);
          if (game.isOvertime || game.status === GameStatus.OVERTIME) {
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
        case "SWAP_SIDES":
          await swapSides(game.id);
          break;
        default:
          console.warn("Unknown action", actionId);
      }

      // Sync State
      await loadGames();
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    }
  }, [game, startGame, controllers, stopGameTime, activeTimer, resumeGame, startBreak, endBreak, startOvertime, swapSides, loadGames]);

  // 1. Initial Load
  useEffect(() => {
    loadGames();
  }, [loadGames]);

  // 2. Sync Modals local state with DB Score when not actively editing
  useEffect(() => {
    if (game && !showScoreValidationModal) {
      setScoreA(game.score.teamAScore);
      setScoreB(game.score.teamBScore);
    }
  }, [game, showScoreValidationModal]);

  // 3. Auto-resume or Auto-start when Break timer finishes
  useEffect(() => {
    if (game?.status === GameStatus.BREAK && controllers.breakTimer.isFinished) {
      // If the game was never effectively started yet, we START_MATCH
      const isGameNotStartedYet = !game.isOvertime &&
        game.timer.remainingTime === game.gameMode.gameTime.minutes * 60 &&
        game.score.teamAScore === 0 &&
        game.score.teamBScore === 0;

      // If the game regulation time is fully finished and we are NOT in overtime yet
      const isRegulationFinished = game.timer.remainingTime === 0 && !game.isOvertime;

      if (isGameNotStartedYet) {
        handleAction("START_MATCH");
      } else if (isRegulationFinished) {
        // According to user request, we DO NOT auto-start overtime.
        // The break simply finishes. The user must click "Go to Overtime".
      } else {
        handleAction("RESUME_MATCH");
      }
    }
  }, [game, controllers.breakTimer.isFinished, handleAction]);

  // 4. Auto-stop when primary game/overtime timer finishes
  useEffect(() => {
    const isActuallyRunning = (game?.status === GameStatus.RUNNING || game?.status === GameStatus.OVERTIME) &&
      !(game?.isTimeStopped === 1 || (game?.isTimeStopped as any) === true);

    if (isActuallyRunning && activeTimer.isFinished) {
      handleAction("STOP_MATCH");
    }
  }, [game, activeTimer.isFinished, handleAction]);

  // 4.5. Consume the centralised rule engine decision → open the right modal
  useEffect(() => {
    if (modalToShow === "OVERTIME_PROMPT") {
      setShowOvertimePrompt(true);
    } else if (modalToShow === "FINISH_MATCH") {
      setShowFinishMatchModal(true);
    }
  }, [modalToShow]);

  // 5. Fetch events if finished
  useEffect(() => {
    if (game?.status === GameStatus.FINISHED && events.length === 0) {
      loadGameEvents(game.id).then((fetchedEvents: any[]) => {
        // Sort events chronologically based on timestamp
        setEvents(fetchedEvents.sort((a, b) => a.timestamp - b.timestamp));
      });
    }
  }, [game, events.length, loadGameEvents]);

  // 6. Auto-start break when navigating to a new matchup
  // Reset boolean when game id changes
  useEffect(() => {
    setHasAutoStartedBreak(false);
    setShowOvertimePrompt(false);
    // resetEvaluator is called automatically by its own gameId effect inside the hook
  }, [gameId]);

  useEffect(() => {
    if (autoStartBreak === 'true' && game?.status !== GameStatus.FINISHED && fsmView && !hasAutoStartedBreak) {
      setHasAutoStartedBreak(true);
      // Give it a tiny delay to ensure everything is mounted and timer states are clean
      setTimeout(() => {
        handleAction("START_BREAK", "long-break");
      }, 100);
      router.setParams({ autoStartBreak: "" });
    }
  }, [autoStartBreak, game?.status, fsmView, handleAction, hasAutoStartedBreak, router, gameId]);



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

  const getNextMatchDetails = useCallback((): NextMatchDetails | null => {
    if (!field || !games) return null;

    const fieldMatchups = field.matchups || [];
    const currentIndex = fieldMatchups.findIndex(m => m.id === game?.matchup.id);
    if (currentIndex === -1) return null;

    // Find the next matchup in the field's queue that hasn't been finished
    // Loop through the whole array starting from the next index
    for (let offset = 1; offset < fieldMatchups.length; offset++) {
      const i = (currentIndex + offset) % fieldMatchups.length;
      const m = fieldMatchups[i];
      const existingGame = games.find(g => g.matchup.id === m.id);

      // If there's no game yet, it's pending. If there is a game, make sure it's not finished.
      if (!existingGame || existingGame.status !== GameStatus.FINISHED) {
        const tA = teams.find(t => t.id === m.teamA)?.name || "Team A";
        const tB = teams.find(t => t.id === m.teamB)?.name || "Team B";
        const mode = gameModes.find(md => md.id === m.gameModeId);

        return {
          matchupId: m.id,
          teamAName: tA,
          teamBName: tB,
          scoreA: existingGame ? existingGame.score.teamAScore : 0,
          scoreB: existingGame ? existingGame.score.teamBScore : 0,
          gameModeName: mode?.name || "Unknown Mode",
          breakTimeSeconds: mode?.breakTime.seconds || 0,
        };
      }
    }

    return null;
  }, [field, games, game?.matchup.id, teams, gameModes]);

  const handleValidateScore = async () => {
    try {
      if (!game) return;

      const currentScoreA = game.score.teamAScore;
      const currentScoreB = game.score.teamBScore;

      setPreviousScoreA(currentScoreA);
      setPreviousScoreB(currentScoreB);

      const diffA = scoreA - currentScoreA;
      const diffB = scoreB - currentScoreB;

      if (diffA === 1 && diffB === 0) {
        await scorePoint(game.id, game.matchup.teamA);
      } else if (diffA === 0 && diffB === 1) {
        await scorePoint(game.id, game.matchup.teamB);
      } else if (diffA !== 0 || diffB !== 0) {
        await adjustScore(game.id, scoreA, scoreB, "Manual validation");
      }

      await loadGames();
      setShowScoreValidationModal(true);
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    }
  };

  const handleUndoValidation = async () => {
    try {
      if (!game) return;
      await adjustScore(game.id, previousScoreA, previousScoreB, "Undo validation");
      await loadGames();
      setScoreA(previousScoreA);
      setScoreB(previousScoreB);
      setShowScoreValidationModal(false);
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    }
  };

  const handleStartNextPhase = async (isOvertimeBreak: boolean = false) => {
    try {
      if (!game) return;
      setShowScoreValidationModal(false);
      setShowOvertimePrompt(false);
      resetEvaluator();

      const raceTo = game.gameMode.raceTo.value;
      const isOvertimePhase = game.status === GameStatus.OVERTIME || game.isOvertime;
      // En Overtime (Golden Point), tout point qui brise l'égalité = fin du match
      const isOvertimeWinner = isOvertimePhase && scoreA !== scoreB;
      const isRaceToWinner = raceTo > 0 && (scoreA >= raceTo || scoreB >= raceTo);
      const isAlreadyFinished = game.status === GameStatus.FINISHED;

      const isMatchOver = isAlreadyFinished || isOvertimeWinner || isRaceToWinner;
      const nextMatchDetails = getNextMatchDetails();
      const nextMatchupId = nextMatchDetails?.matchupId;

      // Persistance de la fin du match si nécessaire
      if (isMatchOver && !isAlreadyFinished) {
        await finishGame(game.id, "SCORE_LIMIT", isOvertimeWinner ? "Overtime Golden Point reached" : "Target score reached");
        await loadGames();
      }

      // Logique de Rotation Automatique (Priorité au match suivant s'il existe)
      if (nextMatchupId) {
        const nextGame = games.find(g => g.matchup.id === nextMatchupId);
        if (nextGame) {
          router.replace({ pathname: "/game-session/[gameId]", params: { gameId: nextGame.id, autoStartBreak: "true" } });
          return;
        } else if (field) {
          const nextMatchup = field.matchups.find(m => m.id === nextMatchupId);
          if (nextMatchup && nextMatchup.gameModeId) {
            const newGameId = await createGame({
              fieldId: field.id,
              matchupId: nextMatchup.id,
              teamAId: nextMatchup.teamA,
              teamBId: nextMatchup.teamB,
              matchupOrder: nextMatchup.order,
              gameModeId: nextMatchup.gameModeId,
            });
            await loadGames();
            router.replace({ pathname: "/game-session/[gameId]", params: { gameId: newGameId, autoStartBreak: "true" } });
            return;
          }
        }
      }

      // Si pas de match suivant :
      // - Si le match est fini -> Retour au terrain
      // - Sinon -> Lancement d'un break sur le match actuel
      if (isMatchOver) {
        router.replace(`/field/${field?.id}`);
      } else {
        await handleAction("START_BREAK", "long-break");
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
        resetEvaluator();
        await loadGames();
        // Navigate to next matchup or back to field
        await handleStartNextPhase();
      }
    } catch (error) {
      Alert.alert("Error ending match", (error as Error).message);
    }
  };

  const handleBackNavigation = () => {
    const isActuallyRunning = game && (game.status === GameStatus.RUNNING || game.status === GameStatus.OVERTIME || game.status === GameStatus.BREAK) &&
      !(game.isTimeStopped === 1 || (game.isTimeStopped as any) === true);

    if (isActuallyRunning) {
      Alert.alert(
        "Match Active",
        "You cannot leave this screen while the match or break timer is running. Please stop the timer first."
      );
      return;
    }
    router.back();
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
        <TouchableOpacity onPress={handleBackNavigation} style={styles.backButton}>
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
          areSidesSwapped={game.areSidesSwapped}
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

        {/* Referee Grid Controls */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          {game.status !== GameStatus.FINISHED && (
            <>
              {hasPendingScore ? (
                <View style={{ gap: 12 }}>
                  <TouchableOpacity
                    style={[styles.primaryButton, { backgroundColor: "#34C759", marginBottom: 0 }]}
                    onPress={handleValidateScore}
                  >
                    <Text style={styles.primaryButtonText}>Validate Score</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.primaryButton, { backgroundColor: "#FF3B30", marginBottom: 0 }]}
                    onPress={() => { setScoreA(game.score.teamAScore); setScoreB(game.score.teamBScore); }}
                  >
                    <Text style={styles.primaryButtonText}>Cancel Changes</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ gap: 8 }}>
                  {/* Top Row: Simple Link */}
                  {canShowRefereeTools && (
                    <TouchableOpacity
                      onPress={handleOpenAdjustModal}
                      style={styles.adjustTimerLink}
                    >
                      <Text style={styles.adjustTimerLinkText}>Adjust timer</Text>
                    </TouchableOpacity>
                  )}

                  {canShowRefereeTools && (
                    <View style={[styles.refereeGrid, { marginTop: 4 }]}>
                      {/* Left Column (Team according to swap) */}
                      <View style={styles.gridColumn}>
                        <Text style={styles.teamSideLabel} numberOfLines={1}>
                          {game.areSidesSwapped ? teamB?.name : teamA?.name}
                        </Text>
                        <TouchableOpacity
                          style={styles.gridButtonMain}
                          onPress={() => handleScorePointLocally(game.areSidesSwapped ? "B" : "A")}
                        >
                          <Text style={styles.gridButtonTextMain}>+1</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.gridButtonSecondary}
                          onPress={() => handleUndoPointLocally(game.areSidesSwapped ? "B" : "A")}
                        >
                          <Text style={styles.gridButtonTextSecondary}>-1</Text>
                        </TouchableOpacity>
                        {fsmView.actions.length === 2 && (
                          <TouchableOpacity
                            style={[styles.gridButtonAction, { backgroundColor: "#FF9500" }]}
                            onPress={() => handleAction(fsmView.actions[0].actionId, fsmView.actions[0].subType)}
                          >
                            <Text style={styles.gridButtonTextAction}>{fsmView.actions[0].label}</Text>
                          </TouchableOpacity>
                        )}
                      </View>

                      {/* Right Column (Team according to swap) */}
                      <View style={styles.gridColumn}>
                        <Text style={styles.teamSideLabel} numberOfLines={1}>
                          {game.areSidesSwapped ? teamA?.name : teamB?.name}
                        </Text>
                        <TouchableOpacity
                          style={styles.gridButtonMain}
                          onPress={() => handleScorePointLocally(game.areSidesSwapped ? "A" : "B")}
                        >
                          <Text style={styles.gridButtonTextMain}>+1</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.gridButtonSecondary}
                          onPress={() => handleUndoPointLocally(game.areSidesSwapped ? "A" : "B")}
                        >
                          <Text style={styles.gridButtonTextSecondary}>-1</Text>
                        </TouchableOpacity>
                        {fsmView.actions.length === 2 && (
                          <TouchableOpacity
                            style={[styles.gridButtonAction, { backgroundColor: "#FF9500" }]}
                            onPress={() => handleAction(fsmView.actions[1].actionId, fsmView.actions[1].subType)}
                          >
                            <Text style={styles.gridButtonTextAction}>{fsmView.actions[1].label}</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  )}

                  {/* Single Actions (like Stop Match) */}
                  {fsmView.actions.length === 1 && (
                    <TouchableOpacity
                      style={[styles.primaryButton, { backgroundColor: fsmView.actions[0].styleType === "danger" ? Colors.error : Colors.primary, marginTop: 12 }]}
                      onPress={() => handleAction(fsmView.actions[0].actionId, fsmView.actions[0].subType)}
                    >
                      <Text style={styles.primaryButtonText}>{fsmView.actions[0].label}</Text>
                    </TouchableOpacity>
                  )}

                  {/* Operational Settings (Switch Sides / Overtime) */}
                  {canShowRefereeTools && (
                    <View style={{ marginTop: 12 }}>
                      <TouchableOpacity
                        style={[styles.primaryButton, { backgroundColor: Colors.surface, borderWidth: 1, borderColor: "rgba(0,0,0,0.1)" }]}
                        onPress={() => handleAction("SWAP_SIDES")}
                      >
                        <Text style={[styles.primaryButtonText, { color: Colors.text }]}>Switch Sides</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.primaryButton, { backgroundColor: Colors.error }]}
                        onPress={() => setShowFinishMatchModal(true)}
                      >
                        <Text style={styles.primaryButtonText}>Finish Match</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
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
                  events
                    .filter((evt) => !["GameCreated", "GameStarted", "GameResumed", "GameTimeStopped"].includes(evt.type))
                    .map((evt: any, i: number) => {
                      let timePrefix = `[${formatSeconds(evt.gameTime || 0)}]`;
                      let desc = "";

                      switch (evt.type) {
                        case "PointScored":
                          const pointEnd = evt.payload.pointEndTime ?? evt.gameTime;
                          const pointStart = evt.payload.pointStartTime ?? pointEnd;

                          const s = formatSeconds(pointStart ?? 0);
                          const e = formatSeconds(pointEnd ?? 0);
                          const scorerName = evt.payload.teamId === teamA?.id ? teamA?.name : teamB?.name;

                          timePrefix = `[${e}]`;
                          if (pointStart !== pointEnd && pointStart !== undefined) {
                            timePrefix = `[${s} - ${e}]`;
                          }
                          desc = `Point ${scorerName} (${evt.payload.newScoreTeamA} - ${evt.payload.newScoreTeamB})`;
                          break;

                        case "SidesSwapped":
                          desc = "Sides Swapped";
                          break;

                        case "OvertimeStarted":
                          desc = "Golden Point Starting";
                          break;

                        case "TimerAdjusted":
                          desc = `Timer updated to ${formatSeconds(evt.payload.newTime ?? 0)}`;
                          break;

                        case "ScoreCorrected":
                          desc = `Score updated to ${evt.payload.newScoreTeamA} - ${evt.payload.newScoreTeamB}`;
                          break;

                        case "GameFinished":
                          desc = "Match Finished";
                          break;

                        default:
                          return null; // Skip unknown or technical events
                      }

                      const isCorrection = evt.type === "TimerAdjusted" || evt.type === "ScoreCorrected";

                      return (
                        <View key={i} style={styles.eventRow}>
                          <Text style={styles.eventTime}>{timePrefix}</Text>
                          <Text style={[styles.eventDesc, isCorrection && { fontStyle: "italic", opacity: 0.7 }]}>
                            {desc}
                          </Text>
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
          previousScoreA={previousScoreA}
          previousScoreB={previousScoreB}
          teamAName={teamA?.name || "Team A"}
          teamBName={teamB?.name || "Team B"}
          isMatchOver={
            !!game && (
              // Match over if race to reached
              (game.gameMode.raceTo.value > 0 && (scoreA >= game.gameMode.raceTo.value || scoreB >= game.gameMode.raceTo.value))
              ||
              // Match over if it's the overtime golden point (score no longer tied)
              ((game.status === GameStatus.OVERTIME || game.isOvertime) && scoreA !== scoreB)
            )
          }
          nextMatchDetails={getNextMatchDetails()}
          onStartBreak={handleStartNextPhase}
          onTechnicalTimeout={() => { setShowScoreValidationModal(false); resetEvaluator(); }}
          onUndo={handleUndoValidation}
        />

        <OvertimePromptModal
          visible={showOvertimePrompt}
          scoreA={scoreA}
          scoreB={scoreB}
          teamAName={teamA?.name || "Team A"}
          teamBName={teamB?.name || "Team B"}
          nextMatchDetails={getNextMatchDetails()}
          onStartOvertime={async () => {
            if (game) {
              await startOvertime(game.id);
              await handleStartNextPhase(true);
            }
          }}
          onFinishWithTie={async () => {
            if (game) {
              await finishGame(game.id, "SCORE_LIMIT", "Match ended in a tie");
              await handleStartNextPhase(true);
            }
          }}
          onTechnicalTimeout={() => { setShowOvertimePrompt(false); resetEvaluator(); }}
        />

        <FinishMatchModal
          visible={showFinishMatchModal}
          scoreA={scoreA}
          scoreB={scoreB}
          teamAName={teamA?.name || "Team A"}
          teamBName={teamB?.name || "Team B"}
          onConfirm={confirmFinishMatch}
          onCancel={() => { setShowFinishMatchModal(false); resetEvaluator(); }}
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
    paddingTop: 48, // Spacing.xxxl to match ScreenHeader
    paddingBottom: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: { width: 80 },
  backText: { color: Colors.white, fontSize: 16, fontWeight: "600" },
  statusText: { color: Colors.white, fontSize: 18, fontWeight: "700" },
  content: { flex: 1 },
  refereeGrid: {
    flexDirection: "row",
    gap: 12,
  },
  gridColumn: {
    flex: 1,
    gap: 10,
  },
  gridButtonMain: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gridButtonTextMain: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: "800",
  },
  gridButtonSecondary: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  gridButtonTextSecondary: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  gridButtonAction: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  gridButtonTextAction: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  teamSideLabel: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 4,
    opacity: 0.8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  scoreText: {
    fontSize: 72,
    fontWeight: "800",
    color: Colors.white,
    fontVariant: ["tabular-nums"],
  },
  scoreTextDark: {
    fontSize: 72,
    fontWeight: "800",
    color: Colors.text,
    fontVariant: ["tabular-nums"],
  },
  primaryButton: {
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: { color: Colors.white, fontSize: 18, fontWeight: "700" },
  adjustTimerLink: {
    alignItems: "center",
    paddingVertical: 4,
    marginBottom: 8,
  },
  adjustTimerLinkText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "700",
    textDecorationLine: "underline",
    opacity: 0.9,
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
