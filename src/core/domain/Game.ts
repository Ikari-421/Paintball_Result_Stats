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
  ) {
    if (remainingTime < 0) {
      throw new Error("Remaining time cannot be negative");
    }
  }

  start(): GameTimer {
    return new GameTimer(this.remainingTime, true);
  }

  pause(): GameTimer {
    return new GameTimer(this.remainingTime, false);
  }

  updateTime(seconds: number): GameTimer {
    if (seconds < 0) {
      throw new Error("Time cannot be negative");
    }
    return new GameTimer(seconds, this.isRunning);
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
  ) {}

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
    const initialTimer = new GameTimer(gameMode.gameTime.minutes * 60, false);

    return new Game(
      id,
      fieldId,
      matchup,
      gameMode,
      initialScore,
      initialTimer,
      GameStatus.NOT_STARTED,
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

  pause(): Game {
    if (this.status !== GameStatus.RUNNING) {
      throw new Error("Game can only be paused when RUNNING");
    }

    return new Game(
      this.id,
      this.fieldId,
      this.matchup,
      this.gameMode,
      this.score,
      this.timer.pause(),
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
      this.timer.pause(),
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
