import { IGameRepository } from '../../core/ports/IGameRepository';
import { Game, GameId, Score, GameTimer } from '../../core/domain/Game';
import { GameStatus } from '../../core/domain/GameStatus';
import { Matchup } from '../../core/domain/Field';
import { GameMode, GameDuration, BreakDuration, OvertimeDuration, TimeoutCount, ScoreLimit } from '../../core/domain/GameMode';
import { db } from './initDb';

interface GameRow {
    id: string;
    fieldId: string;
    matchupId: string;
    matchupTeamA: string;
    matchupTeamB: string;
    matchupOrder: number;
    gameModeId: string;
    gameModeName: string;
    gameTimeMinutes: number;
    breakTimeSeconds: number;
    overtimeMinutes: number | null;
    timeOutsPerTeam: number;
    raceTo: number;
    teamAScore: number;
    teamBScore: number;
    remainingTime: number;
    timerIsRunning: number;
    status: string;
}

export class GameRepository implements IGameRepository {
    async save(game: Game): Promise<void> {
        db.runSync(
            `INSERT OR REPLACE INTO games (
                id, fieldId, matchupId, matchupTeamA, matchupTeamB, matchupOrder,
                gameModeId, gameModeName, gameTimeMinutes, breakTimeSeconds, overtimeMinutes,
                timeOutsPerTeam, raceTo, teamAScore, teamBScore, remainingTime, timerIsRunning, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                game.id,
                game.fieldId,
                game.matchup.id,
                game.matchup.teamA,
                game.matchup.teamB,
                game.matchup.order,
                game.gameMode.id,
                game.gameMode.name,
                game.gameMode.gameTime.minutes,
                game.gameMode.breakTime.seconds,
                game.gameMode.overTime?.minutes ?? null,
                game.gameMode.timeOutsPerTeam.quantity,
                game.gameMode.raceTo.value,
                game.score.teamAScore,
                game.score.teamBScore,
                game.timer.remainingTime,
                game.timer.isRunning ? 1 : 0,
                game.status
            ]
        );
    }

    async findById(id: GameId): Promise<Game | null> {
        const result = db.getFirstSync<GameRow>('SELECT * FROM games WHERE id = ?', [id]);

        if (!result) return null;

        return this.mapRowToGame(result);
    }

    async findAll(): Promise<Game[]> {
        const results = db.getAllSync<GameRow>('SELECT * FROM games');
        return results.map(row => this.mapRowToGame(row));
    }

    async delete(id: GameId): Promise<void> {
        db.runSync('DELETE FROM games WHERE id = ?', [id]);
    }

    private mapRowToGame(row: GameRow): Game {
        const matchup = Matchup.create(
            row.matchupId,
            row.matchupTeamA,
            row.matchupTeamB,
            row.matchupOrder
        );

        const gameMode = GameMode.create(
            row.gameModeId,
            row.gameModeName,
            new GameDuration(row.gameTimeMinutes),
            new BreakDuration(row.breakTimeSeconds),
            new TimeoutCount(row.timeOutsPerTeam),
            new ScoreLimit(row.raceTo),
            row.overtimeMinutes !== null ? new OvertimeDuration(row.overtimeMinutes) : undefined
        );

        const score = new Score(row.teamAScore, row.teamBScore);
        const timer = new GameTimer(row.remainingTime, row.timerIsRunning === 1);

        return new (Game as any)(
            row.id,
            row.fieldId,
            matchup,
            gameMode,
            score,
            timer,
            row.status as GameStatus
        );
    }
}
