import { create } from "zustand";
import { CoreState } from "./storeTypes";

import { createFieldSlice } from "./slices/createFieldSlice";
import { createGameModeSlice } from "./slices/createGameModeSlice";
import { createGameSlice } from "./slices/createGameSlice";
import { createSharedSlice } from "./slices/createSharedSlice";
import { createTeamSlice } from "./slices/createTeamSlice";
import { createTournamentSlice } from "./slices/createTournamentSlice";

// Combine all slices into the main store
export const useCoreStore = create<CoreState>((...a) => ({
  ...createSharedSlice(...a),
  ...createTeamSlice(...a),
  ...createFieldSlice(...a),
  ...createGameModeSlice(...a),
  ...createGameSlice(...a),
  ...createTournamentSlice(...a),
}));


