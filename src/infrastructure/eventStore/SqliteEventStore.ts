import { DomainEvent, IEventStore } from '../../core/ports/IEventStore';
import { db } from '../database/initDb';

export class SqliteEventStore implements IEventStore {
    async append(event: DomainEvent): Promise<void> {
        await db.runAsync(
            `INSERT INTO events (aggregateId, type, payload, timestamp) VALUES (?, ?, ?, ?)`,
            [event.aggregateId, event.type, JSON.stringify(event.payload), event.timestamp]
        );
    }

    async getEvents(aggregateId: string): Promise<DomainEvent[]> {
        const rawEvents = await db.getAllAsync<{ aggregateId: string, type: string, payload: string, timestamp: number }>(
            `SELECT * FROM events WHERE aggregateId = ? ORDER BY timestamp ASC`,
            [aggregateId]
        );

        return rawEvents.map(row => ({
            aggregateId: row.aggregateId,
            type: row.type,
            payload: JSON.parse(row.payload),
            timestamp: row.timestamp
        }));
    }

    async getAllEvents(): Promise<DomainEvent[]> {
        const rawEvents = await db.getAllAsync<{ aggregateId: string, type: string, payload: string, timestamp: number }>(
            `SELECT * FROM events ORDER BY timestamp ASC`
        );

        return rawEvents.map(row => ({
            aggregateId: row.aggregateId,
            type: row.type,
            payload: JSON.parse(row.payload),
            timestamp: row.timestamp
        }));
    }
}
