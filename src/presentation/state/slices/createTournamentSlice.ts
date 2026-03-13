import { StateCreator } from "zustand";
import { createTournamentUseCase, deleteTournamentUseCase, tournamentRepository, updateTournamentUseCase } from "../dependencies";
import { CoreState } from "../storeTypes";

export const createTournamentSlice: StateCreator<CoreState, [], [], Pick<CoreState, 'tournaments' | 'loadTournaments' | 'createTournament' | 'updateTournament' | 'deleteTournament'>> = (set, get) => ({
    tournaments: [],

    loadTournaments: async () => {
        try {
            set({ isLoading: true, error: null });
            const tournaments = await tournamentRepository.findAll();
            set({ tournaments, isLoading: false });
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    createTournament: async (name: string, location: string, startDate: Date, endDate: Date) => {
        try {
            set({ isLoading: true, error: null });
            const id = `tournament-${Date.now()}`;
            await createTournamentUseCase.execute(id, name, location, startDate, endDate);
            await get().loadTournaments();
            return id;
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
            throw error;
        }
    },

    updateTournament: async (id: string, name: string, location: string, startDate: Date, endDate: Date) => {
        try {
            set({ isLoading: true, error: null });
            await updateTournamentUseCase.execute(id, name, location, startDate, endDate);
            await get().loadTournaments();
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
            throw error;
        }
    },

    deleteTournament: async (id: string) => {
        try {
            set({ isLoading: true, error: null });
            await deleteTournamentUseCase.execute(id);
            await get().loadTournaments();
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },
});
