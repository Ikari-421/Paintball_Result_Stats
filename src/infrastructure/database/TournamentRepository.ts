import { Tournament } from "../../core/domain/Tournament";
import { ITournamentRepository } from "../../core/ports/ITournamentRepository";
import { db } from "./initDb";

export class TournamentRepository implements ITournamentRepository {
    async save(tournament: Tournament): Promise<void> {
        db.runSync(
            "INSERT OR REPLACE INTO tournaments (id, name, location, startDate, endDate) VALUES (?, ?, ?, ?, ?)",
            [tournament.id, tournament.name, tournament.location, tournament.startDate.getTime(), tournament.endDate.getTime()]
        );
    }

    async findById(id: string): Promise<Tournament | null> {
        const row = db.getFirstSync<{ id: string; name: string; location: string; startDate: number; endDate: number }>(
            "SELECT * FROM tournaments WHERE id = ?",
            [id]
        );

        if (!row) return null;

        return Tournament.create(row.id, row.name, row.location, new Date(row.startDate), new Date(row.endDate));
    }

    async findAll(): Promise<Tournament[]> {
        const rows = db.getAllSync<{ id: string; name: string; location: string; startDate: number; endDate: number }>(
            "SELECT * FROM tournaments ORDER BY startDate DESC"
        );

        return rows.map((row) =>
            Tournament.create(row.id, row.name, row.location, new Date(row.startDate), new Date(row.endDate))
        );
    }

    async delete(id: string): Promise<void> {
        // Cascade delete: find all fields for this tournament
        const fieldRows = db.getAllSync<{ id: string }>("SELECT id FROM fields WHERE tournamentId = ?", [id]);
        for (const row of fieldRows) {
            db.runSync("DELETE FROM games WHERE fieldId = ?", [row.id]);
            db.runSync("DELETE FROM matchups WHERE fieldId = ?", [row.id]);
        }
        db.runSync("DELETE FROM fields WHERE tournamentId = ?", [id]);
        db.runSync("DELETE FROM tournaments WHERE id = ?", [id]);
    }
}
