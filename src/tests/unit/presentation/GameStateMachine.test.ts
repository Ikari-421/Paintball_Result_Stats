import { Game } from "@/src/core/domain/Game";
import { BreakDuration, GameDuration, GameMode, OvertimeDuration, ScoreLimit } from "@/src/core/domain/GameMode";
import { BreakState, FinishedState, GameStateMachine, NotStartedState, OvertimeRunningState, RunningState, StoppedState } from "@/src/presentation/state/GameStateMachine";

describe("GameStateMachine", () => {
    const gameMode = GameMode.create(
        "gm-1",
        "Standard",
        new GameDuration(10),
        new BreakDuration(30),
        new ScoreLimit(5),
        new OvertimeDuration(5)
    );

    const matchup = {
        id: "m-1",
        teamA: "team-a",
        teamB: "team-b",
        order: 1,
        gameModeId: "gm-1"
    };

    it("should return null if game is undefined", () => {
        expect(GameStateMachine.getUIState(undefined)).toBeNull();
    });

    it("should return NotStartedState when game status is NOT_STARTED", () => {
        const game = Game.create("g-1", "f-1", matchup, gameMode);
        const state = GameStateMachine.getUIState(game);
        expect(state).toBeInstanceOf(NotStartedState);

        const view = state!.getView();
        expect(view.badgeLabel).toBe("NOT STARTED");
    });

    it("should return RunningState when game is running", () => {
        const game = Game.create("g-1", "f-1", matchup, gameMode).start();
        const state = GameStateMachine.getUIState(game);
        expect(state).toBeInstanceOf(RunningState);

        const view = state!.getView();
        expect(view.badgeLabel).toBe("RUNNING");
    });

    it("should return StoppedState when time is stopped", () => {
        const game = Game.create("g-1", "f-1", matchup, gameMode).start().stopTime();
        const state = GameStateMachine.getUIState(game);
        expect(state).toBeInstanceOf(StoppedState);

        const view = state!.getView();
        expect(view.badgeLabel).toBe("TIME STOPPED");
    });

    it("should return BreakState when in break", () => {
        const game = Game.create("g-1", "f-1", matchup, gameMode).start().startBreak();
        const state = GameStateMachine.getUIState(game);
        expect(state).toBeInstanceOf(BreakState);

        const view = state!.getView();
        expect(view.badgeLabel).toBe("BREAK");
    });

    it("should return FinishedState when finished", () => {
        const game = Game.create("g-1", "f-1", matchup, gameMode).finish();
        const state = GameStateMachine.getUIState(game);
        expect(state).toBeInstanceOf(FinishedState);

        const view = state!.getView();
        expect(view.badgeLabel).toBe("FINISHED");
    });

    it("should return OvertimeRunningState when in overtime and running", () => {
        // startOvertime() sets isTimeStopped to 1. We must resume() to see it as running OVERTIME.
        const game = Game.create("g-1", "f-1", matchup, gameMode).start().stopTime().startOvertime().resume();
        const state = GameStateMachine.getUIState(game);
        expect(state).toBeInstanceOf(OvertimeRunningState);

        const view = state!.getView();
        expect(view.badgeLabel).toBe("OVERTIME");
    });

    it("should return StoppedState when in overtime but stopped", () => {
        const game = Game.create("g-1", "f-1", matchup, gameMode).start().stopTime().startOvertime();
        const state = GameStateMachine.getUIState(game);
        expect(state).toBeInstanceOf(StoppedState);

        const view = state!.getView();
        expect(view.badgeLabel).toBe("TIME STOPPED");
        expect(view.activeTimerType).toBe("overtime");
    });
});
