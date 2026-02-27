import React, { createContext, useContext, useState, ReactNode } from "react";

interface TeamSelection {
  id: string;
  name: string;
}

interface GameModeSelection {
  id: string;
  name: string;
}

interface MatchupCreationContextType {
  teamA: TeamSelection | null;
  teamB: TeamSelection | null;
  gameMode: GameModeSelection | null;
  setTeamA: (team: TeamSelection | null) => void;
  setTeamB: (team: TeamSelection | null) => void;
  setGameMode: (mode: GameModeSelection | null) => void;
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
        setTeamA,
        setTeamB,
        setGameMode,
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
      "useMatchupCreation must be used within a MatchupCreationProvider"
    );
  }
  return context;
};
