import { Matchup } from "../../core/domain/Field";
import { Game, GameId, GameTimer, Score } from "../../core/domain/Game";
import {
    BreakDuration,
    GameDuration,
    GameMode,
    OvertimeDuration,
    ScoreLimit,
    TimeoutCount,
} from "../../core/domain/GameMode";
import { GameStatus } from "../../core/domain/GameStatus";
import { IGameRepository } from "../../core/ports/IGameRepository";
import { db } from "./initDb";

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
    console.log("[GameRepository] save - Début:", game.id);
    console.log("[GameRepository] save - Status:", game.status);
    console.log(
      "[GameRepository] save - Score:",
      game.score.teamAScore,
      "-",
      game.score.teamBScore,
    );

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
        game.status,
      ],
    );
    console.log("[GameRepository] save - Game inséré en DB");
  }

  async findById(id: GameId): Promise<Game | null> {
    const result = db.getFirstSync<GameRow>(
      "SELECT * FROM games WHERE id = ?",
      [id],
    );

    if (!result) return null;

    return this.mapRowToGame(result);
  }

  async findAll(): Promise<Game[]> {
    console.log("[GameRepository] findAll - Début");
    const results = db.getAllSync<GameRow>("SELECT * FROM games");
    console.log("[GameRepository] findAll - Games trouvés:", results.length);
    return results.map((row) => this.mapRowToGame(row));
  }

  async delete(id: GameId): Promise<void> {
    db.runSync("DELETE FROM games WHERE id = ?", [id]);
  }

  private mapRowToGame(row: GameRow): Game {
    const matchup = Matchup.create(
      row.matchupId,
      row.matchupTeamA,
      row.matchupTeamB,
      row.matchupOrder,
      row.gameModeId,
    );

    const gameMode = GameMode.create(
      row.gameModeId,
      row.gameModeName,
      new GameDuration(row.gameTimeMinutes),
      new BreakDuration(row.breakTimeSeconds),
      new TimeoutCount(row.timeOutsPerTeam),
      new ScoreLimit(row.raceTo),
      row.overtimeMinutes !== null
        ? new OvertimeDuration(row.overtimeMinutes)
        : undefined,
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
      row.status as GameStatus,
    );
  }
}
