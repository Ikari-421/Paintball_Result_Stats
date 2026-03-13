export enum CommandType {
    ADJUST_SCORE = 'ADJUST_SCORE',
    ADJUST_TIME = 'ADJUST_TIME',
    UNDO_LAST_POINT = 'UNDO_LAST_POINT'
}

export interface ArbitratorCommand {
    type: CommandType;
    gameId: string;
    timestamp: number;
    reason?: string;
}

export interface AdjustScoreCommand extends ArbitratorCommand {
    type: CommandType.ADJUST_SCORE;
    newScoreTeamA: number;
    newScoreTeamB: number;
}

export interface AdjustTimeCommand extends ArbitratorCommand {
    type: CommandType.ADJUST_TIME;
    newTimeSeconds: number;
}

export interface UndoLastPointCommand extends ArbitratorCommand {
    type: CommandType.UNDO_LAST_POINT;
}

export type Command = AdjustScoreCommand | AdjustTimeCommand | UndoLastPointCommand;

export class PendingCommand {
    constructor(
        public readonly command: Command,
        public readonly createdAt: number = Date.now()
    ) {}

    isExpired(timeoutMs: number = 300000): boolean {
        return Date.now() - this.createdAt > timeoutMs;
    }
}
