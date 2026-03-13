import { DomainEvent, IEventStore } from '../../core/ports/IEventStore';
import { db } from '../database/initDb';

export class EventStore implements IEventStore {
    async append(event: DomainEvent): Promise<void> {
        db.runSync(
            'INSERT INTO events (aggregateId, type, payload, timestamp, gameTime) VALUES (?, ?, ?, ?, ?)',
            [event.aggregateId, event.type, JSON.stringify(event.payload), event.timestamp, (event as any).gameTime || 0]
        );
    }

    async getEvents(aggregateId: string): Promise<DomainEvent[]> {
        const results = db.getAllSync<{
            aggregateId: string;
            type: string;
            payload: string;
            timestamp: number;
            gameTime: number;
        }>('SELECT * FROM events WHERE aggregateId = ? ORDER BY timestamp ASC', [aggregateId]);

        return results.map(row => ({
            aggregateId: row.aggregateId,
            type: row.type,
            payload: JSON.parse(row.payload),
            timestamp: row.timestamp,
            gameTime: row.gameTime
        }));
    }

    async getAllEvents(): Promise<DomainEvent[]> {
        const results = db.getAllSync<{
            aggregateId: string;
            type: string;
            payload: string;
            timestamp: number;
            gameTime: number;
        }>('SELECT * FROM events ORDER BY timestamp ASC');

        return results.map(row => ({
            aggregateId: row.aggregateId,
            type: row.type,
            payload: JSON.parse(row.payload),
            timestamp: row.timestamp,
            gameTime: row.gameTime
        }));
    }
}
