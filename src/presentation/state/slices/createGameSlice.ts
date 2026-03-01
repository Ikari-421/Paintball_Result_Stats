import { StateCreator } from "zustand";
import { Game } from "../../../core/domain/Game";
import { adjustScoreUseCase, adjustTimeUseCase, createGameUseCase, finishGameUseCase, gameRepository, pauseGameUseCase, resumeGameUseCase, scorePointUseCase, startGameUseCase } from "../dependencies";
import { CoreState } from "../storeTypes";

export const createGameSlice: StateCreator<CoreState, [], [], Pick<CoreState, 'games' | 'loadGames' | 'createGame' | 'startGame' | 'pauseGame' | 'resumeGame' | 'finishGame' | 'scorePoint' | 'adjustTime' | 'adjustScore' | 'updateGameState'>> = (set, get) => ({
    games: [],

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
            return id;
        } catch (error) {
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

    finishGame: async (gameId: string, endReason) => {
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

    adjustTime: async (gameId: string, newTimeSeconds: number, reason: string) => {
        try {
            set({ isLoading: true, error: null });
            await adjustTimeUseCase.execute(gameId, newTimeSeconds, reason);
            await get().loadGames();
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
            throw error;
        }
    },

    adjustScore: async (gameId: string, newScoreTeamA: number, newScoreTeamB: number, reason: string) => {
        try {
            set({ isLoading: true, error: null });
            await adjustScoreUseCase.execute(gameId, newScoreTeamA, newScoreTeamB, reason);
            await get().loadGames();
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
            throw error;
        }
    },

    updateGameState: async (gameId: string, stateData) => {
        try {
            const game = await gameRepository.findById(gameId);
            if (!game) throw new Error("Game not found");

            await gameRepository.updateGameState(gameId, stateData);
            const updatedGames = get().games.map((g) =>
                g.id === gameId ? { ...g, ...stateData } : g,
            );
            set({ games: updatedGames as Game[] });
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },
});
