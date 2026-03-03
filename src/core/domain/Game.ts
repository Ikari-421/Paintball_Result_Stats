import { FieldId, Matchup } from "./Field";
import { GameMode } from "./GameMode";
import { GameStatus } from "./GameStatus";

export type GameId = string;

export class Score {
  constructor(
    public readonly teamAScore: number = 0,
    public readonly teamBScore: number = 0,
  ) {
    if (teamAScore < 0 || teamBScore < 0) {
      throw new Error("Score cannot be negative");
    }
  }

  incrementTeamA(): Score {
    return new Score(this.teamAScore + 1, this.teamBScore);
  }

  incrementTeamB(): Score {
    return new Score(this.teamAScore, this.teamBScore + 1);
  }

  isTied(): boolean {
    return this.teamAScore === this.teamBScore;
  }

  hasReachedLimit(limit: number): boolean {
    return this.teamAScore >= limit || this.teamBScore >= limit;
  }
}

export class GameTimer {
  constructor(
    public readonly remainingTime: number, // in seconds
    public readonly isRunning: boolean = false,
    public readonly endTimestamp: number | null = null,
  ) {
    if (remainingTime < 0) {
      throw new Error("Remaining time cannot be negative");
    }
  }

  start(): GameTimer {
    const endTimestamp = Date.now() + this.remainingTime * 1000;
    return new GameTimer(this.remainingTime, true, endTimestamp);
  }

  stop(): GameTimer {
    if (!this.isRunning || !this.endTimestamp) {
      return new GameTimer(this.remainingTime, false, null);
    }
    const newRemainingTime = Math.max(0, Math.floor((this.endTimestamp - Date.now()) / 1000));
    return new GameTimer(newRemainingTime, false, null);
  }

  updateTime(seconds: number): GameTimer {
    if (seconds < 0) {
      throw new Error("Time cannot be negative");
    }
    if (this.isRunning) {
      const newEndTimestamp = Date.now() + seconds * 1000;
      return new GameTimer(seconds, this.isRunning, newEndTimestamp);
    }
    return new GameTimer(seconds, this.isRunning, null);
  }

  isExpired(): boolean {
    return this.remainingTime === 0;
  }
}

export class Game {
  private constructor(
    public readonly id: GameId,
    public readonly fieldId: FieldId,
    public readonly matchup: Matchup,
    public readonly gameMode: GameMode,
    public readonly score: Score,
    public readonly timer: GameTimer,
    public readonly status: GameStatus,
    public readonly currentRound: number = 1,
    public readonly isTimeStopped: number = 0,
    public readonly gameStateStatus: string = GameStatus.NOT_STARTED,
  ) { }

  static create(
    id: GameId,
    fieldId: FieldId,
    matchup: Matchup,
    gameMode: GameMode,
  ): Game {
    if (!id || id.trim() === "") {
      throw new Error("Game ID cannot be empty");
    }

    const initialScore = new Score(0, 0);
    const initialTimer = new GameTimer(gameMode.gameTime.minutes * 60);

    return new Game(
      id,
      fieldId,
      matchup,
      gameMode,
      initialScore,
      initialTimer,
      GameStatus.NOT_STARTED,
      1, // currentRound
      0, // isTimeStopped
      GameStatus.NOT_STARTED, // gameStateStatus
    );
  }

  start(): Game {
    if (this.status !== GameStatus.NOT_STARTED) {
      throw new Error("Game can only be started from NOT_STARTED status");
    }

    return new Game(
      this.id,
      this.fieldId,
      this.matchup,
      this.gameMode,
      this.score,
      this.timer.start(),
      GameStatus.RUNNING,
    );
  }

  stopTime(): Game {
    if (this.status !== GameStatus.RUNNING) {
      throw new Error("Game can only be stopped when RUNNING");
    }

    return new Game(
      this.id,
      this.fieldId,
      this.matchup,
      this.gameMode,
      this.score,
      this.timer.stop(),
      GameStatus.BREAK,
    );
  }

  resume(): Game {
    if (this.status !== GameStatus.BREAK) {
      throw new Error("Game can only be resumed from BREAK status");
    }

    return new Game(
      this.id,
      this.fieldId,
      this.matchup,
      this.gameMode,
      this.score,
      this.timer.start(),
      GameStatus.RUNNING,
    );
  }

  finish(): Game {
    return new Game(
      this.id,
      this.fieldId,
      this.matchup,
      this.gameMode,
      this.score,
      this.timer.stop(),
      GameStatus.FINISHED,
    );
  }

  updateScore(newScore: Score): Game {
    if (this.status === GameStatus.RUNNING) {
      throw new Error("Cannot modify score while game is running");
    }

    return new Game(
      this.id,
      this.fieldId,
      this.matchup,
      this.gameMode,
      newScore,
      this.timer,
      this.status,
    );
  }

  updateTimer(newTimer: GameTimer): Game {
    if (this.status === GameStatus.RUNNING) {
      throw new Error("Cannot modify timer while game is running");
    }

    return new Game(
      this.id,
      this.fieldId,
      this.matchup,
      this.gameMode,
      this.score,
      newTimer,
      this.status,
    );
  }
}
