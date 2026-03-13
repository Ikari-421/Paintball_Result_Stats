import { Game } from "@/src/core/domain/Game";
import { GameStatus } from "@/src/core/domain/GameStatus";

export type ActionStyle = "primary" | "secondary" | "warning" | "danger";

export interface ActionButton {
    label: string;
    actionId: string;
    styleType: ActionStyle;
    subType?: "long-break" | "short-break";
}

export interface GameStateView {
    badgeLabel: string;
    badgeColor: string;
    showDot: boolean;
    actions: ActionButton[];
    activeTimerType: "game" | "break" | "overtime";
}

export abstract class GameUIState {
    protected game: Game;

    constructor(game: Game) {
        this.game = game;
    }

    abstract getView(): GameStateView;
}

export class NotStartedState extends GameUIState {
    getView(): GameStateView {
        return {
            badgeLabel: "NOT STARTED",
            badgeColor: "#FF3B30",
            showDot: true,
            activeTimerType: "game",
            actions: [
                { label: `Break ${this.game.gameMode.breakTime.seconds}s`, actionId: "START_BREAK", subType: "long-break", styleType: "warning" },
                { label: "Break 5s", actionId: "START_BREAK", subType: "short-break", styleType: "warning" },
            ],
        };
    }
}

export class RunningState extends GameUIState {
    getView(): GameStateView {
        return {
            badgeLabel: "RUNNING",
            badgeColor: "#34C759",
            showDot: true,
            activeTimerType: "game",
            actions: [{ label: "Stop", actionId: "STOP_MATCH", styleType: "danger" }],
        };
    }
}

export class OvertimeRunningState extends GameUIState {
    getView(): GameStateView {
        return {
            badgeLabel: "OVERTIME",
            badgeColor: "#34C759",
            showDot: true,
            activeTimerType: "overtime",
            actions: [{ label: "Stop", actionId: "STOP_MATCH", styleType: "danger" }],
        };
    }
}

export class StoppedState extends GameUIState {
    getView(): GameStateView {
        let actions: ActionButton[] = [
            { label: `Break ${this.game.gameMode.breakTime.seconds}s`, actionId: "START_BREAK", subType: "long-break", styleType: "warning" },
            { label: "Break 5s", actionId: "START_BREAK", subType: "short-break", styleType: "warning" }
        ];

        return {
            badgeLabel: "TIME STOPPED",
            badgeColor: "#FF9500",
            showDot: true,
            activeTimerType: this.game.status === GameStatus.OVERTIME ? "overtime" : "game",
            actions,
        };
    }
}

export class BreakState extends GameUIState {
    getView(): GameStateView {
        return {
            badgeLabel: "BREAK",
            badgeColor: "#FF9500",
            showDot: true,
            activeTimerType: "break",
            actions: [{ label: "Stop", actionId: "STOP_BREAK", styleType: "danger" }],
        };
    }
}

export class FinishedState extends GameUIState {
    getView(): GameStateView {
        return {
            badgeLabel: "FINISHED",
            badgeColor: "#FF3B30",
            showDot: false,
            activeTimerType: "game",
            actions: [], // Once finished, no match controls except explicit logic
        };
    }
}

export class GameStateMachine {
    static getUIState(game: Game | undefined): GameUIState | null {
        if (!game) return null;

        if (game.status === GameStatus.NOT_STARTED) {
            return new NotStartedState(game);
        }

        if (game.status === GameStatus.FINISHED) {
            return new FinishedState(game);
        }

        if (game.status === GameStatus.BREAK) {
            return new BreakState(game);
        }

        if (game.isTimeStopped === 1 || (game.isTimeStopped as any) === true) {
            return new StoppedState(game);
        }

        if (game.status === GameStatus.OVERTIME) {
            return new OvertimeRunningState(game);
        }

        if (game.status === GameStatus.RUNNING) {
            return new RunningState(game);
        }

        return null;
    }
}
