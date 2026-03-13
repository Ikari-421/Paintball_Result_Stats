import { StateCreator } from "zustand";
import { createTeamUseCase, deleteTeamUseCase, teamRepository, updateTeamUseCase } from "../dependencies";
import { CoreState } from "../storeTypes";

export const createTeamSlice: StateCreator<CoreState, [], [], Pick<CoreState, 'teams' | 'loadTeams' | 'createTeam' | 'updateTeam' | 'deleteTeam'>> = (set, get) => ({
    teams: [],

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
});
