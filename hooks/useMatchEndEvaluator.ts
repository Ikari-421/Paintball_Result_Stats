import { Game } from "@/src/core/domain/Game";
import { GameStatus } from "@/src/core/domain/GameStatus";
import { useCallback, useEffect, useRef, useState } from "react";
import { TimerState } from "./useGameTimer";

export type MatchEndModal = "OVERTIME_PROMPT" | "FINISH_MATCH" | "NONE";

export interface MatchEndDecision {
    /** Which modal should be shown right now. NONE means no action needed. */
    modalToShow: MatchEndModal;
    /** Call this when the triggered modal has been acknowledged / closed. */
    resetEvaluator: () => void;
}

interface FsmViewLike {
    activeTimerType?: "game" | "overtime" | "break" | string;
}

/**
 * Centralised rule engine that decides which modal to show when a match
 * timer expires.
 *
 * Rules (in priority order):
 *  1. Timer (game OR overtime) just finished AND status ≠ FINISHED
 *     a. Score is tied  → OVERTIME_PROMPT  (loop: any number of overtimes)
 *     b. Not tied       → FINISH_MATCH
 *  2. Timer is running again (new overtime started, or match resumed)
 *     → reset internal trigger so it can fire again next time
 *
 * The caller is responsible for:
 *  - Showing / hiding the actual modals based on `modalToShow`
 *  - Calling `resetEvaluator()` once the modal has been handled
 */
export function useMatchEndEvaluator(
    game: Game | undefined,
    activeTimer: Pick<TimerState, "isFinished" | "isRunning">,
    fsmView: FsmViewLike | null | undefined
): MatchEndDecision {
    const [modalToShow, setModalToShow] = useState<MatchEndModal>("NONE");

    // Prevent firing the same event more than once per timer expiry
    const hasTriggeredRef = useRef(false);

    // --- Rule evaluation ---
    useEffect(() => {
        if (!game) return;

        const isGameOrOvertimeTimer =
            fsmView?.activeTimerType === "game" ||
            fsmView?.activeTimerType === "overtime";

        const timerJustFinished =
            activeTimer.isFinished &&
            isGameOrOvertimeTimer &&
            game.status !== GameStatus.FINISHED;

        if (timerJustFinished) {
            // Only trigger once per expiry cycle
            if (!hasTriggeredRef.current) {
                hasTriggeredRef.current = true;

                // Small delay so STOP_MATCH resolves in the DB first
                setTimeout(() => {
                    if (game.score.isTied()) {
                        setModalToShow("OVERTIME_PROMPT");
                    } else {
                        setModalToShow("FINISH_MATCH");
                    }
                }, 300);
            }
        } else if (!activeTimer.isFinished && activeTimer.isRunning) {
            // Timer is running again (new overtime, resumed match) → arm evaluator
            hasTriggeredRef.current = false;
            setModalToShow("NONE");
        }
    }, [
        // Intentionally fine-grained: only re-run when meaningful values change
        game?.status,
        game?.score.teamAScore,
        game?.score.teamBScore,
        activeTimer.isFinished,
        activeTimer.isRunning,
        fsmView?.activeTimerType,
    ]);

    // Reset when game changes (navigation to new matchup)
    useEffect(() => {
        hasTriggeredRef.current = false;
        setModalToShow("NONE");
    }, [game?.id]);

    const resetEvaluator = useCallback(() => {
        hasTriggeredRef.current = false;
        setModalToShow("NONE");
    }, []);

    return { modalToShow, resetEvaluator };
}
