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

export class GameMode {
    constructor(
        public readonly id: GameModeId,
        public readonly name: string,
        public readonly gameTime: GameDuration,
        public readonly breakTime: BreakDuration,
        public readonly timeOutsPerTeam: TimeoutCount,
        public readonly raceTo: ScoreLimit
    ) { }
}
