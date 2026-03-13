import React, { createContext, ReactNode, useContext, useState } from "react";

interface TeamSelection {
  id: string;
  name: string;
}

interface GameModeSelection {
  id: string;
  name: string;
}

export interface TempMatchup {
  id: string;
  teamA: string;
  teamB: string;
  teamAName: string;
  teamBName: string;
  gameModeId: string; // Obligatoire - chaque matchup doit avoir un mode de jeu
  order: number;
}

interface MatchupCreationContextType {
  teamA: TeamSelection | null;
  teamB: TeamSelection | null;
  gameMode: GameModeSelection | null;
  tempMatchups: TempMatchup[];
  setTeamA: (team: TeamSelection | null) => void;
  setTeamB: (team: TeamSelection | null) => void;
  setGameMode: (mode: GameModeSelection | null) => void;
  addTempMatchup: (matchup: TempMatchup) => void;
  removeTempMatchup: (matchupId: string) => void;
  reorderTempMatchups: (matchups: TempMatchup[]) => void;
  clearTempMatchups: () => void;
  reset: () => void;
}

const MatchupCreationContext = createContext<
  MatchupCreationContextType | undefined
>(undefined);

interface MatchupCreationProviderProps {
  children: ReactNode;
}

export const MatchupCreationProvider = ({
  children,
}: MatchupCreationProviderProps) => {
  const [teamA, setTeamA] = useState<TeamSelection | null>(null);
  const [teamB, setTeamB] = useState<TeamSelection | null>(null);
  const [gameMode, setGameMode] = useState<GameModeSelection | null>(null);
  const [tempMatchups, setTempMatchups] = useState<TempMatchup[]>([]);

  const addTempMatchup = (matchup: TempMatchup) => {
    setTempMatchups((prev) => [...prev, matchup]);
  };

  const removeTempMatchup = (matchupId: string) => {
    setTempMatchups((prev) => prev.filter((m) => m.id !== matchupId));
  };

  const reorderTempMatchups = (matchups: TempMatchup[]) => {
    setTempMatchups(matchups);
  };

  const clearTempMatchups = () => {
    setTempMatchups([]);
  };

  const reset = () => {
    setTeamA(null);
    setTeamB(null);
    setGameMode(null);
  };

  return (
    <MatchupCreationContext.Provider
      value={{
        teamA,
        teamB,
        gameMode,
        tempMatchups,
        setTeamA,
        setTeamB,
        setGameMode,
        addTempMatchup,
        removeTempMatchup,
        reorderTempMatchups,
        clearTempMatchups,
        reset,
      }}
    >
      {children}
    </MatchupCreationContext.Provider>
  );
};

export const useMatchupCreation = () => {
  const context = useContext(MatchupCreationContext);
  if (context === undefined) {
    throw new Error(
      "useMatchupCreation must be used within a MatchupCreationProvider",
    );
  }
  return context;
};
