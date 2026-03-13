import { BreakDuration, GameDuration, GameMode, GameModeId, OvertimeDuration, ScoreLimit } from '../../core/domain/GameMode';
import { IGameModeRepository } from '../../core/ports/IGameModeRepository';
import { db } from './initDb';

export class GameModeRepository implements IGameModeRepository {
    async save(gameMode: GameMode): Promise<void> {
        try {
            db.runSync(
                'INSERT OR REPLACE INTO game_modes (id, name, gameTimeMinutes, breakTimeSeconds, overtimeMinutes, raceTo) VALUES (?, ?, ?, ?, ?, ?)',
                [
                    gameMode.id,
                    gameMode.name,
                    gameMode.gameTime.minutes,
                    gameMode.breakTime.seconds,
                    gameMode.overTime?.minutes ?? null,
                    gameMode.raceTo.value
                ]
            );
            console.log(`[GameModeRepository] Saved game mode ${gameMode.id}`);
        } catch (e) {
            console.error(`[GameModeRepository] Error saving game mode ${gameMode.id}:`, e);
            throw e;
        }
    }

    async findById(id: GameModeId): Promise<GameMode | null> {
        const result = db.getFirstSync<{
            id: string;
            name: string;
            gameTimeMinutes: number;
            breakTimeSeconds: number;
            overtimeMinutes: number | null;
            raceTo: number;
        }>('SELECT * FROM game_modes WHERE id = ?', [id]);

        if (!result) return null;

        return GameMode.create(
            result.id,
            result.name,
            new GameDuration(result.gameTimeMinutes),
            new BreakDuration(result.breakTimeSeconds),
            new ScoreLimit(result.raceTo),
            result.overtimeMinutes ? new OvertimeDuration(result.overtimeMinutes) : undefined
        );
    }

    async findAll(): Promise<GameMode[]> {
        const results = db.getAllSync<{
            id: string;
            name: string;
            gameTimeMinutes: number;
            breakTimeSeconds: number;
            overtimeMinutes: number | null;
            raceTo: number;
        }>('SELECT * FROM game_modes');

        console.log(`[GameModeRepository] findAll returned ${results.length} rows`);

        return results.map(row => GameMode.create(
            row.id,
            row.name,
            new GameDuration(row.gameTimeMinutes),
            new BreakDuration(row.breakTimeSeconds),
            new ScoreLimit(row.raceTo),
            row.overtimeMinutes ? new OvertimeDuration(row.overtimeMinutes) : undefined
        ));
    }

    async delete(id: GameModeId): Promise<void> {
        db.runSync('DELETE FROM game_modes WHERE id = ?', [id]);
    }
}
