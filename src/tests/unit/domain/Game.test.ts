import { Matchup } from "../../../core/domain/Field";
import { Game, GameTimer, Score } from "../../../core/domain/Game";
import {
  BreakDuration,
  GameDuration,
  GameMode,
  ScoreLimit,
} from "../../../core/domain/GameMode";
import { GameStatus } from "../../../core/domain/GameStatus";

describe("Game", () => {
  let gameMode: GameMode;
  let matchup: Matchup;

  beforeEach(() => {
    gameMode = GameMode.create(
      "mode-1",
      "Quick Match",
      new GameDuration(10),
      new BreakDuration(30),
      new ScoreLimit(5),
    );

    matchup = Matchup.create("matchup-1", "team-a", "team-b", 1, "mode-1");
  });

  describe("Score", () => {
    it("should create a valid score", () => {
      const score = new Score(3, 2);
      expect(score.teamAScore).toBe(3);
      expect(score.teamBScore).toBe(2);
    });

    it("should throw error for negative scores", () => {
      expect(() => new Score(-1, 2)).toThrow("Score cannot be negative");
      expect(() => new Score(2, -1)).toThrow("Score cannot be negative");
    });

    it("should increment team A score", () => {
      const score = new Score(3, 2);
      const newScore = score.incrementTeamA();
      expect(newScore.teamAScore).toBe(4);
      expect(newScore.teamBScore).toBe(2);
    });

    it("should increment team B score", () => {
      const score = new Score(3, 2);
      const newScore = score.incrementTeamB();
      expect(newScore.teamAScore).toBe(3);
      expect(newScore.teamBScore).toBe(3);
    });

    it("should detect tied score", () => {
      const score = new Score(3, 3);
      expect(score.isTied()).toBe(true);
    });

    it("should detect non-tied score", () => {
      const score = new Score(3, 2);
      expect(score.isTied()).toBe(false);
    });

    it("should detect when limit is reached", () => {
      const score = new Score(5, 2);
      expect(score.hasReachedLimit(5)).toBe(true);
    });

    it("should detect when limit is not reached", () => {
      const score = new Score(3, 2);
      expect(score.hasReachedLimit(5)).toBe(false);
    });
  });

  describe("GameTimer", () => {
    it("should create a valid timer", () => {
      const timer = new GameTimer(600, false);
      expect(timer.remainingTime).toBe(600);
      expect(timer.isRunning).toBe(false);
    });

    it("should throw error for negative time", () => {
      expect(() => new GameTimer(-10, false)).toThrow(
        "Remaining time cannot be negative",
      );
    });

    it("should start timer", () => {
      const timer = new GameTimer(600, false);
      const started = timer.start();
      expect(started.isRunning).toBe(true);
    });

    it("should pause timer", () => {
      const timer = new GameTimer(600, true);
      const paused = timer.pause();
      expect(paused.isRunning).toBe(false);
    });

    it("should update time", () => {
      const timer = new GameTimer(600, false);
      const updated = timer.updateTime(300);
      expect(updated.remainingTime).toBe(300);
    });

    it("should detect expired timer", () => {
      const timer = new GameTimer(0, false);
      expect(timer.isExpired()).toBe(true);
    });

    it("should detect non-expired timer", () => {
      const timer = new GameTimer(100, false);
      expect(timer.isExpired()).toBe(false);
    });
  });

  describe("create", () => {
    it("should create a game with initial state", () => {
      const game = Game.create("game-1", "field-1", matchup, gameMode);

      expect(game.id).toBe("game-1");
      expect(game.fieldId).toBe("field-1");
      expect(game.status).toBe(GameStatus.NOT_STARTED);
      expect(game.score.teamAScore).toBe(0);
      expect(game.score.teamBScore).toBe(0);
      expect(game.timer.remainingTime).toBe(600); // 10 minutes * 60 seconds
      expect(game.timer.isRunning).toBe(false);
    });

    it("should throw error if id is empty", () => {
      expect(() => Game.create("", "field-1", matchup, gameMode)).toThrow(
        "Game ID cannot be empty",
      );
    });
  });

  describe("start", () => {
    it("should start a game from NOT_STARTED status", () => {
      const game = Game.create("game-1", "field-1", matchup, gameMode);
      const started = game.start();

      expect(started.status).toBe(GameStatus.RUNNING);
      expect(started.timer.isRunning).toBe(true);
    });

    it("should throw error if game is not in NOT_STARTED status", () => {
      const game = Game.create("game-1", "field-1", matchup, gameMode);
      const started = game.start();

      expect(() => started.start()).toThrow(
        "Game can only be started from NOT_STARTED status",
      );
    });
  });

  describe("pause", () => {
    it("should pause a running game", () => {
      const game = Game.create("game-1", "field-1", matchup, gameMode);
      const started = game.start();
      const paused = started.pause();

      expect(paused.status).toBe(GameStatus.BREAK);
      expect(paused.timer.isRunning).toBe(false);
    });

    it("should throw error if game is not running", () => {
      const game = Game.create("game-1", "field-1", matchup, gameMode);

      expect(() => game.pause()).toThrow(
        "Game can only be paused when RUNNING",
      );
    });
  });

  describe("resume", () => {
    it("should resume a paused game", () => {
      const game = Game.create("game-1", "field-1", matchup, gameMode);
      const started = game.start();
      const paused = started.pause();
      const resumed = paused.resume();

      expect(resumed.status).toBe(GameStatus.RUNNING);
      expect(resumed.timer.isRunning).toBe(true);
    });

    it("should throw error if game is not in BREAK status", () => {
      const game = Game.create("game-1", "field-1", matchup, gameMode);

      expect(() => game.resume()).toThrow(
        "Game can only be resumed from BREAK status",
      );
    });
  });

  describe("finish", () => {
    it("should finish a game", () => {
      const game = Game.create("game-1", "field-1", matchup, gameMode);
      const finished = game.finish();

      expect(finished.status).toBe(GameStatus.FINISHED);
      expect(finished.timer.isRunning).toBe(false);
    });
  });

  describe("updateScore", () => {
    it("should update score when game is not running", () => {
      const game = Game.create("game-1", "field-1", matchup, gameMode);
      const newScore = new Score(3, 2);
      const updated = game.updateScore(newScore);

      expect(updated.score.teamAScore).toBe(3);
      expect(updated.score.teamBScore).toBe(2);
    });

    it("should throw error when trying to update score while running", () => {
      const game = Game.create("game-1", "field-1", matchup, gameMode);
      const started = game.start();
      const newScore = new Score(3, 2);

      expect(() => started.updateScore(newScore)).toThrow(
        "Cannot modify score while game is running",
      );
    });
  });

  describe("updateTimer", () => {
    it("should update timer when game is not running", () => {
      const game = Game.create("game-1", "field-1", matchup, gameMode);
      const newTimer = new GameTimer(300, false);
      const updated = game.updateTimer(newTimer);

      expect(updated.timer.remainingTime).toBe(300);
    });

    it("should throw error when trying to update timer while running", () => {
      const game = Game.create("game-1", "field-1", matchup, gameMode);
      const started = game.start();
      const newTimer = new GameTimer(300, false);

      expect(() => started.updateTimer(newTimer)).toThrow(
        "Cannot modify timer while game is running",
      );
    });
  });
});
