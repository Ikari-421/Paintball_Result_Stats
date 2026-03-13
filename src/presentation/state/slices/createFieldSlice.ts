import { StateCreator } from "zustand";
import { Matchup } from "../../../core/domain/Field";
import { createFieldUseCase, deleteFieldUseCase, fieldRepository, reorderMatchupsUseCase, updateFieldUseCase } from "../dependencies";
import { CoreState } from "../storeTypes";

export const createFieldSlice: StateCreator<CoreState, [], [], Pick<CoreState, 'fields' | 'loadFields' | 'createField' | 'updateField' | 'deleteField' | 'addMatchupToField' | 'removeMatchupFromField' | 'updateMatchupInField' | 'reorderMatchupsInField'>> = (set, get) => ({
    fields: [],

    loadFields: async () => {
        try {
            console.log("[Store] loadFields - Début chargement");
            set({ isLoading: true, error: null });
            const fields = await fieldRepository.findAll();
            console.log("[Store] loadFields - Fields chargés:", fields.length);
            set({ fields, isLoading: false });
        } catch (error) {
            console.error("[Store] loadFields - Erreur:", error);
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    createField: async (name: string, tournamentId: string) => {
        try {
            console.log("[Store] createField - Début:", name, tournamentId);
            set({ isLoading: true, error: null });
            const id = `field-${Date.now()}`;

            await createFieldUseCase.execute(id, tournamentId, name);
            await get().loadFields();

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
            throw error;
        }
    },

    addMatchupToField: async (fieldId: string, teamAId: string, teamBId: string, gameModeId: string) => {
        try {
            set({ isLoading: true, error: null });
            const field = await fieldRepository.findById(fieldId);
            if (!field) throw new Error("Field not found");

            const matchupId = `matchup-${Date.now()}`;
            const order = field.matchups.length;
            const matchup = Matchup.create(matchupId, teamAId, teamBId, order, gameModeId);
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

    updateMatchupInField: async (fieldId: string, matchupId: string, teamAId: string, teamBId: string, gameModeId: string) => {
        try {
            set({ isLoading: true, error: null });
            const field = await fieldRepository.findById(fieldId);
            if (!field) throw new Error("Field not found");

            const existingMatchup = field.matchups.find(m => m.id === matchupId);
            if (!existingMatchup) throw new Error("Matchup not found in field");

            const updatedMatchup = Matchup.create(matchupId, teamAId, teamBId, existingMatchup.order, gameModeId);
            const updatedField = field.updateMatchup(updatedMatchup);

            await fieldRepository.save(updatedField);
            await get().loadFields();
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    reorderMatchupsInField: async (fieldId: string, matchupIds: string[]) => {
        try {
            set({ isLoading: true, error: null });
            await reorderMatchupsUseCase.execute(fieldId, matchupIds);
            await get().loadFields();
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },
});
