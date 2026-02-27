import { create } from 'zustand';
import { Field } from '../../core/domain/Field';
import { Game } from '../../core/domain/Game';
import { GameMode } from '../../core/domain/GameMode';
import { Team } from '../../core/domain/Team';

interface CoreState {
    games: Record<string, Game>;
    gameModes: Record<string, GameMode>;
    teams: Record<string, Team>;
    fields: Record<string, Field>;

    // Actions
    addGame: (game: Game) => void;
    addGameMode: (gameMode: GameMode) => void;
    addTeam: (team: Team) => void;
    addField: (field: Field) => void;
}

export const useCoreStore = create<CoreState>((set) => ({
    games: {},
    gameModes: {},
    teams: {},
    fields: {},

    addGame: (game) => set((state) => ({ games: { ...state.games, [game.id]: game } })),
    addGameMode: (gameMode) => set((state) => ({ gameModes: { ...state.gameModes, [gameMode.id]: gameMode } })),
    addTeam: (team) => set((state) => ({ teams: { ...state.teams, [team.id]: team } })),
    addField: (field) => set((state) => ({ fields: { ...state.fields, [field.id]: field } })),
}));
