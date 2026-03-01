import { create } from "zustand";
import { Field, Matchup } from "../../core/domain/Field";
import { Game } from "../../core/domain/Game";
import { GameMode } from "../../core/domain/GameMode";
import { Team } from "../../core/domain/Team";

// Repositories
import {
  FieldRepository,
  GameModeRepository,
  GameRepository,
  TeamRepository,
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
  DeleteField,
  DeleteGameMode,
  DeleteTeam,
  FinishGame,
  PauseGame,
  ResumeGame,
  ScorePoint,
  StartGame,
  UpdateField,
  UpdateGameMode,
  UpdateTeam,
} from "../../core/useCases";

// Initialize repositories and event store
const teamRepository = new TeamRepository();
const fieldRepository = new FieldRepository();
const gameModeRepository = new GameModeRepository();
const gameRepository = new GameRepository();
const eventStore = new EventStore();

// Initialize use cases
const createTeamUseCase = new CreateTeam(teamRepository, eventStore);
const updateTeamUseCase = new UpdateTeam(teamRepository, eventStore);
const deleteTeamUseCase = new DeleteTeam(teamRepository, eventStore);
const createFieldUseCase = new CreateField(fieldRepository, eventStore);
const updateFieldUseCase = new UpdateField(fieldRepository, eventStore);
const deleteFieldUseCase = new DeleteField(fieldRepository, eventStore);
const createGameModeUseCase = new CreateGameMode(
  gameModeRepository,
  eventStore,
);
const updateGameModeUseCase = new UpdateGameMode(
  gameModeRepository,
  eventStore,
);
const deleteGameModeUseCase = new DeleteGameMode(
  gameModeRepository,
  eventStore,
);
const createGameUseCase = new CreateGame(
  gameRepository,
  gameModeRepository,
  fieldRepository,
  eventStore,
);
const startGameUseCase = new StartGame(gameRepository, eventStore);
const pauseGameUseCase = new PauseGame(gameRepository, eventStore);
const resumeGameUseCase = new ResumeGame(gameRepository, eventStore);
const finishGameUseCase = new FinishGame(gameRepository, eventStore);
const scorePointUseCase = new ScorePoint(gameRepository, eventStore);
const adjustTimeUseCase = new AdjustTime(gameRepository, eventStore);
const adjustScoreUseCase = new AdjustScore(gameRepository, eventStore);

interface CoreState {
  // State
  teams: Team[];
  fields: Field[];
  gameModes: GameMode[];
  games: Game[];
  isLoading: boolean;
  error: string | null;

  // Team Actions
  loadTeams: () => Promise<void>;
  createTeam: (name: string, isGuest?: boolean) => Promise<void>;
  updateTeam: (id: string, name: string, isGuest: boolean) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;

  // Field Actions
  loadFields: () => Promise<void>;
  createField: (name: string) => Promise<string>;
  updateField: (id: string, name: string) => Promise<void>;
  deleteField: (id: string) => Promise<void>;
  addMatchupToField: (
    fieldId: string,
    teamAId: string,
    teamBId: string,
    gameModeId: string,
  ) => Promise<void>;
  removeMatchupFromField: (fieldId: string, matchupId: string) => Promise<void>;

  // GameMode Actions
  loadGameModes: () => Promise<void>;
  createGameMode: (params: {
    name: string;
    gameTimeMinutes: number;
    breakTimeSeconds: number;
    timeOutsPerTeam: number;
    raceTo: number;
    overtimeMinutes?: number;
  }) => Promise<void>;
  updateGameMode: (params: {
    id: string;
    name: string;
    gameTimeMinutes: number;
    breakTimeSeconds: number;
    timeOutsPerTeam: number;
    raceTo: number;
    overtimeMinutes?: number;
  }) => Promise<void>;
  deleteGameMode: (id: string) => Promise<void>;

