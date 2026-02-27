export interface DomainEvent {
    aggregateId: string;
    type: string;
    payload: unknown;
    timestamp: number;
}

export interface IEventStore {
    append(event: DomainEvent): Promise<void>;
    getEvents(aggregateId: string): Promise<DomainEvent[]>;
    getAllEvents(): Promise<DomainEvent[]>;
}
