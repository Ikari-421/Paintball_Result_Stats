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
  CreateField,
  CreateGame,
  CreateGameMode,
  CreateTeam,
  DeleteField,
  DeleteGameMode,
  DeleteTeam,
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
  createField: (name: string) => Promise<void>;
  updateField: (id: string, name: string) => Promise<void>;
  deleteField: (id: string) => Promise<void>;
  addMatchupToField: (
    fieldId: string,
    teamAId: string,
    teamBId: string,
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
  }) => Promise<void>;

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
      set({ isLoading: true, error: null });
      const fields = await fieldRepository.findAll();
      set({ fields, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createField: async (name: string) => {
    try {
      set({ isLoading: true, error: null });
      const id = `field-${Date.now()}`;
      await createFieldUseCase.execute(id, name);
      await get().loadFields();
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
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
  ) => {
    try {
      set({ isLoading: true, error: null });
      const field = await fieldRepository.findById(fieldId);
      if (!field) throw new Error("Field not found");

      const matchupId = `matchup-${Date.now()}`;
      const order = field.matchups.length;
      const matchup = Matchup.create(matchupId, teamAId, teamBId, order);
      const updatedField = field.addMatchup(matchup);

      await fieldRepository.save(updatedField);
      await get().loadFields();
    } catch (error) {
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
      await createGameUseCase.execute({ id, ...params });
      await get().loadGames();
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // Utility
  clearError: () => set({ error: null }),
}));
