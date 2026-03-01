// Repositories
import {
    FieldRepository,
    GameModeRepository,
    GameRepository,
    TeamRepository,
    TournamentRepository,
} from "../../infrastructure/database";
import { EventStore } from "../../infrastructure/eventStore";

// Use Cases
import {
    AdjustScore,
    AdjustTime,
    CreateField,
    CreateGame,
    CreateGameMode,
    CreateTeam,
    CreateTournament,
    DeleteField,
    DeleteGameMode,
    DeleteTeam,
    DeleteTournament,
    FinishGame,
    PauseGame,
    ResumeGame,
    ScorePoint,
    StartGame,
    UpdateField,
    UpdateGameMode,
    UpdateTeam,
    UpdateTournament,
} from "../../core/useCases";

// Initialize repositories and event store
export const teamRepository = new TeamRepository();
export const fieldRepository = new FieldRepository();
export const gameModeRepository = new GameModeRepository();
export const gameRepository = new GameRepository();
export const tournamentRepository = new TournamentRepository();
export const eventStore = new EventStore();

// Initialize use cases
export const createTeamUseCase = new CreateTeam(teamRepository, eventStore);
export const updateTeamUseCase = new UpdateTeam(teamRepository, eventStore);
export const deleteTeamUseCase = new DeleteTeam(teamRepository, eventStore);
export const createFieldUseCase = new CreateField(fieldRepository, eventStore);
export const updateFieldUseCase = new UpdateField(fieldRepository, eventStore);
export const deleteFieldUseCase = new DeleteField(fieldRepository, eventStore);
export const createGameModeUseCase = new CreateGameMode(
    gameModeRepository,
    eventStore,
);
export const updateGameModeUseCase = new UpdateGameMode(
    gameModeRepository,
    eventStore,
);
export const deleteGameModeUseCase = new DeleteGameMode(
    gameModeRepository,
    eventStore,
);
export const createGameUseCase = new CreateGame(
    gameRepository,
    gameModeRepository,
    fieldRepository,
    eventStore,
);
export const startGameUseCase = new StartGame(gameRepository, eventStore);
export const pauseGameUseCase = new PauseGame(gameRepository, eventStore);
export const resumeGameUseCase = new ResumeGame(gameRepository, eventStore);
export const finishGameUseCase = new FinishGame(gameRepository, eventStore);
export const scorePointUseCase = new ScorePoint(gameRepository, eventStore);
export const adjustTimeUseCase = new AdjustTime(gameRepository, eventStore);
export const adjustScoreUseCase = new AdjustScore(gameRepository, eventStore);
export const createTournamentUseCase = new CreateTournament(tournamentRepository, eventStore);
export const deleteTournamentUseCase = new DeleteTournament(tournamentRepository, eventStore);
export const updateTournamentUseCase = new UpdateTournament(tournamentRepository, eventStore);
