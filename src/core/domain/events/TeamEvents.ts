import { TeamId } from '../Team';

export interface TeamEvent {
    aggregateId: TeamId;
    timestamp: number;
}

export interface TeamCreatedEvent extends TeamEvent {
    type: 'TeamCreated';
    payload: {
        name: string;
        isGuest: boolean;
    };
}

export interface TeamUpdatedEvent extends TeamEvent {
    type: 'TeamUpdated';
    payload: {
        name: string;
        isGuest: boolean;
    };
}

export interface TeamDeletedEvent extends TeamEvent {
    type: 'TeamDeleted';
    payload: Record<string, never>;
}

export type DomainTeamEvent = TeamCreatedEvent | TeamUpdatedEvent | TeamDeletedEvent;
