import { Game } from "@/src/core/domain/Game";
import { GameStatus } from "@/src/core/domain/GameStatus";
import { GameStateMachine, GameStateView } from "@/src/presentation/state/GameStateMachine";
import { useEffect, useMemo } from "react";
import { useGameTimer } from "./useGameTimer";

export function useGameStateMachine(game: Game | undefined) {
    // We re-evaluate the state machine purely based on the current Game instance
    const uiState = useMemo(() => GameStateMachine.getUIState(game), [game]);
    const view: GameStateView | null = uiState ? uiState.getView() : null;

    // Initialize timers based on game rules
    const gameTimeSeconds = game?.gameMode.gameTime?.minutes ? game.gameMode.gameTime.minutes * 60 : 600;
    const breakTimeSeconds = game?.gameMode.breakTime?.seconds || 30;
    const overtimeSeconds = game?.gameMode.overTime?.minutes ? game.gameMode.overTime.minutes * 60 : 300;

    // The actual hooks for timers
    const gameTimer = useGameTimer(gameTimeSeconds);
    const breakTimer = useGameTimer(breakTimeSeconds);
    const overtimeTimer = useGameTimer(overtimeSeconds);

    // Sync the timers silently whenever DB game changes
    // MUST be a useEffect to avoid triggering state updates during render (infinite loop).
    useEffect(() => {
        if (!game) return;

        // The DB `timer` is ALWAYS the active game timer, NEVER the break timer.
        if (game.status === GameStatus.OVERTIME) {
            overtimeTimer.syncWithDB(game.timer.remainingTime, game.timer.isRunning, game.timer.endTimestamp || null);
        } else {
            gameTimer.syncWithDB(game.timer.remainingTime, game.timer.isRunning, game.timer.endTimestamp || null);
        }
    }, [
        game?.id,
        game?.status,
        game?.isTimeStopped,
        game?.timer.remainingTime,
        game?.timer.isRunning,
        game?.timer.endTimestamp
    ]);

    // Expose only the timer relevant to the current State, eliminating confusion in the UI
    const getActiveTimer = () => {
        if (!view) return gameTimer;
        if (view.activeTimerType === "break") return breakTimer;
        if (view.activeTimerType === "overtime") return overtimeTimer;
        return gameTimer;
    };

    const activeTimer = getActiveTimer();

    return {
        view,
        activeTimer,
        // We expose controllers for explicit commands
        controllers: {
            gameTimer,
            breakTimer,
            overtimeTimer
        }
    };
}
