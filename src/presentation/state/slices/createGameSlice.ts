import { StateCreator } from "zustand";
import { Game } from "../../../core/domain/Game";
import { adjustScoreUseCase, adjustTimeUseCase, createGameUseCase, endBreakUseCase, eventStore, finishGameUseCase, gameRepository, resumeGameUseCase, scorePointUseCase, startBreakUseCase, startGameUseCase, startOvertimeUseCase, stopGameTimeUseCase, swapSidesUseCase } from "../dependencies";
import { CoreState } from "../storeTypes";

export const createGameSlice: StateCreator<CoreState, [], [], Pick<CoreState, 'games' | 'loadGames' | 'loadGameEvents' | 'createGame' | 'startGame' | 'startOvertime' | 'stopGameTime' | 'resumeGame' | 'startBreak' | 'endBreak' | 'swapSides' | 'finishGame' | 'scorePoint' | 'adjustTime' | 'adjustScore' | 'updateGameState'>> = (set, get) => ({
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

    loadGameEvents: async (gameId: string) => {
        try {
            return await eventStore.getEvents(gameId);
        } catch (error) {
            console.error("Failed to load game events:", error);
            return [];
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

    startOvertime: async (gameId: string) => {
        try {
            set({ isLoading: true, error: null });
            await startOvertimeUseCase.execute(gameId);
            await get().loadGames();
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
            throw error;
        }
    },

    stopGameTime: async (gameId: string) => {
        await stopGameTimeUseCase.execute(gameId);
        await get().loadGames();
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

    finishGame: async (gameId: string, endReason, note?: string) => {
        try {
            set({ isLoading: true, error: null });
            await finishGameUseCase.execute(gameId, endReason, note);
            await get().loadGames();
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
            throw error;
        }
    },

    startBreak: async (gameId: string) => {
        try {
            set({ isLoading: true, error: null });
            await startBreakUseCase.execute(gameId);
            await get().loadGames();
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
            throw error;
        }
    },

    endBreak: async (gameId: string) => {
        try {
            set({ isLoading: true, error: null });
            await endBreakUseCase.execute(gameId);
            await get().loadGames();
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
            throw error;
        }
    },

    swapSides: async (gameId: string) => {
        try {
            set({ isLoading: true, error: null });
            await swapSidesUseCase.execute(gameId);
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
