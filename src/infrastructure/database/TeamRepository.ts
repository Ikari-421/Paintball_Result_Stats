import { ITeamRepository } from '../../core/ports/ITeamRepository';
import { Team, TeamId } from '../../core/domain/Team';
import { db } from './initDb';

export class TeamRepository implements ITeamRepository {
    async save(team: Team): Promise<void> {
        db.runSync(
            'INSERT OR REPLACE INTO teams (id, name, isGuest) VALUES (?, ?, ?)',
            [team.id, team.name, team.isGuest ? 1 : 0]
        );
    }

    async findById(id: TeamId): Promise<Team | null> {
        const result = db.getFirstSync<{ id: string; name: string; isGuest: number }>(
            'SELECT * FROM teams WHERE id = ?',
            [id]
        );

        if (!result) return null;

        return Team.create(result.id, result.name, result.isGuest === 1);
    }

    async findAll(): Promise<Team[]> {
        const results = db.getAllSync<{ id: string; name: string; isGuest: number }>(
            'SELECT * FROM teams'
        );

        return results.map(row => Team.create(row.id, row.name, row.isGuest === 1));
    }

    async delete(id: TeamId): Promise<void> {
        db.runSync('DELETE FROM teams WHERE id = ?', [id]);
    }
}
