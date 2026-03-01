<<<<<<< HEAD
import { Field, FieldId, Matchup } from '../../core/domain/Field';
import { IFieldRepository } from '../../core/ports/IFieldRepository';
import { db } from './initDb';
=======
import { Field, FieldId, Matchup } from "../../core/domain/Field";
import { IFieldRepository } from "../../core/ports/IFieldRepository";
import { db } from "./initDb";
>>>>>>> 57e36f09b5c1f1c096f52b6b5d53da17436c9e10

export class FieldRepository implements IFieldRepository {
  async save(field: Field): Promise<void> {
    console.log(
      "[FieldRepository] save - Début:",
      field.id,
      field.name,
      "matchups:",
      field.matchups.length,
    );
    db.runSync("INSERT OR REPLACE INTO fields (id, name) VALUES (?, ?)", [
      field.id,
      field.name,
    ]);
    console.log("[FieldRepository] save - Field inséré dans DB");

    db.runSync("DELETE FROM matchups WHERE fieldId = ?", [field.id]);
    console.log("[FieldRepository] save - Anciens matchups supprimés");

<<<<<<< HEAD
        for (const matchup of field.matchups) {
            db.runSync(
                'INSERT INTO matchups (id, fieldId, teamA, teamB, orderIndex, gameModeId) VALUES (?, ?, ?, ?, ?, ?)',
                [matchup.id, field.id, matchup.teamA, matchup.teamB, matchup.order, matchup.gameModeId]
            );
        }
=======
    for (const matchup of field.matchups) {
      console.log(
        "[FieldRepository] save - Sauvegarde matchup:",
        matchup.id,
        "gameModeId:",
        matchup.gameModeId,
      );
      db.runSync(
        "INSERT INTO matchups (id, fieldId, teamA, teamB, orderIndex, gameModeId) VALUES (?, ?, ?, ?, ?, ?)",
        [
          matchup.id,
          field.id,
          matchup.teamA,
          matchup.teamB,
          matchup.order,
          matchup.gameModeId,
        ],
      );
    }
  }

  async findById(id: FieldId): Promise<Field | null> {
    const fieldRow = db.getFirstSync<{ id: string; name: string }>(
      "SELECT * FROM fields WHERE id = ?",
      [id],
    );

    if (!fieldRow) return null;

    const matchupRows = db.getAllSync<{
      id: string;
      teamA: string;
      teamB: string;
      orderIndex: number;
      gameModeId: string;
    }>("SELECT * FROM matchups WHERE fieldId = ? ORDER BY orderIndex", [id]);

    const matchups = matchupRows.map((row) =>
      Matchup.create(
        row.id,
        row.teamA,
        row.teamB,
        row.orderIndex,
        row.gameModeId,
      ),
    );

    return Field.create(fieldRow.id, fieldRow.name, matchups);
  }

  async findAll(): Promise<Field[]> {
    console.log("[FieldRepository] findAll - Début");
    const fieldRows = db.getAllSync<{ id: string; name: string }>(
      "SELECT * FROM fields",
    );
    console.log(
      "[FieldRepository] findAll - Fields trouvés:",
      fieldRows.length,
    );

    const fields: Field[] = [];
    for (const fieldRow of fieldRows) {
      console.log(
        "[FieldRepository] findAll - Chargement field:",
        fieldRow.id,
        fieldRow.name,
      );
      const matchupRows = db.getAllSync<{
        id: string;
        teamA: string;
        teamB: string;
        orderIndex: number;
        gameModeId: string;
      }>("SELECT * FROM matchups WHERE fieldId = ? ORDER BY orderIndex", [
        fieldRow.id,
      ]);

      const matchups = matchupRows.map((row) =>
        Matchup.create(
          row.id,
          row.teamA,
          row.teamB,
          row.orderIndex,
          row.gameModeId,
        ),
      );

      fields.push(Field.create(fieldRow.id, fieldRow.name, matchups));
>>>>>>> 57e36f09b5c1f1c096f52b6b5d53da17436c9e10
    }

    return fields;
  }

<<<<<<< HEAD
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
=======
  async delete(id: FieldId): Promise<void> {
    db.runSync("DELETE FROM matchups WHERE fieldId = ?", [id]);
    db.runSync("DELETE FROM fields WHERE id = ?", [id]);
  }
>>>>>>> 57e36f09b5c1f1c096f52b6b5d53da17436c9e10
}
