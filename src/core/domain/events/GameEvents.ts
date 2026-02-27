import { GameId } from '../Game';
import { TeamId } from '../Team';

export interface GameEvent {
    aggregateId: GameId;
    timestamp: number;
}

export interface GameCreatedEvent extends GameEvent {
    type: 'GameCreated';
    payload: {
        fieldId: string;
        matchupId: string;
        gameModeId: string;
    };
}

export interface GameStartedEvent extends GameEvent {
    type: 'GameStarted';
    payload: {
        startTime: number;
    };
}

export interface GamePausedEvent extends GameEvent {
    type: 'GamePaused';
    payload: {
        remainingTime: number;
    };
}

export interface GameResumedEvent extends GameEvent {
    type: 'GameResumed';
    payload: {
        remainingTime: number;
    };
}

export interface PointScoredEvent extends GameEvent {
    type: 'PointScored';
    payload: {
        teamId: TeamId;
        newScoreTeamA: number;
        newScoreTeamB: number;
    };
}

export interface ScoreCorrectedEvent extends GameEvent {
    type: 'ScoreCorrected';
    payload: {
        previousScoreTeamA: number;
        previousScoreTeamB: number;
        newScoreTeamA: number;
        newScoreTeamB: number;
        reason: string;
    };
}

export interface TimerAdjustedEvent extends GameEvent {
    type: 'TimerAdjusted';
    payload: {
        previousTime: number;
        newTime: number;
        reason: string;
    };
}

export interface OvertimeStartedEvent extends GameEvent {
    type: 'OvertimeStarted';
    payload: {
        overtimeDuration: number;
    };
}

export interface GameFinishedEvent extends GameEvent {
    type: 'GameFinished';
    payload: {
        finalScoreTeamA: number;
        finalScoreTeamB: number;
        winnerTeamId: TeamId | null;
        endReason: 'SCORE_LIMIT' | 'TIME_EXPIRED' | 'MANUAL';
    };
}

export type DomainGameEvent =
    | GameCreatedEvent
    | GameStartedEvent
    | GamePausedEvent
    | GameResumedEvent
    | PointScoredEvent
    | ScoreCorrectedEvent
    | TimerAdjustedEvent
    | OvertimeStartedEvent
    | GameFinishedEvent;