  // Game Actions
  loadGames: () => Promise<void>;
  createGame: (params: {
    fieldId: string;
    matchupId: string;
    teamAId: string;
    teamBId: string;
    matchupOrder: number;
    gameModeId: string;
  }) => Promise<string>;
<<<<<<< HEAD
=======
  startGame: (gameId: string) => Promise<void>;
  pauseGame: (gameId: string) => Promise<void>;
  resumeGame: (gameId: string) => Promise<void>;
  finishGame: (
    gameId: string,
    endReason: "SCORE_LIMIT" | "TIME_EXPIRED" | "MANUAL",
  ) => Promise<void>;
  scorePoint: (gameId: string, teamId: string) => Promise<void>;
  adjustTime: (
    gameId: string,
    newTime: number,
    reason: string,
  ) => Promise<void>;
  adjustScore: (
    gameId: string,
    teamAScore: number,
    teamBScore: number,
    reason: string,
  ) => Promise<void>;
  updateGameState: (
    gameId: string,
    stateData: {
      currentRound: number;
      isPaused: boolean;
      status: string;
    },
  ) => Promise<void>;
>>>>>>> 57e36f09b5c1f1c096f52b6b5d53da17436c9e10

  // Utility
  clearError: () => void;
}

export const useCoreStore = create<CoreState>((set, get) => ({
  // Initial state
  teams: [],
  fields: [],
  gameModes: [],
  games: [],
  isLoading: false,
  error: null,

  // Team Actions
  loadTeams: async () => {
    try {
      set({ isLoading: true, error: null });
      const teams = await teamRepository.findAll();
      set({ teams, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createTeam: async (name: string, isGuest = false) => {
    try {
      set({ isLoading: true, error: null });
      const id = `team-${Date.now()}`;
      await createTeamUseCase.execute(id, name, isGuest);
      await get().loadTeams();
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateTeam: async (id: string, name: string, isGuest: boolean) => {
    try {
      set({ isLoading: true, error: null });
      await updateTeamUseCase.execute(id, name, isGuest);
      await get().loadTeams();
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deleteTeam: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await deleteTeamUseCase.execute(id);
      await get().loadTeams();
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // Field Actions
  loadFields: async () => {
    try {
      console.log("[Store] loadFields - Début chargement");
      set({ isLoading: true, error: null });
      const fields = await fieldRepository.findAll();
      console.log(
        "[Store] loadFields - Fields chargés:",
        fields.length,
        fields,
      );
      set({ fields, isLoading: false });
    } catch (error) {
      console.error("[Store] loadFields - Erreur:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createField: async (name: string) => {
    try {
      console.log("[Store] createField - Début:", name);
      set({ isLoading: true, error: null });
      const id = `field-${Date.now()}`;
      console.log("[Store] createField - ID généré:", id);

      await createFieldUseCase.execute(id, name);
      console.log("[Store] createField - Use case exécuté");

      await get().loadFields();
      console.log("[Store] createField - Fields rechargés");

      return id;
    } catch (error) {
      console.error("[Store] createField - Erreur:", error);
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  updateField: async (id: string, name: string) => {
    try {
      set({ isLoading: true, error: null });
      await updateFieldUseCase.execute(id, name);
      await get().loadFields();
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deleteField: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await deleteFieldUseCase.execute(id);
      await get().loadFields();
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addMatchupToField: async (
    fieldId: string,
    teamAId: string,
    teamBId: string,
    gameModeId: string,
  ) => {
    try {
      console.log(
        "[Store] addMatchupToField - Début:",
        fieldId,
        teamAId,
        teamBId,
        gameModeId,
      );
      set({ isLoading: true, error: null });
      const field = await fieldRepository.findById(fieldId);
      if (!field) {
        console.error("[Store] addMatchupToField - Field non trouvé:", fieldId);
        throw new Error("Field not found");
      }
      console.log(
        "[Store] addMatchupToField - Field trouvé:",
        field.id,
        field.name,
      );

      const matchupId = `matchup-${Date.now()}`;
      const order = field.matchups.length;
<<<<<<< HEAD
      const matchup = Matchup.create(matchupId, teamAId, teamBId, order, gameModeId);
=======
      console.log(
        "[Store] addMatchupToField - Création matchup:",
        matchupId,
        "order:",
        order,
      );
      const matchup = Matchup.create(
        matchupId,
        teamAId,
        teamBId,
        order,
        gameModeId,
      );
>>>>>>> 57e36f09b5c1f1c096f52b6b5d53da17436c9e10
      const updatedField = field.addMatchup(matchup);
      console.log(
        "[Store] addMatchupToField - Field mis à jour, nombre de matchups:",
        updatedField.matchups.length,
      );

      await fieldRepository.save(updatedField);
      console.log("[Store] addMatchupToField - Field sauvegardé");

      await get().loadFields();
      console.log("[Store] addMatchupToField - Fields rechargés");
    } catch (error) {
      console.error("[Store] addMatchupToField - Erreur:", error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  removeMatchupFromField: async (fieldId: string, matchupId: string) => {
    try {
      set({ isLoading: true, error: null });
      const field = await fieldRepository.findById(fieldId);
      if (!field) throw new Error("Field not found");

      const updatedField = field.removeMatchup(matchupId);
      await fieldRepository.save(updatedField);
      await get().loadFields();
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // GameMode Actions
  loadGameModes: async () => {
    try {
      set({ isLoading: true, error: null });
      const gameModes = await gameModeRepository.findAll();
      set({ gameModes, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createGameMode: async (params) => {
    try {
      set({ isLoading: true, error: null });
      const id = `mode-${Date.now()}`;
      await createGameModeUseCase.execute({ id, ...params });
      await get().loadGameModes();
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateGameMode: async (params) => {
    try {
      set({ isLoading: true, error: null });
      await updateGameModeUseCase.execute(params);
      await get().loadGameModes();
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deleteGameMode: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await deleteGameModeUseCase.execute(id);
      await get().loadGameModes();
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // Game Actions
  loadGames: async () => {
    try {
      set({ isLoading: true, error: null });
      const games = await gameRepository.findAll();
      set({ games, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createGame: async (params) => {
    try {
      set({ isLoading: true, error: null });
      const id = `game-${Date.now()}`;
      console.log("[Store] createGame - ID généré:", id);
      await createGameUseCase.execute({ id, ...params });
      await get().loadGames();
<<<<<<< HEAD
      return id;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
=======
      console.log("[Store] createGame - Terminé, retour ID:", id);
      return id;
    } catch (error) {
      console.error("[Store] createGame - Erreur:", error);
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  startGame: async (gameId: string) => {
    try {
      set({ isLoading: true, error: null });
      await startGameUseCase.execute(gameId);
      await get().loadGames();
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  pauseGame: async (gameId: string) => {
    try {
      set({ isLoading: true, error: null });
      await pauseGameUseCase.execute(gameId);
      await get().loadGames();
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  resumeGame: async (gameId: string) => {
    try {
      set({ isLoading: true, error: null });
      await resumeGameUseCase.execute(gameId);
      await get().loadGames();
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  finishGame: async (
    gameId: string,
    endReason: "SCORE_LIMIT" | "TIME_EXPIRED" | "MANUAL",
  ) => {
    try {
      set({ isLoading: true, error: null });
      await finishGameUseCase.execute(gameId, endReason);
      await get().loadGames();
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  scorePoint: async (gameId: string, teamId: string) => {
    try {
      set({ isLoading: true, error: null });
      await scorePointUseCase.execute(gameId, teamId);
      await get().loadGames();
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  adjustTime: async (
    gameId: string,
    newTimeSeconds: number,
    reason: string,
  ) => {
    try {
      set({ isLoading: true, error: null });
      await adjustTimeUseCase.execute(gameId, newTimeSeconds, reason);
      await get().loadGames();
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  adjustScore: async (
    gameId: string,
    newScoreTeamA: number,
    newScoreTeamB: number,
    reason: string,
  ) => {
    try {
      set({ isLoading: true, error: null });
      await adjustScoreUseCase.execute(
        gameId,
        newScoreTeamA,
        newScoreTeamB,
        reason,
      );
      await get().loadGames();
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  updateGameState: async (
    gameId: string,
    stateData: {
      currentRound: number;
      isPaused: boolean;
      status: string;
    },
  ) => {
    try {
      console.log("[Store] updateGameState - Début:", gameId, stateData);
      const game = await gameRepository.findById(gameId);
      if (!game) {
        console.error("[Store] updateGameState - Game non trouvé:", gameId);
        throw new Error("Game not found");
      }

      // Mettre à jour le game avec les nouvelles données de state
      // Note: On utilise directement le repository pour mettre à jour les champs
      await gameRepository.updateGameState(gameId, stateData);
      console.log("[Store] updateGameState - GameState sauvegardé");

      // Pas besoin de recharger tous les games, juste mettre à jour localement
      const updatedGames = get().games.map((g) =>
        g.id === gameId ? { ...g, ...stateData } : g,
      );
      set({ games: updatedGames as Game[] });
    } catch (error) {
      console.error("[Store] updateGameState - Erreur:", error);
      set({ error: (error as Error).message });
>>>>>>> 57e36f09b5c1f1c096f52b6b5d53da17436c9e10
    }
  },

  // Utility
  clearError: () => set({ error: null }),
}));
