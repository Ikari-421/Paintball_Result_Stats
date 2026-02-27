import { FieldId } from '../Field';

export interface FieldEvent {
    aggregateId: FieldId;
    timestamp: number;
}

export interface FieldCreatedEvent extends FieldEvent {
    type: 'FieldCreated';
    payload: {
        name: string;
    };
}

export interface FieldUpdatedEvent extends FieldEvent {
    type: 'FieldUpdated';
    payload: {
        name: string;
    };
}

export interface MatchupAddedEvent extends FieldEvent {
    type: 'MatchupAdded';
    payload: {
        matchupId: string;
        teamA: string;
        teamB: string;
        order: number;
    };
}

export interface MatchupRemovedEvent extends FieldEvent {
    type: 'MatchupRemoved';
    payload: {
        matchupId: string;
    };
}

export interface FieldDeletedEvent extends FieldEvent {
    type: 'FieldDeleted';
    payload: Record<string, never>;
}

export type DomainFieldEvent =
    | FieldCreatedEvent
    | FieldUpdatedEvent
    | MatchupAddedEvent
    | MatchupRemovedEvent
    | FieldDeletedEvent;
