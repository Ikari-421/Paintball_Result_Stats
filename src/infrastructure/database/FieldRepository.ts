import { Field, FieldId, Matchup } from '../../core/domain/Field';
import { IFieldRepository } from '../../core/ports/IFieldRepository';
import { db } from './initDb';

export class FieldRepository implements IFieldRepository {
    async save(field: Field): Promise<void> {
        db.runSync(
            'INSERT OR REPLACE INTO fields (id, name) VALUES (?, ?)',
            [field.id, field.name]
        );

        db.runSync('DELETE FROM matchups WHERE fieldId = ?', [field.id]);

        for (const matchup of field.matchups) {
            db.runSync(
                'INSERT INTO matchups (id, fieldId, teamA, teamB, orderIndex, gameModeId) VALUES (?, ?, ?, ?, ?, ?)',
                [matchup.id, field.id, matchup.teamA, matchup.teamB, matchup.order, matchup.gameModeId]
            );
        }
    }

    async findById(id: FieldId): Promise<Field | null> {
        const fieldRow = db.getFirstSync<{ id: string; name: string }>(
            'SELECT * FROM fields WHERE id = ?',
            [id]
        );

        if (!fieldRow) return null;

        const matchupRows = db.getAllSync<{
            id: string;
            teamA: string;
            teamB: string;
            orderIndex: number;
            gameModeId: string;
        }>('SELECT * FROM matchups WHERE fieldId = ? ORDER BY orderIndex', [id]);

        const matchups = matchupRows.map(row =>
            Matchup.create(row.id, row.teamA, row.teamB, row.orderIndex, row.gameModeId || 'unknown')
        );

        return Field.create(fieldRow.id, fieldRow.name, matchups);
    }

    async findAll(): Promise<Field[]> {
        const fieldRows = db.getAllSync<{ id: string; name: string }>('SELECT * FROM fields');

        const fields: Field[] = [];
        for (const fieldRow of fieldRows) {
            const matchupRows = db.getAllSync<{
                id: string;
                teamA: string;
                teamB: string;
                orderIndex: number;
                gameModeId: string;
            }>('SELECT * FROM matchups WHERE fieldId = ? ORDER BY orderIndex', [fieldRow.id]);

            const matchups = matchupRows.map(row =>
                Matchup.create(row.id, row.teamA, row.teamB, row.orderIndex, row.gameModeId || 'unknown')
            );

            fields.push(Field.create(fieldRow.id, fieldRow.name, matchups));
        }

        return fields;
    }

    async delete(id: FieldId): Promise<void> {
        db.runSync('DELETE FROM matchups WHERE fieldId = ?', [id]);
        db.runSync('DELETE FROM fields WHERE id = ?', [id]);
    }
}
