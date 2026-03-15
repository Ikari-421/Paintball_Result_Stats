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
    public readonly isOvertime: boolean = false,
    public readonly areSidesSwapped: boolean = false,
    public readonly pointStartTime: number = 0, // Remaining seconds when current point started
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
      1, // isTimeStopped (Match is stopped until started)
      false, // isOvertime
      false, // areSidesSwapped
      gameMode.gameTime.minutes * 60, // pointStartTime
    );
  }

  swapSides(): Game {
    return new Game(
      this.id,
      this.fieldId,
      this.matchup,
      this.gameMode,
      this.score,
      this.timer,
      this.status,
      this.currentRound,
      this.isTimeStopped,
      this.isOvertime,
      !this.areSidesSwapped,
      this.pointStartTime
    );
  }

  start(): Game {
    if (this.status !== GameStatus.NOT_STARTED && this.status !== GameStatus.BREAK && this.status !== GameStatus.TIME_STOPPED) {
      throw new Error(`Game can only be started from NOT_STARTED, BREAK, or TIME_STOPPED status. Current: ${this.status}`);
    }

    return new Game(
      this.id,
      this.fieldId,
      this.matchup,
      this.gameMode,
      this.score,
      this.timer.start(),
      GameStatus.RUNNING,
      this.currentRound,
      0, // isTimeStopped
      this.isOvertime,
      this.areSidesSwapped,
      this.pointStartTime
    );
  }

  startOvertime(): Game {
    if (
      this.status !== GameStatus.RUNNING &&
      this.status !== GameStatus.TIME_STOPPED &&
      this.status !== GameStatus.BREAK &&
      this.status !== GameStatus.OVERTIME
    ) {
      throw new Error(
        `Overtime can only be started from RUNNING, TIME_STOPPED, BREAK or OVERTIME, current status is ${this.status}`
      );
    }

    const overtimeSeconds = this.gameMode.overTime?.minutes ? this.gameMode.overTime.minutes * 60 : 300;
    // Create the overtime timer, but don't start it. It starts stopped so the referee initiates a break.
    const initialOvertimeTimer = new GameTimer(overtimeSeconds);

    return new Game(
      this.id,
      this.fieldId,
      this.matchup,
      this.gameMode,
      this.score,
      initialOvertimeTimer,
      GameStatus.OVERTIME,
      this.currentRound,
      1, // isTimeStopped. It requires a break to actually start!
      true, // isOvertime
      this.areSidesSwapped,
      overtimeSeconds // new point start time for overtime
    );
  }

  stopTime(): Game {
    if (this.status !== GameStatus.RUNNING && this.status !== GameStatus.OVERTIME) {
      throw new Error(`Game can only be stopped when RUNNING or OVERTIME, current status is ${this.status}`);
    }

    return new Game(
      this.id,
      this.fieldId,
      this.matchup,
      this.gameMode,
      this.score,
      this.timer.stop(),
      this.status,
      this.currentRound,
      1, // isTimeStopped
      this.isOvertime,
      this.areSidesSwapped,
      this.pointStartTime
    );
  }

  resume(): Game {
    if (this.status === GameStatus.NOT_STARTED) {
      throw new Error("Game must be started before it can be resumed");
    }

    if (!this.isTimeStopped) {
      throw new Error("Game can only be resumed when time is stopped");
    }

    const resumedStatus = this.status === GameStatus.BREAK
      ? (this.isOvertime ? GameStatus.OVERTIME : GameStatus.RUNNING)
      : this.status;

    return new Game(
      this.id,
      this.fieldId,
      this.matchup,
      this.gameMode,
      this.score,
      this.timer.start(),
      resumedStatus,
      this.currentRound,
      0, // isTimeStopped
      this.isOvertime,
      this.areSidesSwapped,
      this.pointStartTime
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
      this.currentRound,
      1, // isTimeStopped
      this.isOvertime,
      this.areSidesSwapped,
      this.pointStartTime
    );
  }

  startBreak(): Game {
    return new Game(
      this.id,
      this.fieldId,
      this.matchup,
      this.gameMode,
      this.score,
      this.timer,
      GameStatus.BREAK,
      this.currentRound,
      1, // The main game time is stopped!
      this.isOvertime,
      this.areSidesSwapped,
      this.pointStartTime
    );
  }

  endBreak(): Game {
    // After a break, return to the appropriate status based on whether we're in overtime or not.
    // If the game hasn't actually started yet (timer full, no score), stay NOT_STARTED.
    const hasStarted = this.timer.remainingTime < this.gameMode.gameTime.minutes * 60
      || this.score.teamAScore > 0
      || this.score.teamBScore > 0
      || this.isOvertime;

    const resolvedStatus = !hasStarted
      ? GameStatus.NOT_STARTED
      : this.isOvertime
        ? GameStatus.OVERTIME
        : GameStatus.RUNNING;

    return new Game(
      this.id,
      this.fieldId,
      this.matchup,
      this.gameMode,
      this.score,
      this.timer,
      resolvedStatus,
      this.currentRound,
      1,
      this.isOvertime,
      this.areSidesSwapped,
      this.pointStartTime
    );
  }

  updateScore(newScore: Score): Game {
    if (this.status === GameStatus.RUNNING || this.status === GameStatus.OVERTIME) {
      if (this.isTimeStopped !== 1 && (this.isTimeStopped as any) !== true) {
        throw new Error(`Cannot modify score while game timer is running (status: ${this.status})`);
      }
    }

    return new Game(
      this.id,
      this.fieldId,
      this.matchup,
      this.gameMode,
      newScore,
      this.timer,
      this.status,
      this.currentRound,
      this.isTimeStopped,
      this.isOvertime,
      this.areSidesSwapped,
      this.pointStartTime
    );
  }

  scorePoint(newScore: Score): Game {
    return new Game(
      this.id,
      this.fieldId,
      this.matchup,
      this.gameMode,
      newScore,
      this.timer,
      this.status,
      this.currentRound,
      this.isTimeStopped,
      this.isOvertime,
      this.areSidesSwapped,
      this.timer.remainingTime // Reset pointStartTime for the NEXT point
    );
  }

  updateTimer(newTimer: GameTimer): Game {
    if (this.status === GameStatus.RUNNING || this.status === GameStatus.OVERTIME) {
      if (this.isTimeStopped !== 1 && (this.isTimeStopped as any) !== true) {
        throw new Error(`Cannot modify timer while game timer is running (status: ${this.status})`);
      }
    }

    return new Game(
      this.id,
      this.fieldId,
      this.matchup,
      this.gameMode,
      this.score,
      newTimer,
      this.status,
      this.currentRound,
      this.isTimeStopped,
      this.isOvertime,
      this.areSidesSwapped,
      this.pointStartTime
    );
  }
}
