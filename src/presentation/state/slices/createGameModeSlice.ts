import { StateCreator } from "zustand";
import { createGameModeUseCase, deleteGameModeUseCase, gameModeRepository, updateGameModeUseCase } from "../dependencies";
import { CoreState } from "../storeTypes";

export const createGameModeSlice: StateCreator<CoreState, [], [], Pick<CoreState, 'gameModes' | 'loadGameModes' | 'createGameMode' | 'updateGameMode' | 'deleteGameMode'>> = (set, get) => ({
    gameModes: [],

    loadGameModes: async () => {
        try {
            set({ isLoading: true, error: null });
            const gameModes = await gameModeRepository.findAll();
            set({ gameModes, isLoading: false });
            console.log("Game Modes loaded:", gameModes.length);
        } catch (error) {
            console.error("Error loading game modes:", error);
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    createGameMode: async (params) => {
        try {
            set({ isLoading: true, error: null });
            const id = `mode-${Date.now()}`;
            await createGameModeUseCase.execute({ id, ...params });
            await get().loadGameModes();
            console.log("Game Mode Created successfully");
        } catch (error) {
            console.error("Error creating game mode:", error);
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
});
