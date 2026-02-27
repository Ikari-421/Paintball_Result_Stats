export type GameModeId = string;

export class GameDuration {
  constructor(public readonly minutes: number) {
    if (minutes < 0) throw new Error("Game duration cannot be negative");
  }
}

export class BreakDuration {
  constructor(public readonly seconds: number) {
    if (seconds < 0) throw new Error("Break duration cannot be negative");
  }
}

export class TimeoutCount {
  constructor(public readonly quantity: number) {
    if (quantity < 0) throw new Error("Timeout count cannot be negative");
  }
}

export class ScoreLimit {
  constructor(public readonly value: number) {
    if (value <= 0) throw new Error("Score limit must be greater than zero");
  }
}

export class OvertimeDuration {
  constructor(public readonly minutes: number) {
    if (minutes < 0) throw new Error("Overtime duration cannot be negative");
  }
}

export class GameMode {
  private constructor(
    public readonly id: GameModeId,
    public readonly name: string,
    public readonly gameTime: GameDuration,
    public readonly breakTime: BreakDuration,
    public readonly overTime: OvertimeDuration | undefined,
    public readonly timeOutsPerTeam: TimeoutCount,
    public readonly raceTo: ScoreLimit,
  ) {}

  static create(
    id: GameModeId,
    name: string,
    gameTime: GameDuration,
    breakTime: BreakDuration,
    timeOutsPerTeam: TimeoutCount,
    raceTo: ScoreLimit,
    overTime?: OvertimeDuration,
  ): GameMode {
    if (!id || id.trim() === "") {
      throw new Error("GameMode ID cannot be empty");
    }
    if (!name || name.trim() === "") {
      throw new Error("GameMode name cannot be empty");
    }

    return new GameMode(
      id,
      name,
      gameTime,
      breakTime,
      overTime,
      timeOutsPerTeam,
      raceTo,
    );
  }
}
