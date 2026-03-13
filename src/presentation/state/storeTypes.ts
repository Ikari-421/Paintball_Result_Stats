import { Field } from "../../core/domain/Field";
import { Game } from "../../core/domain/Game";
import { GameMode } from "../../core/domain/GameMode";
import { Team } from "../../core/domain/Team";
import { Tournament } from "../../core/domain/Tournament";

export interface SharedState {
    isLoading: boolean;
    error: string | null;
    clearError: () => void;
}

export interface TeamState {
    teams: Team[];
    loadTeams: () => Promise<void>;
    createTeam: (name: string, isGuest?: boolean) => Promise<void>;
    updateTeam: (id: string, name: string, isGuest: boolean) => Promise<void>;
    deleteTeam: (id: string) => Promise<void>;
}

export interface FieldState {
    fields: Field[];
    loadFields: () => Promise<void>;
    createField: (name: string, tournamentId: string) => Promise<string>;
    updateField: (id: string, name: string) => Promise<void>;
    deleteField: (id: string) => Promise<void>;
    addMatchupToField: (
        fieldId: string,
        teamAId: string,
        teamBId: string,
        gameModeId: string,
    ) => Promise<void>;
    removeMatchupFromField: (fieldId: string, matchupId: string) => Promise<void>;
    updateMatchupInField: (
        fieldId: string,
        matchupId: string,
        teamAId: string,
        teamBId: string,
        gameModeId: string,
    ) => Promise<void>;
    reorderMatchupsInField: (fieldId: string, matchupIds: string[]) => Promise<void>;
}

export interface GameModeState {
    gameModes: GameMode[];
    loadGameModes: () => Promise<void>;
    createGameMode: (params: {
        name: string;
        gameTimeMinutes: number;
        breakTimeSeconds: number;
        raceTo: number;
        overtimeMinutes?: number;
    }) => Promise<void>;
    updateGameMode: (params: {
        id: string;
        name: string;
        gameTimeMinutes: number;
        breakTimeSeconds: number;
        raceTo: number;
        overtimeMinutes?: number;
    }) => Promise<void>;
    deleteGameMode: (id: string) => Promise<void>;
}

export interface GameState {
    games: Game[];
    loadGames: () => Promise<void>;
    loadGameEvents: (gameId: string) => Promise<any[]>;
    createGame: (params: {
        fieldId: string;
        matchupId: string;
        teamAId: string;
        teamBId: string;
        matchupOrder: number;
        gameModeId: string;
    }) => Promise<string>;
    startGame: (gameId: string) => Promise<void>;
    startOvertime: (gameId: string) => Promise<void>;
    stopGameTime: (gameId: string) => Promise<void>;
    resumeGame: (gameId: string) => Promise<void>;
    startBreak: (gameId: string) => Promise<void>;
    endBreak: (gameId: string) => Promise<void>;
    swapSides: (gameId: string) => Promise<void>;
    finishGame: (
        gameId: string,
        endReason: "SCORE_LIMIT" | "TIME_EXPIRED" | "MANUAL",
        note?: string,
    ) => Promise<void>;
    scorePoint: (gameId: string, teamId: string) => Promise<void>;
    adjustTime: (
        gameId: string,
        newTime: number,
        reason: string,
    ) => Promise<void>;
    adjustScore: (
        gameId: string,
        teamAScore: number,
        teamBScore: number,
        reason: string,
    ) => Promise<void>;
    updateGameState: (
        gameId: string,
        stateData: {
            currentRound: number;
            isTimeStopped: boolean;
            status: string;
        },
    ) => Promise<void>;
}

export interface TournamentState {
    tournaments: Tournament[];
    loadTournaments: () => Promise<void>;
    createTournament: (name: string, location: string, startDate: Date, endDate: Date) => Promise<string>;
    updateTournament: (id: string, name: string, location: string, startDate: Date, endDate: Date) => Promise<void>;
    deleteTournament: (id: string) => Promise<void>;
}

export type CoreState = SharedState &
    TeamState &
    FieldState &
    GameModeState &
    GameState &
    TournamentState;
