import { StateCreator } from "zustand";
import { CoreState } from "../storeTypes";

export const createSharedSlice: StateCreator<CoreState, [], [], Pick<CoreState, 'isLoading' | 'error' | 'clearError'>> = (set) => ({
    isLoading: false,
    error: null,

    clearError: () => set({ error: null }),
});
