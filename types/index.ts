export interface Field {
  id: string;
  name: string;
}

export interface Team {
  id: string;
  name: string;
  color?: string;
}

export interface Match {
  id: string;
  fieldId: string;
  teamA: Team;
  teamB: Team;
  round: number;
  gameModeId?: string;
}

export interface GameMode {
  id: string;
  name: string;
  gameTime: number;
  timeOut: number;
  breakTime: number;
  rockTo?: number;
}

export interface GameScore {
  teamA: number;
  teamB: number;
  isRunning: boolean;
  currentTime: number;
  breakTime: number;
}
