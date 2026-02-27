import { FieldId, Matchup } from './Field';
import { GameMode } from './GameMode';
import { GameStatus } from './GameStatus';

export type GameId = string;

export class Score {
    constructor(
        public readonly teamAScore: number = 0,
        public readonly teamBScore: number = 0
    ) { }
}

export class GameTimer {
    constructor(
        public readonly remainingTime: number, // in milliseconds or seconds depending on implementation
        public readonly isRunning: boolean = false
    ) { }
}

export class Game {
    constructor(
        public readonly id: GameId,
        public readonly fieldId: FieldId,
        public readonly matchup: Matchup,
        public readonly gameMode: GameMode,
        public readonly score: Score,
        public readonly timer: GameTimer,
        public readonly status: GameStatus = GameStatus.NOT_STARTED
    ) { }
}
