import { GameModeId } from '../GameMode';

export interface GameModeEvent {
    aggregateId: GameModeId;
    timestamp: number;
}

export interface GameModeCreatedEvent extends GameModeEvent {
    type: 'GameModeCreated';
    payload: {
        name: string;
        gameTimeMinutes: number;
        breakTimeSeconds: number;
        overtimeMinutes?: number;
        raceTo: number;
    };
}

export interface GameModeUpdatedEvent extends GameModeEvent {
    type: 'GameModeUpdated';
    payload: {
        name: string;
        gameTimeMinutes: number;
        breakTimeSeconds: number;
        overtimeMinutes?: number;
        raceTo: number;
    };
}

export interface GameModeDeletedEvent extends GameModeEvent {
    type: 'GameModeDeleted';
    payload: Record<string, never>;
}

export type DomainGameModeEvent =
    | GameModeCreatedEvent
    | GameModeUpdatedEvent
    | GameModeDeletedEvent;
