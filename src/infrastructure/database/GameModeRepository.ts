import { IGameModeRepository } from '../../core/ports/IGameModeRepository';
import { GameMode, GameModeId, GameDuration, BreakDuration, OvertimeDuration, TimeoutCount, ScoreLimit } from '../../core/domain/GameMode';
import { db } from './initDb';

export class GameModeRepository implements IGameModeRepository {
    async save(gameMode: GameMode): Promise<void> {
        db.runSync(
            'INSERT OR REPLACE INTO game_modes (id, name, gameTimeMinutes, breakTimeSeconds, overtimeMinutes, timeOutsPerTeam, raceTo) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                gameMode.id,
                gameMode.name,
                gameMode.gameTime.minutes,
                gameMode.breakTime.seconds,
                gameMode.overTime?.minutes ?? null,
                gameMode.timeOutsPerTeam.quantity,
                gameMode.raceTo.value
            ]
        );
    }

    async findById(id: GameModeId): Promise<GameMode | null> {
        const result = db.getFirstSync<{
            id: string;
            name: string;
            gameTimeMinutes: number;
            breakTimeSeconds: number;
            overtimeMinutes: number | null;
            timeOutsPerTeam: number;
            raceTo: number;
        }>('SELECT * FROM game_modes WHERE id = ?', [id]);

        if (!result) return null;

        return GameMode.create(
            result.id,
            result.name,
            new GameDuration(result.gameTimeMinutes),
            new BreakDuration(result.breakTimeSeconds),
            new TimeoutCount(result.timeOutsPerTeam),
            new ScoreLimit(result.raceTo),
            result.overtimeMinutes !== null ? new OvertimeDuration(result.overtimeMinutes) : undefined
        );
    }

    async findAll(): Promise<GameMode[]> {
        const results = db.getAllSync<{
            id: string;
            name: string;
            gameTimeMinutes: number;
            breakTimeSeconds: number;
            overtimeMinutes: number | null;
            timeOutsPerTeam: number;
            raceTo: number;
        }>('SELECT * FROM game_modes');

        return results.map(row =>
            GameMode.create(
                row.id,
                row.name,
                new GameDuration(row.gameTimeMinutes),
                new BreakDuration(row.breakTimeSeconds),
                new TimeoutCount(row.timeOutsPerTeam),
                new ScoreLimit(row.raceTo),
                row.overtimeMinutes !== null ? new OvertimeDuration(row.overtimeMinutes) : undefined
            )
        );
    }

    async delete(id: GameModeId): Promise<void> {
        db.runSync('DELETE FROM game_modes WHERE id = ?', [id]);
    }
}
